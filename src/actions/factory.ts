'use server';

import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';
import { AssemblyLineTask, FactoryService } from '@/services/game/FactoryService';
import { z } from 'zod';
import { headers } from 'next/headers';

const COST_SEK_PER_ACTIVE_STATION = 0.042;

/**
 * Represents the health and status of a single factory station.
 */
export type FactoryStatusData = {
    id: string;
    station: string;
    health: number;
    current: string | null;
    updatedAt: Date;
    metadata: any;
};

/**
 * Fetches the current status of all factory stations.
 * If the database is empty, it automatically seeds the default stations.
 * 
 * @returns {Promise<FactoryStatusData[]>} A list of status objects for all stations.
 */
export async function getFactoryStatus(): Promise<(FactoryStatusData & { costSEK?: number })[]> {
    try {
        let statuses: any[] = await prisma.factoryStatus.findMany({
            orderBy: { station: 'asc' },
        });

        if (statuses.length === 0) {
            statuses = await seedFactoryStatus();
        }

        const factoryDir = path.join(process.cwd(), '.agent/factory');
        const stationStatusFiles: { [key: string]: any } = {};

        try {
            const files = await fs.readdir(factoryDir);
            for (const file of files) {
                if (path.extname(file) === '.json') {
                    const stationName = path.basename(file, '.json');
                    const filePath = path.join(factoryDir, file);
                    try {
                        const fileContent = await fs.readFile(filePath, 'utf8');
                        stationStatusFiles[stationName] = JSON.parse(fileContent);
                    } catch (e: any) {
                        console.error(`Failed to read or parse status file ${filePath}:`, e);
                    }
                }
            }
        } catch (e: any) {
            // The factory directory might not exist, which is not a critical error.
            if (e.code !== 'ENOENT') {
                console.error('Failed to read factory status directory:', e);
            }
        }

        return statuses.map(s => {
            let current = s.current;
            let health = s.health;

            const stationFileData = stationStatusFiles[s.station];
            const dbMetadata = s.metadata as any;
            const activityData = stationFileData || dbMetadata;

            if (activityData && activityData.branch) {
                const isFailure = s.station === 'debug';
                const prefix = isFailure ? '🚨 CI FAIL:' : '⚙️ IN PROGRESS:';
                current = `${prefix} ${activityData.branch} (Run #${activityData.runId})`;
                health = isFailure ? 50 : 80;
            }

            return {
                ...s,
                current,
                health,
                costSEK: current ? COST_SEK_PER_ACTIVE_STATION : 0
            };
        });
    } catch (error) {
        console.error('Failed to fetch factory status:', error);
        return [];
    }
}

/**
 * Internal helper to verify authorization for sensitive factory operations.
 */
async function verifyFactoryAuth() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) return true;

    // Fallback for automation/scripts: check for a secret in headers
    const headerList = await headers();
    const secret = headerList.get('x-factory-secret') || headerList.get('x-cron-secret');
    const systemSecret = process.env.FACTORY_SECRET || process.env.CRON_SECRET;

    if (secret && systemSecret && secret === systemSecret) {
        return true;
    }

    return false;
}

/**
 * Updates the recovery status in the database.
 * This can be called from local scripts to sync local CI failures to the remote dashboard.
 */
export async function updateFactoryRecovery(data: any | null) {
    if (!(await verifyFactoryAuth())) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await prisma.factoryStatus.update({
            where: { station: 'recovery' },
            data: {
                metadata: data || null,
                health: data ? 50 : 100,
                updatedAt: new Date(),
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to update factory recovery:', error);
        return { success: false, error };
    }
}

/**
 * Fetches all recent factory tasks, primarily from external sources like Discord.
 */
export async function getFactoryTasks(): Promise<any[]> {
    if (!(await verifyFactoryAuth())) {
        throw new Error("Unauthorized");
    }
    try {
        return await prisma.factoryTask.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    } catch (error) {
        console.error('Failed to fetch factory tasks:', error);
        return [];
    }
}

/**
 * Adds a new task to the factory board.
 */
export async function addFactoryTask(description: string, source: string = 'DISCORD', metadata: any = {}) {
    if (!(await verifyFactoryAuth())) {
        return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const taskSchema = z.object({
        description: z.string().min(1).max(500),
        source: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
    });

    const result = taskSchema.safeParse({ description, source, metadata });
    if (!result.success) {
        return { success: false, error: 'Invalid task data', details: result.error.format() };
    }

    try {
        const task = await prisma.factoryTask.create({
            data: {
                description,
                source,
                metadata: metadata || {},
            }
        });
        return { success: true, task };
    } catch (error) {
        console.error('Failed to add factory task:', error);
        return { success: false, error };
    }
}

export async function getFactoryTasksAction() {
    return await getFactoryTasks();
}

export async function getFactoryStatusAction() {
    if (!(await verifyFactoryAuth())) {
        return { success: false, error: 'Unauthorized' };
    }
    return { success: true, stats: await getFactoryStatus() };
}

export async function getAssemblyLineTasksAction(): Promise<AssemblyLineTask[]> {
    if (!(await verifyFactoryAuth())) {
        throw new Error("Unauthorized");
    }
    return await FactoryService.getAssemblyLineTasks();
}

export async function getFactoryStatsAction() {
    if (!(await verifyFactoryAuth())) {
        return { success: false, error: 'Unauthorized' };
    }
    try {
        const { FactoryService } = await import("@/services/game/FactoryService");
        const stats = await FactoryService.getStats();

        // Count active tasks from the DB
        const activeTasks = await prisma.factoryTask.count({
            where: { status: "PENDING" }
        });

        return { success: true, stats: { ...stats, activeTasks } };
    } catch (error) {
        console.error("Failed to fetch factory stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}

export async function getBacklogItemsAction() {
    if (!(await verifyFactoryAuth())) {
        return { success: false, error: 'Unauthorized' };
    }
    try {
        const { BacklogService } = await import("@/services/game/BacklogService");
        const items = await BacklogService.getItems();
        return { success: true, items };
    } catch (error) {
        console.error("Failed to fetch backlog items:", error);
        return { success: false, error: "Failed to fetch backlog" };
    }
}

export async function startBacklogTaskAction(itemTitle: string, source: string) {
    // addFactoryTask already performs auth and validation checks
    try {
        return await addFactoryTask(
            itemTitle,
            'SYSTEM',
            { originalSource: source, type: 'BACKLOG_PROMOTION' }
        );
    } catch (error) {
        console.error("Failed to start backlog task:", error);
        return { success: false, error: "Failed to start task" };
    }
}

/**
 * Seeds the initial factory status data if the database is empty.
 */
async function seedFactoryStatus(): Promise<FactoryStatusData[]> {
    const stations = [
        'manager',
        'architect',
        'coder',
        'qa',
        'debug',
        'infrastructure',
        'security',
        'analyst',
        'ui-ux',
        'game-designer',
        'titan-coach',
        'librarian',
        'cleanup',
        'strategist',
        'writer',
        'polish',
        'perf',
        'platform'
    ];

    const upsertPromises = stations.map(station =>
        prisma.factoryStatus.upsert({
            where: { station },
            update: {},
            create: {
                station,
                health: 100,
                current: null,
            },
        })
    );

    const results = await Promise.all(upsertPromises);

    // Sort to ensure consistent order, mimicking the original `findMany` query.
    return results.sort((a, b) => a.station.localeCompare(b.station));
}

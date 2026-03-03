'use server';

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';
import { AssemblyLineTask, FactoryService } from '@/services/game/FactoryService';
import { FactoryTask } from '@prisma/client';

const COST_SEK_PER_ACTIVE_STATION = 0.042;

async function verifyFactoryAuth() {
    const supabase = await createClient();
    // Use getUser() for more secure/stable verification in E2E environments
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error("Factory Auth Error:", error.message);
        return false;
    }

    if (!user?.id) {
        console.warn("Factory Auth: No user session found");
        return false;
    }

    const isAuthorized = user.email?.endsWith("@ironforge.rpg") || user.email === 'alexander.teklemariam@gmail.com' || false;
    if (!isAuthorized) {
        console.warn(`Factory Auth: User ${user.email} not authorized for factory operations`);
    }

    return isAuthorized;
}

import { FactoryStatusData } from '@/lib/schemas/factory';


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
        const stationStatusFiles: Record<string, unknown> = {};

        try {
            const files = await fs.readdir(factoryDir);
            for (const file of files) {
                if (path.extname(file) === '.json') {
                    const stationName = path.basename(file, '.json');
                    const filePath = path.join(factoryDir, file);
                    try {
                        const fileContent = await fs.readFile(filePath, 'utf8');
                        stationStatusFiles[stationName] = JSON.parse(fileContent);
                    } catch (e: unknown) {
                        console.error(`Failed to read or parse status file ${filePath}:`, e);
                    }
                }
            }
        } catch (e: any) { // Prisma/FS error codes are often on 'any' but we can type narrow
            // The factory directory might not exist, which is not a critical error.
            if (e.code !== 'ENOENT') {
                console.error('Failed to read factory status directory:', e);
            }
        }

        return statuses.map(s => {
            let current = s.current;
            let health = s.health;

            const stationFileData = stationStatusFiles[s.station];
            const dbMetadata = s.metadata as Record<string, any> | null;
            const activityData = (stationFileData || dbMetadata) as Record<string, any> | null;

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
 * Updates the recovery status in the database.
 * This can be called from local scripts to sync local CI failures to the remote dashboard.
 */
export async function updateFactoryRecovery(data: Record<string, unknown> | null) {
    try {
        await prisma.factoryStatus.update({
            where: { station: 'recovery' },
            data: {
                metadata: (data as any) || null,
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
export async function getFactoryTasks(): Promise<FactoryTask[]> {
    try {
        const tasks = await prisma.factoryTask.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return tasks;
    } catch (error) {
        console.error('Failed to fetch factory tasks:', error);
        return [];
    }
}

/**
 * Adds a new task to the factory board.
 */
export async function addFactoryTask(description: string, source: string = 'DISCORD', metadata: Record<string, unknown> = {}) {
    try {
        const task = await prisma.factoryTask.create({
            data: {
                description,
                source,
                metadata: (metadata as any) || {},
            }
        });
        return { success: true, task };
    } catch (error) {
        console.error('Failed to add factory task:', error);
        return { success: false, error };
    }
}

export const getFactoryTasksAction = authActionClient.action(async () => {
    return await getFactoryTasks();
});

export const getFactoryStatusAction = authActionClient.action(async () => {
    return { success: true, stats: await getFactoryStatus() };
});

export const getAssemblyLineTasksAction = authActionClient.action(async (): Promise<AssemblyLineTask[]> => {
    return await FactoryService.getAssemblyLineTasks();
});

export const getLatestActiveRunAction = authActionClient.action(async (): Promise<AssemblyLineTask | null> => {
    if (!(await verifyFactoryAuth())) {
        return null;
    }
    const tasks = await FactoryService.getAssemblyLineTasks();
    return tasks.length > 0 ? tasks[0] : null;
});

export const getFactoryStatsAction = authActionClient.action(async () => {
    try {
        const { FactoryService } = await import("@/services/game/FactoryService");
        const stats = await FactoryService.getStats();

        const activeTasks = await prisma.factoryTask.count({
            where: { status: "PENDING" }
        });

        return { success: true, stats: { ...stats, activeTasks } };
    } catch (error) {
        console.error("Failed to fetch factory stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
});

export const getBacklogItemsAction = authActionClient.action(async () => {
    try {
        const { BacklogService } = await import("@/services/game/BacklogService");
        const items = await BacklogService.getItems();
        return { success: true, items };
    } catch (error) {
        console.error("Failed to fetch backlog items:", error);
        return { success: false, error: "Failed to fetch backlog" };
    }
});

export const startBacklogTaskAction = authActionClient
    .schema(z.object({ itemTitle: z.string(), source: z.string() }))
    .action(async ({ parsedInput: { itemTitle, source } }) => {
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
    });

export const addFactoryTaskAction = authActionClient
    .schema(z.object({ description: z.string(), source: z.string().default('WEB_UI'), metadata: z.any().default({}) }))
    .action(async ({ parsedInput: { description, source, metadata } }) => {
        return await addFactoryTask(description, source, metadata);
    });

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

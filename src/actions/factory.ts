'use server';

import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

/**
 * Represents the health and status of a single factory station.
 */
export type FactoryStatusData = {
    /** Unique identifier for the station status */
    id: string;
    /** The name of the station (e.g., 'design', 'fabrication') */
    station: string;
    /** Health percentage (0-100) */
    health: number;
    /** The current job or feature being processed, if any */
    current: string | null;
    /** Last update timestamp */
    updatedAt: Date;
};

/**
 * Fetches the current status of all factory stations.
 * If the database is empty, it automatically seeds the default stations.
 * 
 * @returns {Promise<FactoryStatusData[]>} A list of status objects for all stations.
 */
export async function getFactoryStatus(): Promise<(FactoryStatusData & { costSEK?: number })[]> {
    // Publicly accessible for now as requested

    try {
        const status = await prisma.factoryStatus.findMany({
            orderBy: { station: 'asc' },
        });

        // Check for CI Recovery status
        const recoveryPath = path.join(process.cwd(), '.agent/factory/recovery-status.json');
        let recoveryData = null;
        if (fs.existsSync(recoveryPath)) {
            try {
                recoveryData = JSON.parse(fs.readFileSync(recoveryPath, 'utf8'));
            } catch (e) {
                console.error('Failed to parse recovery status:', e);
            }
        }

        if (status.length === 0) {
            // Seed if empty
            await seedFactoryStatus();
            return await prisma.factoryStatus.findMany({ orderBy: { station: 'asc' } });
        }

        // Add dummy/calculated cost and update 'recovery' station if alert is active
        return status.map(s => {
            if (s.station === 'recovery' && recoveryData) {
                return {
                    ...s,
                    current: `🚨 CI FAIL: ${recoveryData.branch} (Run #${recoveryData.runId})`,
                    health: 50, // Degraded health if CI is failing
                    costSEK: 0
                };
            }
            return {
                ...s,
                costSEK: s.current ? 0.042 : 0 // Mock for now
            };
        });
    } catch (error) {
        console.error('Failed to fetch factory status:', error);
        return [];
    }
}

/**
 * Seedes the initial factory status data if the database is empty.
 * Uses upsert to ensure idempotency and prevent duplicate stations.
 * Default stations: 'design', 'fabrication', 'qc', 'scrap', 'ship'.
 * 
 * @returns {Promise<void>}
 */
async function seedFactoryStatus() {
    const stations = ['design', 'fabrication', 'qc', 'scrap', 'ship', 'recovery'];

    for (const station of stations) {
        await prisma.factoryStatus.upsert({
            where: { station },
            update: {},
            create: {
                station,
                health: 100,
                current: null,
            },
        });
    }
}

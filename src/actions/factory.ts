'use server';

import { prisma } from '@/lib/prisma';
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
export async function getFactoryStatus(): Promise<FactoryStatusData[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        const status = await prisma.factoryStatus.findMany({
            orderBy: { station: 'asc' },
        });

        if (status.length === 0) {
            // Seed if empty
            await seedFactoryStatus();
            return await prisma.factoryStatus.findMany({ orderBy: { station: 'asc' } });
        }

        return status;
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
    const stations = ['design', 'fabrication', 'qc', 'scrap', 'ship'];

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

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

async function seedFactoryStatus() {
    const stations = ['design', 'fabrication', 'qc', 'scrap', 'ship'];

    for (const station of stations) {
        await prisma.factoryStatus.create({
            data: {
                station,
                health: 100,
                current: null,
            },
        });
    }
}

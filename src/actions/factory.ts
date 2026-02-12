'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type FactoryStatusData = {
    id: string;
    station: string;
    health: number;
    current: string | null;
    updatedAt: Date;
};

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

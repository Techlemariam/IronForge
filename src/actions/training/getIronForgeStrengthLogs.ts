'use server';

import { prisma } from '@/lib/prisma';


/**
 * Retrieves IronForge-native strength logs for the GPE.
 * Focuses on set/rep/weight/RPE data for muscle heatmap generation.
 */
export async function getIronForgeStrengthLogs(userId: string, startDate: Date, endDate: Date) {
    try {
        const logs = await prisma.exerciseLog.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                exercise: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return { success: true, data: logs };
    } catch (error) {
        console.error('Failed to fetch usage logs:', error);
        return { success: false, error: 'Failed to fetch strength logs' };
    }
}

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { IntervalsWellness } from '@/types';

// Types
export type TitanState = {
    id: string;
    level: number;
    xp: number;
    currentHp: number;
    maxHp: number;
    mood: string;
    energy: number;
    isInjured: boolean;
    isResting: boolean;
    name: string;
};

// Zod Schemas
const updateTitanSchema = z.object({
    currentHp: z.number().optional(),
    xp: z.number().optional(),
    energy: z.number().optional(),
    mood: z.string().optional(),
    isInjured: z.boolean().optional(),
});

export async function getTitanAction(userId: string) {
    try {
        const titan = await prisma.titan.findUnique({
            where: { userId },
            include: {
                memories: true,
                scars: true,
            },
        });
        return { success: true, data: titan };
    } catch (error) {
        console.error('Error fetching titan:', error);
        return { success: false, error: 'Failed to fetch Titan' };
    }
}

export async function ensureTitanAction(userId: string) {
    try {
        const existing = await prisma.titan.findUnique({ where: { userId } });
        if (existing) return { success: true, data: existing };

        // Create new Titan if not exists
        const newTitan = await prisma.titan.create({
            data: {
                userId,
                name: 'Iron Initiate',
                level: 1,
                xp: 0,
                currentHp: 100,
                maxHp: 100,
                mood: 'NEUTRAL',
            },
        });

        revalidatePath('/citadel');
        return { success: true, data: newTitan };
    } catch (error) {
        console.error('Error ensuring titan:', error);
        return { success: false, error: 'Failed to create Titan' };
    }
}

export async function updateTitanAction(userId: string, data: z.infer<typeof updateTitanSchema>) {
    try {
        const validated = updateTitanSchema.parse(data);

        const titan = await prisma.titan.update({
            where: { userId },
            data: {
                ...validated,
                lastActive: new Date(),
            },
        });

        revalidatePath('/citadel');
        return { success: true, data: titan };
    } catch (error) {
        console.error('Error updating titan:', error);
        return { success: false, error: 'Failed to update Titan' };
    }
}

export async function syncTitanStateWithWellness(userId: string, wellness: IntervalsWellness) {
    try {
        const titan = await prisma.titan.findUnique({ where: { userId } });
        if (!titan) return { success: false, error: 'Titan not found' };

        // 1. Energy = Body Battery (Fenix 7x)
        const newEnergy = wellness.bodyBattery || titan.energy;

        // 2. Mood Calculation based on Fenix Metrics
        let newMood = 'NEUTRAL';
        const sleepScore = wellness.sleepScore || 0;
        const hrv = wellness.hrv || 0;

        if ((wellness.bodyBattery && wellness.bodyBattery < 30) || (hrv > 0 && hrv < 30)) { // Arbitrary low HRV check, usually relative to baseline
            newMood = 'WEAKENED';
        } else if ((wellness.bodyBattery && wellness.bodyBattery > 80) && sleepScore > 80) {
            newMood = 'FOCUSED';
        }

        // 3. Resting State
        const isResting = (wellness.bodyBattery || 100) < 20;

        await prisma.titan.update({
            where: { userId },
            data: {
                energy: newEnergy,
                mood: newMood,
                isResting: isResting,
                lastActive: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Sync Titan/Wellness failed:', error);
        return { success: false };
    }
}

'use server'

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface GauntletResult {
    wavesCleared: number;
    totalDamage: number;
    duration: number; // seconds
    avgHr?: number;
    maxHr?: number;
    difficulty?: string;
}

/**
 * Logs a completed Gauntlet run, awards XP/Gold/Kinetic Energy based on performance.
 */
export async function logGauntletRunAction(result: GauntletResult) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        // 1. Save Run
        const run = await prisma.gauntletRun.create({
            data: {
                userId: user.id,
                wavesCleared: result.wavesCleared,
                totalDamage: result.totalDamage,
                duration: result.duration,
                avgHeartRate: result.avgHr,
                maxHeartRate: result.maxHr,
                difficulty: result.difficulty || 'NORMAL'
            }
        });

        // 2. Calculate Rewards
        // Base: 10 XP per wave, 5 Gold per wave
        // Multiplier: +10% for every 5 waves
        const waveMultiplier = 1 + Math.floor(result.wavesCleared / 5) * 0.1;

        const xpReward = Math.floor((result.wavesCleared * 10) * waveMultiplier);
        const goldReward = Math.floor((result.wavesCleared * 5) * waveMultiplier);

        // Kinetic Energy: Based on total damage (approx TSS proxy) or duration
        // Let's say 1 Energy per minute survived + bonus for waves
        const kineticReward = Math.floor(result.duration / 60) + result.wavesCleared;

        // 3. Update User
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalExperience: { increment: xpReward },
                gold: { increment: goldReward },
                kineticEnergy: { increment: kineticReward }
            }
        });

        revalidatePath('/training');

        return {
            success: true,
            runId: run.id,
            rewards: { xp: xpReward, gold: goldReward, kinetic: kineticReward }
        };

    } catch (error: any) {
        console.error("Gauntlet Log Error:", error);
        throw new Error("Failed to log gauntlet run: " + error.message);
    }
}

/**
 * Calculates High Score for the user
 */
export async function getGauntletStatsAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const bestRun = await prisma.gauntletRun.findFirst({
        where: { userId: user.id },
        orderBy: { wavesCleared: 'desc' }
    });

    const totalRuns = await prisma.gauntletRun.count({
        where: { userId: user.id }
    });

    return {
        bestWaves: bestRun?.wavesCleared || 0,
        bestDamage: bestRun?.totalDamage || 0,
        totalRuns
    };
}

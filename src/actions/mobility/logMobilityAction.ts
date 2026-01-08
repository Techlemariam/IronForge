'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { MOBILITY_EXERCISES, calculateSessionCost } from '@/data/mobilityExercises';

/**
 * Logs a mobility session for the user.
 * Calculates XP based on duration and difficulty.
 */
export async function logMobilitySession(
    exerciseId: string,
    durationSecs: number,
    notes?: string
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Find exercise data
        const exerciseData = MOBILITY_EXERCISES.find(e => e.id === exerciseId);
        if (!exerciseData) {
            return { success: false, error: 'Exercise not found' };
        }

        // Calculate XP based on duration and difficulty
        const baseXp = Math.floor(durationSecs / 60) * 5; // 5 XP per minute
        const difficultyMultiplier =
            exerciseData.difficulty === 'ADVANCED' ? 1.5 :
                exerciseData.difficulty === 'INTERMEDIATE' ? 1.2 : 1.0;
        const xpEarned = Math.round(baseXp * difficultyMultiplier);

        // Determine passive layer level based on weekly volume
        const weekStart = getStartOfWeek();
        const weeklyLogs = await prisma.mobilityLog.findMany({
            where: {
                userId: user.id,
                date: { gte: weekStart },
            },
        });

        const weeklyMinutes = weeklyLogs.reduce((sum: number, log) => sum + log.durationSecs / 60, 0) + durationSecs / 60;
        const passiveLayerLevel =
            weeklyMinutes >= 60 ? 'GOLD' :
                weeklyMinutes >= 30 ? 'SILVER' :
                    weeklyMinutes >= 15 ? 'BRONZE' : null;

        // Create log entry
        const log = await prisma.mobilityLog.create({
            data: {
                userId: user.id,
                exerciseId: exerciseId,
                durationSecs,
                notes,
                xpEarned,
                passiveLayerLevel,
            },
        });

        // Award XP to user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalExperience: { increment: xpEarned },
                mobilityLevel: passiveLayerLevel || 'NONE',
            },
        });

        // Calculate resource cost for GPE integration
        const resourceCost = calculateSessionCost([{ exerciseId, durationSecs }]);

        return {
            success: true,
            data: {
                log,
                xpEarned,
                passiveLayerLevel,
                resourceCost,
                weeklyMinutes: Math.round(weeklyMinutes),
            }
        };
    } catch (error) {
        console.error('Failed to log mobility session:', error);
        return { success: false, error: 'Failed to log mobility session' };
    }
}

/**
 * Gets user's mobility logs for the current week.
 */
export async function getWeeklyMobilityLogs() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const weekStart = getStartOfWeek();
        const logs = await prisma.mobilityLog.findMany({
            where: {
                userId: user.id,
                date: { gte: weekStart },
            },
            orderBy: { date: 'desc' },
        });

        const weeklyMinutes = logs.reduce((sum: number, log) => sum + log.durationSecs / 60, 0);
        const passiveLayerLevel =
            weeklyMinutes >= 60 ? 'GOLD' :
                weeklyMinutes >= 30 ? 'SILVER' :
                    weeklyMinutes >= 15 ? 'BRONZE' : 'NONE';

        return {
            success: true,
            data: {
                logs,
                weeklyMinutes: Math.round(weeklyMinutes),
                passiveLayerLevel,
            }
        };
    } catch (error) {
        console.error('Failed to fetch mobility logs:', error);
        return { success: false, error: 'Failed to fetch mobility logs' };
    }
}

/**
 * Helper function to get start of current week (Monday).
 */
function getStartOfWeek(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

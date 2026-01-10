'use server';

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

interface SetData {
    reps: number;
    weight: number;
    rpe?: number;
}

export async function getLastSetForExercise(exerciseId: string, exerciseName?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) return null;

    try {
        // Query ExerciseLog which stores actual workout data
        const lastLog = await prisma.exerciseLog.findFirst({
            where: {
                userId,
                exerciseId: exerciseId.length > 10 ? exerciseId : undefined,
            },
            orderBy: { date: 'desc' },
        });

        if (!lastLog) {
            // Fallback: search by exercise name via relation
            if (exerciseName) {
                const exerciseByName = await prisma.exercise.findFirst({
                    where: { name: exerciseName }
                });
                if (exerciseByName) {
                    const logByName = await prisma.exerciseLog.findFirst({
                        where: { userId, exerciseId: exerciseByName.id },
                        orderBy: { date: 'desc' }
                    });
                    if (logByName && logByName.sets) {
                        const sets = logByName.sets as unknown as SetData[];
                        const lastSet = sets[sets.length - 1];
                        return { weight: lastSet.weight, reps: lastSet.reps, rpe: lastSet.rpe };
                    }
                }
            }
            return null;
        }

        // Parse sets JSON
        const sets = (lastLog.sets as unknown as SetData[]) || [];
        if (sets.length === 0) return null;

        const lastSet = sets[sets.length - 1];
        return {
            weight: lastSet.weight,
            reps: lastSet.reps,
            rpe: lastSet.rpe
        };

    } catch (error) {
        console.error("Failed to fetch last set:", error);
        return null;
    }
}

export async function getExerciseHistory(exerciseId: string, limit = 10) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) return [];

    try {
        const logs = await prisma.exerciseLog.findMany({
            where: {
                userId,
                exerciseId: exerciseId.length > 10 ? exerciseId : undefined,
            },
            orderBy: { date: 'asc' },
            take: limit,
        });

        return logs.map(log => {
            const sets = (log.sets as unknown as SetData[]) || [];

            // Calculate best e1RM from sets
            const bestE1rm = sets.reduce((best: number, set: SetData) => {
                const e1rm = set.weight * (1 + (set.reps / 30));
                return e1rm > best ? e1rm : best;
            }, 0);

            // Calculate total volume
            const volume = sets.reduce((vol: number, set: SetData) =>
                vol + (set.weight * set.reps), 0);

            return {
                date: log.date.toISOString().split('T')[0],
                e1rm: Math.round(bestE1rm),
                volume
            };
        });
    } catch (err) {
        console.error("History chart error", err);
        return [];
    }
}

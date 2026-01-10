// src/services/game/MaxRepsService.ts
import { prisma } from "@/lib/prisma";

interface SetData {
    reps: number;
    weight?: number;
    setType?: string;
    toFailure?: boolean;
}

interface PRHistoryEntry {
    date: string;
    reps: number;
    weight: number | null;
}

/**
 * Service for tracking rep personal records per exercise.
 * Computes max reps from ExerciseLog.sets JSON - no schema changes needed.
 */
export const MaxRepsService = {
    /**
     * Get max reps for an exercise at a specific weight (null = bodyweight)
     */
    async getMaxReps(
        userId: string,
        exerciseId: string,
        weight?: number
    ): Promise<number | null> {
        const logs = await prisma.exerciseLog.findMany({
            where: { userId, exerciseId },
            select: { sets: true },
            orderBy: { date: "desc" },
            take: 100, // Limit for performance
        });

        let maxReps = 0;
        const targetWeight = weight ?? null;

        for (const log of logs) {
            const sets = log.sets as unknown as SetData[];
            if (!Array.isArray(sets)) continue;

            for (const set of sets) {
                const setWeight = set.weight ?? null;

                // Match weight (null = bodyweight)
                // For weighted: exact match
                // For bodyweight: both null
                const weightsMatch =
                    targetWeight === null
                        ? setWeight === null || setWeight === 0
                        : Math.abs((setWeight ?? 0) - targetWeight) < 0.1;

                if (weightsMatch && set.reps > maxReps) {
                    maxReps = set.reps;
                }
            }
        }

        return maxReps > 0 ? maxReps : null;
    },

    /**
     * Check if reps is a new PR for this exercise/weight combo
     */
    async checkForPR(
        userId: string,
        exerciseId: string,
        reps: number,
        weight?: number
    ): Promise<boolean> {
        const currentMax = await this.getMaxReps(userId, exerciseId, weight);
        return currentMax === null || reps > currentMax;
    },

    /**
     * Get PR history over time for charts
     */
    async getPRHistory(
        userId: string,
        exerciseId: string,
        weight?: number
    ): Promise<PRHistoryEntry[]> {
        const logs = await prisma.exerciseLog.findMany({
            where: { userId, exerciseId },
            select: { sets: true, date: true },
            orderBy: { date: "asc" },
        });

        const targetWeight = weight ?? null;
        const history: PRHistoryEntry[] = [];
        let runningMax = 0;

        for (const log of logs) {
            const sets = log.sets as unknown as SetData[];
            if (!Array.isArray(sets)) continue;

            for (const set of sets) {
                const setWeight = set.weight ?? null;
                const weightsMatch =
                    targetWeight === null
                        ? setWeight === null || setWeight === 0
                        : Math.abs((setWeight ?? 0) - targetWeight) < 0.1;

                if (weightsMatch && set.reps > runningMax) {
                    runningMax = set.reps;
                    history.push({
                        date: log.date.toISOString(),
                        reps: set.reps,
                        weight: setWeight,
                    });
                }
            }
        }

        return history;
    },

    /**
     * Get all-time PRs for all weights for an exercise
     */
    async getAllWeightPRs(
        userId: string,
        exerciseId: string
    ): Promise<Map<number | null, number>> {
        const logs = await prisma.exerciseLog.findMany({
            where: { userId, exerciseId },
            select: { sets: true },
        });

        const prMap = new Map<number | null, number>();

        for (const log of logs) {
            const sets = log.sets as unknown as SetData[];
            if (!Array.isArray(sets)) continue;

            for (const set of sets) {
                const weight = set.weight ?? null;
                const currentMax = prMap.get(weight) ?? 0;
                if (set.reps > currentMax) {
                    prMap.set(weight, set.reps);
                }
            }
        }

        return prMap;
    },
};

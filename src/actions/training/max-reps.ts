// src/actions/training/max-reps.ts
"use server";

import { MaxRepsService } from "@/services/game/MaxRepsService";
import { getSession } from "@/lib/auth";

interface MaxRepsResult {
    success: boolean;
    maxReps?: number | null;
    error?: string;
}

interface PRCheckResult {
    success: boolean;
    isPR?: boolean;
    previousMax?: number | null;
    error?: string;
}

/**
 * Get the max reps PR for an exercise at a specific weight
 */
export async function getMaxRepsAction(
    exerciseId: string,
    weight?: number
): Promise<MaxRepsResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const maxReps = await MaxRepsService.getMaxReps(
            session.user.id,
            exerciseId,
            weight
        );

        return { success: true, maxReps };
    } catch (error) {
        console.error("Failed to get max reps:", error);
        return { success: false, error: "Failed to fetch PR" };
    }
}

/**
 * Check if a rep count is a new PR
 */
export async function checkPRAction(
    exerciseId: string,
    reps: number,
    weight?: number
): Promise<PRCheckResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const previousMax = await MaxRepsService.getMaxReps(
            session.user.id,
            exerciseId,
            weight
        );

        const isPR = await MaxRepsService.checkForPR(
            session.user.id,
            exerciseId,
            reps,
            weight
        );

        return { success: true, isPR, previousMax };
    } catch (error) {
        console.error("Failed to check PR:", error);
        return { success: false, error: "Failed to check PR" };
    }
}

/**
 * Get PR history for charts
 */
export async function getPRHistoryAction(
    exerciseId: string,
    weight?: number
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const history = await MaxRepsService.getPRHistory(
            session.user.id,
            exerciseId,
            weight
        );

        return { success: true, history };
    } catch (error) {
        console.error("Failed to get PR history:", error);
        return { success: false, error: "Failed to fetch history" };
    }
}

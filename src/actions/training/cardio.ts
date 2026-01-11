"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CardioSessionData {
    type: "RUN" | "CYCLE" | "HIIT";
    durationSec: number;
    distanceKm?: number;
    avgHr?: number;
    maxHr?: number;
    calories?: number;
}

export async function saveCardioSessionAction(userId: string, data: CardioSessionData) {
    try {
        console.log("Saving Cardio Session:", data);

        // 1. Generic "Cardio Layout" Exercise Mapping
        // In a real system, we'd look up "Treadmill Run" or "Zwift Cycle"
        // For now, we create a log with a "virtual" exercise ID or just descriptive notes.
        // Let's assume we have a generic exerciseId for Cardio or we create a specific Log type.
        // IronForge SCHEMA: ExerciseLog expects an `exerciseId`.
        // We should fallback to a known ID or find one by name.

        const activityName = data.type === "CYCLE" ? "Outdoor Cycling" : "Treadmill Run"; // Simple mapping

        // Find or Create generic exercise
        let exercise = await prisma.exercise.findFirst({
            where: { name: activityName }
        });

        if (!exercise) {
            // Create Default
            exercise = await prisma.exercise.create({
                data: {
                    name: activityName,
                    muscleGroup: data.type === "CYCLE" ? "QUADS" : "LEGS",
                    equipment: data.type === "CYCLE" ? "BIKE" : "NONE",
                }
            })
        }

        // 2. Calculate Rewards (Server Verification)
        // Formula matches Client BuffHud: 
        // - 10 XP per minute (at zone 2-3 avg) -> simplified to Duration * 0.2
        // - Let's be generous: 5 XP per min base.
        const minutes = data.durationSec / 60;
        const baseXp = Math.floor(minutes * 5);
        const bonusXp = data.distanceKm ? Math.floor(data.distanceKm * 10) : 0; // 10 XP per km
        const totalXp = baseXp + bonusXp;

        const goldEarned = Math.floor(totalXp * 0.2); // 20% of XP as Gold

        // 3. Save Log
        const log = await prisma.exerciseLog.create({
            data: {
                userId,
                exerciseId: exercise.id,
                date: new Date(),
                notes: `Auto-saved Cardio Session. \nDist: ${data.distanceKm?.toFixed(2)}km \nHR: ${data.avgHr}bpm`,
                sets: [] // No sets for cardio, or we could add one "set" with duration
            }
        });

        // 4. Update Progression (Main RPG)
        const { ProgressionService } = await import("@/services/progression");
        if (totalXp > 0) {
            await ProgressionService.addExperience(userId, totalXp);
            await ProgressionService.awardGold(userId, goldEarned);
        }

        // 5. Update Battle Pass
        try {
            const { addBattlePassXpAction } = await import("@/actions/systems/battle-pass");
            const bpXp = Math.ceil(totalXp * 0.5);
            if (bpXp > 0) await addBattlePassXpAction(userId, bpXp);
        } catch (e) { console.error("BP Error", e); }

        // 6. Refill Kinetic (Energy)
        await prisma.user.update({
            where: { id: userId },
            data: { kineticEnergy: { increment: Math.floor(minutes) } } // 1 energy per minute
        });

        revalidatePath("/dashboard");
        return { success: true, xp: totalXp, gold: goldEarned };

    } catch (error) {
        console.error("Save Cardio Failed:", error);
        return { success: false, error: "Failed to save session" };
    }
}

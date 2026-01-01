"use server";

import { prisma } from "@/lib/prisma";
import { calculatePowerRating, TrainingPath } from "@/lib/powerRating";
import { revalidatePath } from "next/cache";

export async function recalculatePowerRatingAction(userId: string) {
    try {
        // 1. Fetch Data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                pvpProfile: true,
                titan: true,
            },
        });

        if (!user || !user.titan) {
            throw new Error("User or Titan not found");
        }

        // 2. Extract Metrics
        const wilks = user.pvpProfile?.highestWilksScore || 0;

        // Determine Cardio Metric (Watts/kg)
        // Priority: Cycling FTP > Running FTP (converted) > 0
        let wkg = 0;
        if (user.ftpCycle && user.bodyWeight > 0) {
            wkg = user.ftpCycle / user.bodyWeight;
        } else if (user.ftpRun && user.bodyWeight > 0) {
            // Rough conversion: Running power is roughly similar to cycling power for same metabolic cost,
            // but mechanically different. We'll treat them 1:1 for this high-level abstraction.
            wkg = user.ftpRun / user.bodyWeight;
        }

        // 3. Determine Path
        // Cast string to TrainingPath or default
        const path = (user.activePath as TrainingPath) || 'HYBRID_WARDEN';

        // 4. Calculate Adherence (Placeholder for now - assumes decent adherence)
        // TODO: Connect this to actual WeeklyPlan adherence from volumeCalculator
        const mrvAdherence = 0.8; // 80% adherence default
        const cardioAdherence = 0.8; // 80% adherence default

        // 5. Calculate Power Rating
        const result = calculatePowerRating(
            wilks,
            wkg,
            path,
            mrvAdherence,
            cardioAdherence
        );

        // 6. Update Titan
        const updatedTitan = await prisma.titan.update({
            where: { userId },
            data: {
                powerRating: result.powerRating,
                strengthIndex: result.strengthIndex,
                cardioIndex: result.cardioIndex,
                mrvAdherence: 1.0 + (mrvAdherence * 0.15), // Storing the multiplier for UI display
                lastPowerCalcAt: new Date(),
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/citadel");
        revalidatePath("/leaderboard");

        return { success: true, data: updatedTitan };

    } catch (error: any) {
        console.error("Error recalculating Power Rating:", error);
        return { success: false, error: error.message };
    }
}

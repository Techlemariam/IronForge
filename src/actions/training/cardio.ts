"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const CardioSessionSchema = z.object({
    type: z.enum(["RUN", "CYCLE", "HIIT"]),
    durationSec: z.number().int().min(1),
    distanceKm: z.number().min(0).optional(),
    avgHr: z.number().int().optional(),
    maxHr: z.number().int().optional(),
    calories: z.number().int().optional(),
});

export type CardioSessionData = z.infer<typeof CardioSessionSchema>;

export const saveCardioSessionAction = authActionClient
    .schema(CardioSessionSchema)
    .action(async ({ parsedInput, ctx: { userId } }) => {
        const { type, durationSec, distanceKm, avgHr } = parsedInput;

        const activityName = type === "CYCLE" ? "Outdoor Cycling" : "Treadmill Run";

        let exercise = await prisma.exercise.findFirst({ where: { name: activityName } });
        if (!exercise) {
            exercise = await prisma.exercise.create({
                data: {
                    name: activityName,
                    muscleGroup: type === "CYCLE" ? "QUADS" : "LEGS",
                    equipment: type === "CYCLE" ? "BIKE" : "NONE",
                },
            });
        }

        const minutes = durationSec / 60;
        const baseXp = Math.floor(minutes * 5);
        const bonusXp = distanceKm ? Math.floor(distanceKm * 10) : 0;
        const totalXp = baseXp + bonusXp;
        const goldEarned = Math.floor(totalXp * 0.2);

        await prisma.exerciseLog.create({
            data: {
                userId,
                exerciseId: exercise.id,
                date: new Date(),
                notes: `Auto-saved Cardio Session.\nDist: ${distanceKm?.toFixed(2)}km\nHR: ${avgHr}bpm`,
                sets: [],
            },
        });

        const { ProgressionService } = await import("@/services/progression");
        if (totalXp > 0) {
            await ProgressionService.addExperience(userId, totalXp);
            await ProgressionService.awardGold(userId, goldEarned);
        }

        try {
            const { addBattlePassXpAction } = await import("@/actions/systems/battle-pass");
            const bpXp = Math.ceil(totalXp * 0.5);
            if (bpXp > 0) await addBattlePassXpAction({ amount: bpXp });
        } catch (e) { console.error("BP Error", e); }

        await prisma.user.update({
            where: { id: userId },
            data: { kineticEnergy: { increment: Math.floor(minutes) } },
        });

        revalidatePath("/dashboard");
        return { xp: totalXp, gold: goldEarned };
    });

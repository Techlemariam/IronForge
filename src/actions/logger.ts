"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TrainingContextService } from "@/services/data/TrainingContextService";

// --- Validation Schemas ---

const CreateExerciseSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    muscleGroup: z.string(),
    equipment: z.string().default("Barbell"),
});

const LogSetSchema = z.object({
    exerciseId: z.string(),
    sets: z.array(
        z.object({
            weight: z.number().min(0),
            reps: z.number().min(1),
            rpe: z.number().optional().default(7),
        })
    ),
    notes: z.string().optional(),
});

// --- Actions ---

export async function searchExercisesAction(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const exercises = await prisma.exercise.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            take: 10,
            orderBy: { name: "asc" },
        });
        return exercises;
    } catch (error) {
        console.error("Search Exercises Error:", error);
        return [];
    }
}

export async function createExerciseAction(data: z.input<typeof CreateExerciseSchema>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const parsed = CreateExerciseSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.message };
    }

    try {
        const existing = await prisma.exercise.findFirst({
            where: { name: { equals: parsed.data.name, mode: "insensitive" } },
        });

        if (existing) {
            return { success: true, exercise: existing };
        }

        const newExercise = await prisma.exercise.create({
            data: {
                name: parsed.data.name,
                muscleGroup: parsed.data.muscleGroup,
                equipment: parsed.data.equipment,
                secondaryMuscles: [],
            },
        });

        return { success: true, exercise: newExercise };
    } catch (error: any) {
        console.error("Create Exercise Error:", error);
        return { success: false, error: error.message };
    }
}

export async function logExerciseSetsAction(data: z.infer<typeof LogSetSchema>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const parsed = LogSetSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.message };
    }

    try {
        const { exerciseId, sets, notes } = parsed.data;


        // --- ORACLE INTEGRATION: CHECK FOR BUFFS ---
        const userWithTitan = await prisma.user.findUnique({
            where: { id: user.id },
            include: { titan: true }
        });

        let multiplier = 1.0;
        let diffMessage = "";

        if (userWithTitan?.titan?.dailyDecree) {
            // @ts-ignore - JSON mapping
            const decree = userWithTitan.titan.dailyDecree as any;
            if (decree.effect?.xpMultiplier) {
                multiplier = decree.effect.xpMultiplier;
                if (multiplier > 1.0) diffMessage = ` (x${multiplier} Oracle Buff)`;
            }
        }

        // --- Kinetic Energy Reward ---
        // Simple logic: 1 Energy per 100kg volume
        const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
        const baseEnergy = Math.max(5, Math.floor(totalVolume / 100));
        const energyGain = Math.floor(baseEnergy * multiplier);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                kineticEnergy: { increment: energyGain },
                totalExperience: { increment: energyGain },
            },
        });

        // --- COMBAT INTEGRATION: DEAL DAMAGE TO BOSS ---
        let combatStats = null;
        try {
            const combatSession = await prisma.combatSession.findUnique({
                where: { userId: user.id }
            });

            // Determine damage: Raw Volume for now.
            const damage = totalVolume;

            if (combatSession && !combatSession.isVictory && !combatSession.isDefeat) {
                const newBossHp = Math.max(0, combatSession.bossHp - damage);

                // Check for victory
                const isVictory = newBossHp === 0;

                await prisma.combatSession.update({
                    where: { id: combatSession.id },
                    data: {
                        bossHp: newBossHp,
                        isVictory: isVictory,
                        logs: {
                            // Append log (PostgreSQL JSONB array append via Prisma is tricky without raw/json, 
                            // so we just read and push if we want perfect history, but for MVP optimization:
                            // We might just skip history append or do it simply. 
                            // Let's assume we can push to array if it's valid JSON.
                            // Actually, simplest is just update the stats.
                        }
                    }
                });

                combatStats = {
                    damageDealt: damage,
                    remainingHp: newBossHp,
                    isVictory: isVictory,
                    bossMaxHp: combatSession.bossMaxHp
                };
            }
        } catch (e) {
            console.error("Combat Logic Error:", e);
            // Don't fail the log if combat fails
        }

        const logEntry = await prisma.exerciseLog.create({
            data: {
                userId: user.id,
                exerciseId: exerciseId,
                date: new Date(),
                sets: sets,
                notes: notes,
                // Calculate total stats for legacy fields or dashboard summary
                reps: sets.reduce((acc, s) => acc + s.reps, 0),
                weight: Math.max(...sets.map((s) => s.weight)), // Max weight used
            },
        });

        revalidatePath("/logger");
        revalidatePath("/dashboard");

        // --- FETCH UPDATED CONTEXT ---
        // We fetch this AFTER logging so the new volume is included.
        const context = await TrainingContextService.getTrainingContext(user.id);

        // Return context for immediate UI feedback
        return {
            success: true,
            logId: logEntry.id,
            energyGained: energyGain,
            combatStats,
            context,
            oracleBuff: diffMessage
        };
    } catch (error: any) {
        console.error("Log Sets Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getRecentLogsAction(limit: number = 5) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    try {
        const logs = await prisma.exerciseLog.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: limit,
            include: {
                exercise: { select: { name: true } },
            },
        });
        return logs;
    } catch (error) {
        console.error("Get Recent Logs Error:", error);
        return [];
    }
}

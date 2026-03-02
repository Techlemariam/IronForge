"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Types & Schemas ---

const SetSchema = z.object({
  id: z.string().optional(), // Frontend ID for optimistic updates
  reps: z.number().int().min(1),
  weight: z.number().min(0),
  rpe: z.number().min(1).max(10).optional(),
  restSec: z.number().optional(),
  isWarmup: z.boolean().default(false),
  completedAt: z.string().optional(), // ISO date
  setType: z.enum(["normal", "failure", "dropset", "warmup", "myoreps"]).optional(),
});

export type SetData = z.infer<typeof SetSchema>;



// --- Actions ---

/**
 * Logs a set for an exercise.
 * If a log exists for this exercise on this date, appends the set.
 * Otherwise creates a new log.
 */
export async function logSetAction(
  userId: string,
  exerciseId: string,
  set: SetData,
) {
  try {
    const validatedSet = SetSchema.parse(set);
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1. Find existing log for today
    const existingLog = await prisma.exerciseLog.findFirst({
      where: {
        userId,
        exerciseId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let logId = existingLog?.id;
    let currentSets = (existingLog?.sets as SetData[]) || [];

    // 2. Add or Update Set
    // Check if set ID exists to update, otherwise append
    const existingSetIndex = validatedSet.id
      ? currentSets.findIndex((s) => s.id === validatedSet.id)
      : -1;

    if (existingSetIndex >= 0) {
      currentSets[existingSetIndex] = validatedSet;
    } else {
      currentSets.push({
        ...validatedSet,
        completedAt: new Date().toISOString(),
      });
    }

    // 3. Calculate E1RM for this set (Epley Formula: w * (1 + r/30))
    const _e1rm = validatedSet.weight * (1 + validatedSet.reps / 30);

    // 4. Save to DB
    if (existingLog) {
      await prisma.exerciseLog.update({
        where: { id: existingLog.id },
        data: {
          sets: currentSets as any, // Prisma JSON type workaround
        },
      });
    } else {
      const newLog = await prisma.exerciseLog.create({
        data: {
          userId,
          exerciseId,
          date: new Date(),
          sets: currentSets as any,
          isPersonalRecord: false, // Calculated later
        },
      });
      logId = newLog.id;
    }

    // 5. Check for PR (simple logic: max weight check for now)
    // In a real app, we'd compare against history.

    // 5. Check for Achievements
    let newAchievements: any[] = [];
    try {
      const { checkAchievementsAction } = await import("@/actions/progression/achievements");
      const result = await checkAchievementsAction(userId);
      if (result && "newUnlocks" in result) {
        newAchievements = result.newUnlocks;
      }
    } catch (e) {
      console.error("Achievement check failed:", e);
    }

    // 6. Guild Raid Integration (Boss Eraser)
    let raidDamageDealt = 0;
    if (validatedSet.rpe && validatedSet.rpe >= 9 && !validatedSet.isWarmup) {
      try {
        const { contributeGuildDamageAction } = await import("@/actions/guild/core");
        // Damage = Weight * Reps (Kinetic Force)
        const damage = Math.floor(validatedSet.weight * validatedSet.reps);
        if (damage > 0) {
          const raidResult = await contributeGuildDamageAction(userId, damage);
          if (raidResult.success && raidResult.damageDealt) {
            raidDamageDealt = raidResult.damageDealt;
          }
        }
      } catch (e) {
        console.error("Guild Raid contribution failed:", e);
      }
    }

    // 7. Challenge & Quest Updates
    try {
      const { processWorkoutLog } = await import("@/services/challengeService");
      // We log volume (Weight * Reps) and Reps.
      // processWorkoutLog handles "Volume" and "Workout" quest counts via logic updates
      await processWorkoutLog(userId, validatedSet.weight, validatedSet.reps);
    } catch (e) {
      console.error("Challenge update failed:", e);
    }

    return { success: true, logId, sets: currentSets, newAchievements, raidDamageDealt };
  } catch (error) {
    console.error("Error logging set:", error);
    return { success: false, error: "Failed to log set" };
  }
}

/**
 * Finish a workout session, calculate total volume, and check for PRs.
 */
export async function finishWorkoutAction(userId: string, logIds: string[]) {
  try {
    // 1. Calculate Total Volume for recent logs (simple approach)
    // Ideally we'd sum volume for the specific logIds passed
    const logs = await prisma.exerciseLog.findMany({
      where: {
        userId,
        id: { in: logIds }
      }
    });

    // 2. Award XP Modified by Intensity (Resource Cost Proxy)
    // 100kg Deadlift > 100kg Calf Raise.
    // We fetch the exercises to determine the multiplier.
    const exerciseIds = Array.from(new Set(logs.map(l => l.exerciseId)));
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, muscleGroup: true }
    });

    const muscleMap = new Map(exercises.map(e => [e.id, e.muscleGroup]));

    // Multipliers based on CNS demand
    const TIER_1_MUSCLES = ['QUADS', 'BACK', 'CHEST', 'HAMSTRINGS', 'GLUTES']; // Large Compounds (1.2x)
    const TIER_2_MUSCLES = ['SHOULDERS', 'TRICEPS', 'BICEPS']; // Medium (1.0x)
    const TIER_3_MUSCLES = ['CALVES', 'ABS', 'FOREARMS']; // Small (0.8x)

    let weightedVolume = 0;

    logs.forEach(log => {
      const sets = (log.sets as unknown as SetData[]) || [];
      const muscle = muscleMap.get(log.exerciseId)?.toUpperCase() || 'OTHER';

      let multiplier = 1.0;
      if (TIER_1_MUSCLES.includes(muscle)) multiplier = 1.2;
      else if (TIER_2_MUSCLES.includes(muscle)) multiplier = 1.0;
      else if (TIER_3_MUSCLES.includes(muscle)) multiplier = 0.8;

      sets.forEach(set => {
        weightedVolume += (set.weight * set.reps) * multiplier;
      });
    });

    const xpAward = Math.floor(weightedVolume * 0.01);

    // 3. Execute Progression Updates
    const { ProgressionService } = await import("@/services/progression");

    if (xpAward > 0) {
      await ProgressionService.addExperience(userId, xpAward);

      // 3b. Award Battle Pass XP (50% of Base XP)
      try {
        const { addBattlePassXpAction } = await import("@/actions/systems/battle-pass");
        const bpXp = Math.floor(xpAward * 0.5);
        if (bpXp > 0) {
          await addBattlePassXpAction(userId, bpXp);
        }
      } catch (e) {
        console.error("Battle Pass update failed:", e);
      }
    }

    // 4. Award Completion Gold (Fixed 100g)
    await ProgressionService.awardGold(userId, 100);

    // 5. Refill Kinetic Energy (Guild Battery) - Part of Phase 2 but convenient here
    await prisma.user.update({
      where: { id: userId },
      data: { kineticEnergy: { increment: 10 } }
    });

    revalidatePath("/dashboard");
    return { success: true, xpEarned: xpAward, goldEarned: 100 };
  } catch (error) {
    console.error("Finish Workout Error:", error);
    return { success: false, error: "Failed to finish workout" };
  }
}

/**
 * Get exercise history for charts
 */
export async function getExerciseHistoryAction(
  userId: string,
  exerciseId: string,
) {
  const history = await prisma.exerciseLog.findMany({
    where: { userId, exerciseId },
    orderBy: { date: "asc" },
    take: 20,
  });

  return history.map((log) => {
    const sets = log.sets as SetData[];
    const maxWeight = Math.max(...sets.map((s) => s.weight));
    const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
    const bestE1RM = Math.max(...sets.map((s) => s.weight * (1 + s.reps / 30)));

    return {
      date: log.date,
      maxWeight,
      totalVolume,
      bestE1RM,
    };
  });
}

/**
 * Create a new custom exercise
 */
export async function createExerciseAction(data: {
  name: string;
  muscleGroup: string;
  equipment: string;
}) {
  // Basic validation could go here
  const exercise = await prisma.exercise.create({
    data,
  });
  return exercise;
}

export async function searchExercisesAction(query: string) {
  if (!query || query.length < 2) return [];

  // In a real app with many exercises, use Full Text Search (Postgres tsvector)
  // For now, simple contains is fine
  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { muscleGroup: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
  return exercises;
}

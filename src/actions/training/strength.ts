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
});

export type SetData = z.infer<typeof SetSchema>;

const LogExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(SetSchema),
  notes: z.string().optional(),
  date: z.string().optional(), // ISO date override
});

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
    const e1rm = validatedSet.weight * (1 + validatedSet.reps / 30);

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
    // Fire and forget or await? Await to return notification
    let newAchievements: any[] = [];
    try {
      const { checkAchievementsAction } =
        await import("@/actions/progression/achievements");
      const result = await checkAchievementsAction(userId);
      if (result && "newUnlocks" in result) {
        newAchievements = result.newUnlocks;
      }
    } catch (e) {
      console.error("Achievement check failed:", e);
    }

    revalidatePath("/dashboard/strength");
    return { success: true, logId, sets: currentSets, newAchievements };
  } catch (error) {
    console.error("Error logging set:", error);
    return { success: false, error: "Failed to log set" };
  }
}

/**
 * Finish a workout session, calculate total volume, and check for PRs.
 */
export async function finishWorkoutAction(userId: string, logIds: string[]) {
  // Logic to finalize logs, maybe lock them?
  // For now, simpler: user logs sets real-time.
  // We can just revalidate or update "completed" status if we added that.
  revalidatePath("/dashboard");
  return { success: true };
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

"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
 */
export const logSetAction = authActionClient
  .schema(z.object({ exerciseId: z.string(), set: SetSchema }))
  .action(async ({ parsedInput: { exerciseId, set }, ctx: { userId } }) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingLog = await prisma.exerciseLog.findFirst({
      where: { userId, exerciseId, date: { gte: startOfDay, lte: endOfDay } },
    });

    let logId = existingLog?.id;
    let currentSets = (existingLog?.sets as SetData[]) || [];

    const existingSetIndex = set.id
      ? currentSets.findIndex((s) => s.id === set.id)
      : -1;

    if (existingSetIndex >= 0) {
      currentSets[existingSetIndex] = set;
    } else {
      currentSets.push({ ...set, completedAt: new Date().toISOString() });
    }

    if (existingLog) {
      await prisma.exerciseLog.update({
        where: { id: existingLog.id },
        data: { sets: currentSets as unknown as import("@prisma/client").Prisma.InputJsonValue },
      });
    } else {
      const newLog = await prisma.exerciseLog.create({
        data: { userId, exerciseId, date: new Date(), sets: currentSets as unknown as import("@prisma/client").Prisma.InputJsonValue, isPersonalRecord: false },
      });
      logId = newLog.id;
    }

    // Check for Achievements
    let newAchievements: any[] = [];
    try {
      const { checkAchievementsAction } = await import("@/actions/progression/achievements");
      const result = await checkAchievementsAction({ _trigger: "logSet" });
      if (result?.data && "newUnlocks" in result.data) {
        newAchievements = result.data.newUnlocks;
      }
    } catch (e) {
      console.error("Achievement check failed:", e);
    }

    // Guild Raid Integration (Boss Eraser)
    let raidDamageDealt = 0;
    if (set.rpe && set.rpe >= 9 && !set.isWarmup) {
      try {
        const { contributeGuildDamageAction } = await import("@/actions/guild/core");
        const damage = Math.floor(set.weight * set.reps);
        if (damage > 0) {
          const raidResult = await contributeGuildDamageAction({ damage });
          if (raidResult?.data?.success && raidResult.data.damageDealt) {
            raidDamageDealt = raidResult.data.damageDealt;
          }
        }
      } catch (e) {
        console.error("Guild Raid contribution failed:", e);
      }
    }

    // Challenge & Quest Updates
    try {
      const { processWorkoutLog } = await import("@/services/challengeService");
      await processWorkoutLog(userId, set.weight, set.reps);
    } catch (e) {
      console.error("Challenge update failed:", e);
    }

    return { logId, sets: currentSets, newAchievements, raidDamageDealt };
  });

/**
 * Finish a workout session, calculate total volume, and award XP.
 */
export const finishWorkoutAction = authActionClient
  .schema(z.object({ logIds: z.array(z.string()) }))
  .action(async ({ parsedInput: { logIds }, ctx: { userId } }) => {
    const logs = await prisma.exerciseLog.findMany({
      where: { userId, id: { in: logIds } },
    });

    const exerciseIds = Array.from(new Set(logs.map((l) => l.exerciseId)));
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, muscleGroup: true },
    });

    const muscleMap = new Map(exercises.map((e) => [e.id, e.muscleGroup]));

    const TIER_1_MUSCLES = ["QUADS", "BACK", "CHEST", "HAMSTRINGS", "GLUTES"];
    const TIER_2_MUSCLES = ["SHOULDERS", "TRICEPS", "BICEPS"];
    const TIER_3_MUSCLES = ["CALVES", "ABS", "FOREARMS"];

    let weightedVolume = 0;
    logs.forEach((log) => {
      const sets = (log.sets as unknown as SetData[]) || [];
      const muscle = muscleMap.get(log.exerciseId)?.toUpperCase() || "OTHER";
      let multiplier = 1.0;
      if (TIER_1_MUSCLES.includes(muscle)) multiplier = 1.2;
      else if (TIER_2_MUSCLES.includes(muscle)) multiplier = 1.0;
      else if (TIER_3_MUSCLES.includes(muscle)) multiplier = 0.8;
      sets.forEach((set) => { weightedVolume += set.weight * set.reps * multiplier; });
    });

    const xpAward = Math.floor(weightedVolume * 0.01);
    const { ProgressionService } = await import("@/services/progression");

    if (xpAward > 0) {
      await ProgressionService.addExperience(userId, xpAward);
      try {
        const { addBattlePassXpAction } = await import("@/actions/systems/battle-pass");
        // Award Battle Pass XP
        const bpXp = Math.ceil(xpAward * 0.5);
        if (bpXp > 0) await addBattlePassXpAction({ amount: bpXp });
      } catch (e) {
        console.error("Non-critical error logging strength workout:", e);
      }
    }

    await ProgressionService.awardGold(userId, 100);
    await prisma.user.update({ where: { id: userId }, data: { kineticEnergy: { increment: 10 } } });
    revalidatePath("/dashboard");
    return { xpEarned: xpAward, goldEarned: 100 };
  });

/**
 * Get exercise history for charts.
 */
export const getExerciseHistoryAction = authActionClient
  .schema(z.object({ exerciseId: z.string() }))
  .action(async ({ parsedInput: { exerciseId }, ctx: { userId } }) => {
    const history = await prisma.exerciseLog.findMany({
      where: { userId, exerciseId },
      orderBy: { date: "asc" },
      take: 20,
    });

    return history.map((log) => {
      const sets = log.sets as SetData[];
      const maxWeight = sets.length > 0 ? Math.max(...sets.map((s) => s.weight)) : 0;
      const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
      const bestE1RM = sets.length > 0 ? Math.max(...sets.map((s) => s.weight * (1 + s.reps / 30))) : 0;
      return { date: log.date, maxWeight, totalVolume, bestE1RM };
    });
  });

/**
 * Create a new custom exercise.
 */
export const createExerciseAction = authActionClient
  .schema(z.object({ name: z.string().min(1), muscleGroup: z.string(), equipment: z.string() }))
  .action(async ({ parsedInput }) => {
    const exercise = await prisma.exercise.create({ data: parsedInput });
    return exercise;
  });

/**
 * Search exercises by name or muscle group.
 */
export const searchExercisesAction = authActionClient
  .schema(z.object({ query: z.string().min(2) }))
  .action(async ({ parsedInput: { query } }) => {
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
  });

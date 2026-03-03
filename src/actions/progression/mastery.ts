"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

interface MasteryPerk {
  id: string;
  name: string;
  description: string;
  effect: { stat: string; value: number };
  unlocksAtLevel: number;
}

interface ExerciseMastery {
  exerciseId: string;
  exerciseName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalReps: number;
  totalVolume: number;
  bestWeight: number;
  bestReps: number;
  unlockedPerks: MasteryPerk[];
  nextPerk?: MasteryPerk;
}

const MASTERY_PERKS: MasteryPerk[] = [
  { id: "perk-1", name: "Form Mastery", description: "+5% XP from this exercise", effect: { stat: "exerciseXp", value: 5 }, unlocksAtLevel: 5 },
  { id: "perk-2", name: "Muscle Memory", description: "+3% strength during this exercise", effect: { stat: "strength", value: 3 }, unlocksAtLevel: 10 },
  { id: "perk-3", name: "Efficient Movement", description: "-10% fatigue from this exercise", effect: { stat: "fatigue", value: -10 }, unlocksAtLevel: 15 },
  { id: "perk-4", name: "Power Focus", description: "+5% damage with this exercise", effect: { stat: "damage", value: 5 }, unlocksAtLevel: 20 },
  { id: "perk-5", name: "Master's Touch", description: "+10% crit chance with this exercise", effect: { stat: "critChance", value: 10 }, unlocksAtLevel: 25 },
  { id: "perk-6", name: "Legendary Mastery", description: "+15% all bonuses from this exercise", effect: { stat: "allBonuses", value: 15 }, unlocksAtLevel: 50 },
];

function buildMastery(exerciseId: string, level: number): ExerciseMastery {
  const unlockedPerks = MASTERY_PERKS.filter((p) => p.unlocksAtLevel <= level);
  const nextPerk = MASTERY_PERKS.find((p) => p.unlocksAtLevel > level);
  return {
    exerciseId,
    exerciseName: "Bench Press",
    level,
    xp: 7500,
    xpToNextLevel: 10000,
    totalReps: 1250,
    totalVolume: 125000,
    bestWeight: 100,
    bestReps: 10,
    unlockedPerks,
    nextPerk,
  };
}

export const getExerciseMasteryAction = authActionClient
  .schema(z.object({ exerciseId: z.string() }))
  .action(async ({ parsedInput: { exerciseId } }): Promise<ExerciseMastery> => {
    return buildMastery(exerciseId, 15);
  });

export const getAllMasteriesAction = authActionClient
  .schema(z.object({}))
  .action(async (): Promise<ExerciseMastery[]> => {
    const exercises = ["bench-press", "squat", "deadlift", "overhead-press", "barbell-row"];
    return exercises.map((e) => buildMastery(e, 15));
  });

export const addMasteryXpAction = authActionClient
  .schema(z.object({ exerciseId: z.string(), xpGained: z.number().int().min(1) }))
  .action(async ({ parsedInput: { exerciseId, xpGained }, ctx: { userId } }) => {
    console.log(`Added ${xpGained} mastery XP for ${exerciseId} (user: ${userId})`);
    revalidatePath("/mastery");
    return { newLevel: 15, newXp: 7500 + xpGained, leveledUp: false };
  });

export const getMasteryLeaderboardAction = authActionClient
  .schema(z.object({ exerciseId: z.string(), limit: z.number().int().min(1).max(100).default(10) }))
  .action(async () => {
    return [
      { rank: 1, heroName: "BenchKing", level: 50 },
      { rank: 2, heroName: "IronPusher", level: 42 },
      { rank: 3, heroName: "ChestMaster", level: 38 },
    ];
  });

/**
 * Pure utility — not a server action. Calculates mastery XP from a set.
 */
export function calculateMasteryXp(weight: number, reps: number, isPr: boolean): number {
  const baseXp = Math.floor((weight * reps) / 10);
  const prBonus = isPr ? baseXp * 0.5 : 0;
  return Math.floor(baseXp + prBonus);
}

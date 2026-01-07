"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TrainingPath } from "@/types/training";
import { processWorkoutLog } from "@/services/challengeService";
import { addBattlePassXpAction } from "@/actions/systems/battle-pass";
import { TrainingService } from "@/services/game/TrainingService";
import { mutateTitanXp, mutateTitanEconomy } from "@/services/titan-mutations";

export type TitanLogResult = {
  success: boolean;
  message: string;
  newLevel?: number;
  xpGained?: number;
  energyGained?: number;
};

export async function logTitanSet(
  exerciseId: string,
  reps: number,
  weight: number,
  rpe: number,
): Promise<TitanLogResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    // 1. Calculate Rewards
    // Base XP per set = 10. Bonus 1 XP per rep.
    // Energy = reps * 2 (Kinetic Shards logic)
    const xpGained = 10 + reps;
    const energyGained = reps * 2;

    // 2. Log Exercise (Data Layer)
    await TrainingService.logSet(user.id, exerciseId, reps, weight, rpe);

    // 3. Update User Stats (State Layer)
    // Parallel mutations for performance
    const [xpResult, _economyResult] = await Promise.all([
      mutateTitanXp({
        userId: user.id,
        amount: xpGained,
        source: "WORKOUT",
      }),
      mutateTitanEconomy({
        userId: user.id,
        changes: { kineticEnergy: energyGained },
        source: "WORKOUT",
      }),
    ]);

    // 4. Side Effects (Fire and Forget or Awaited based on UX)
    // We do not await this to keep UI snappy, or we await if we want data consistency.
    try {
      await processWorkoutLog(user.id, weight, reps);

      // Award Battle Pass XP (50% of Titan XP, min 5)
      const bpXp = Math.max(5, Math.ceil(xpGained / 2));
      await addBattlePassXpAction(user.id, bpXp);
    } catch (e) {
      console.error("Challenge Sync Failed", e);
    }

    revalidatePath("/"); // Refresh dashboard

    const newLevel =
      xpResult.success && typeof xpResult.newValue === "object"
        ? (xpResult.newValue as { level: number }).level
        : undefined;

    return {
      success: true,
      message: xpResult.levelUp ? "Level Up!" : "Set Logged",
      newLevel,
      xpGained,
      energyGained,
    };
  } catch (error) {
    console.error("Titan Log Error:", error);
    return { success: false, message: "Failed to log set" };
  }
}

export async function updateActivePathAction(
  path: TrainingPath,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { activePath: path },
    });
    revalidatePath("/");
    return { success: true, message: "Path updated" };
  } catch (error) {
    console.error("Update Path Error:", error);
    return { success: false, message: "Failed to update path" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================
// UNIFIED TITAN SOUL - MUTATION ACTIONS
// Server actions for all Titan state changes
// ============================================

// Mutation schemas
const AwardXpSchema = z.object({
  userId: z.string(),
  amount: z.number().int().positive(),
  source: z.enum(["WORKOUT", "QUEST", "COMBAT", "ACHIEVEMENT", "BONUS"]),
});

const ModifyStatsSchema = z.object({
  userId: z.string(),
  changes: z.object({
    strength: z.number().int().optional(),
    vitality: z.number().int().optional(),
    endurance: z.number().int().optional(),
    agility: z.number().int().optional(),
    willpower: z.number().int().optional(),
  }),
  source: z.string(),
});

const ModifyResourcesSchema = z.object({
  userId: z.string(),
  changes: z.object({
    hp: z.number().int().optional(),
    energy: z.number().int().optional(),
  }),
  source: z.string(),
});

const ModifyEconomySchema = z.object({
  userId: z.string(),
  changes: z.object({
    gold: z.number().int().optional(),
    gems: z.number().int().optional(),
  }),
  source: z.string(),
});

interface MutationResult {
  success: boolean;
  newValue?: unknown;
  levelUp?: boolean;
  message: string;
}

/**
 * Award XP to Titan with level-up handling.
 */
export async function mutateTitanXp(
  input: z.infer<typeof AwardXpSchema>,
): Promise<MutationResult> {
  const validated = AwardXpSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, message: "Invalid XP mutation" };
  }

  const { userId, amount, source } = validated.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User not found" };

    const newXp = user.totalExperience + amount;
    const xpForNextLevel = user.level * 1000;
    let newLevel = user.level;
    let levelUp = false;

    // Level up check
    if (newXp >= xpForNextLevel) {
      newLevel++;
      levelUp = true;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalExperience: newXp,
        level: newLevel,
      },
    });

    console.log(`[MUTATION] XP: +${amount} from ${source} for ${userId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      newValue: { xp: newXp, level: newLevel },
      levelUp,
      message: levelUp ? `Level up! Now level ${newLevel}` : `+${amount} XP`,
    };
  } catch (error) {
    console.error("XP mutation failed:", error);
    return { success: false, message: "XP mutation failed" };
  }
}

/**
 * Modify Titan stats.
 */
export async function mutateTitanStats(
  input: z.infer<typeof ModifyStatsSchema>,
): Promise<MutationResult> {
  const validated = ModifyStatsSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, message: "Invalid stats mutation" };
  }

  const { userId, changes, source } = validated.data;

  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) return { success: false, message: "Titan not found" };

    const updates: Record<string, number> = {};
    if (changes.strength) updates.strength = titan.strength + changes.strength;
    if (changes.vitality) updates.vitality = titan.vitality + changes.vitality;
    if (changes.endurance)
      updates.endurance = titan.endurance + changes.endurance;
    if (changes.agility) updates.agility = titan.agility + changes.agility;
    if (changes.willpower)
      updates.willpower = titan.willpower + changes.willpower;

    await prisma.titan.update({
      where: { userId },
      data: updates,
    });

    console.log(`[MUTATION] Stats: ${JSON.stringify(changes)} from ${source}`);
    revalidatePath("/dashboard");

    return { success: true, newValue: updates, message: "Stats updated" };
  } catch (error) {
    console.error("Stats mutation failed:", error);
    return { success: false, message: "Stats mutation failed" };
  }
}

/**
 * Modify Titan resources (HP, Energy).
 */
export async function mutateTitanResources(
  input: z.infer<typeof ModifyResourcesSchema>,
): Promise<MutationResult> {
  const validated = ModifyResourcesSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, message: "Invalid resource mutation" };
  }

  const { userId, changes, source } = validated.data;

  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) return { success: false, message: "Titan not found" };

    const updates: Record<string, number> = {};
    if (changes.hp !== undefined) {
      updates.currentHp = Math.max(
        0,
        Math.min(titan.maxHp, titan.currentHp + changes.hp),
      );
    }
    if (changes.energy !== undefined) {
      updates.currentEnergy = Math.max(
        0,
        Math.min(100, titan.currentEnergy + changes.energy),
      );
    }

    await prisma.titan.update({
      where: { userId },
      data: updates,
    });

    console.log(
      `[MUTATION] Resources: ${JSON.stringify(changes)} from ${source}`,
    );
    revalidatePath("/dashboard");

    return { success: true, newValue: updates, message: "Resources updated" };
  } catch (error) {
    console.error("Resource mutation failed:", error);
    return { success: false, message: "Resource mutation failed" };
  }
}

/**
 * Modify economy (Gold, Gems).
 */
export async function mutateTitanEconomy(
  input: z.infer<typeof ModifyEconomySchema>,
): Promise<MutationResult> {
  const validated = ModifyEconomySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, message: "Invalid economy mutation" };
  }

  const { userId, changes, source } = validated.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User not found" };

    const updates: Record<string, number> = {};
    if (changes.gold !== undefined) {
      const newGold = user.gold + changes.gold;
      if (newGold < 0) return { success: false, message: "Insufficient gold" };
      updates.gold = newGold;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    console.log(
      `[MUTATION] Economy: ${JSON.stringify(changes)} from ${source}`,
    );
    revalidatePath("/dashboard");

    return { success: true, newValue: updates, message: "Economy updated" };
  } catch (error) {
    console.error("Economy mutation failed:", error);
    return { success: false, message: "Economy mutation failed" };
  }
}

/**
 * Batch mutation for multiple changes at once.
 */
export async function mutateTitanBatch(
  userId: string,
  mutations: Array<{
    type: "xp" | "stats" | "resources" | "economy";
    payload: unknown;
  }>,
): Promise<{ results: MutationResult[] }> {
  const results: MutationResult[] = [];

  for (const mutation of mutations) {
    let result: MutationResult;

    switch (mutation.type) {
      case "xp":
        result = await mutateTitanXp({
          userId,
          ...(mutation.payload as { amount: number; source: "WORKOUT" }),
        });
        break;
      case "stats":
        result = await mutateTitanStats({
          userId,
          ...(mutation.payload as {
            changes: Record<string, number>;
            source: string;
          }),
        });
        break;
      case "resources":
        result = await mutateTitanResources({
          userId,
          ...(mutation.payload as {
            changes: Record<string, number>;
            source: string;
          }),
        });
        break;
      case "economy":
        result = await mutateTitanEconomy({
          userId,
          ...(mutation.payload as {
            changes: Record<string, number>;
            source: string;
          }),
        });
        break;
      default:
        result = { success: false, message: "Unknown mutation type" };
    }

    results.push(result);
  }

  return { results };
}

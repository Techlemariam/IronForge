"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { IntervalsWellness } from "@/types";
import { ProgressionService } from "@/services/progression";

// --- Types ---
export type TitanState = {
  id: string;
  level: number;
  xp: number;
  currentHp: number;
  maxHp: number;
  mood: string;
  currentEnergy: number;
  maxEnergy: number;
  isInjured: boolean;
  isResting: boolean;
  name: string;
  powerRating?: number;
  hrvBaseline?: number | null;
  streak: number;
};

// --- Legacy Schema (Deprecated) ---
const updateTitanSchema = z.object({
  currentHp: z.number().optional(),
  xp: z.number().optional(),
  currentEnergy: z.number().optional(),
  mood: z.string().optional(),
  isInjured: z.boolean().optional(),
});

// --- Actions ---

export async function getTitanAction(userId: string) {
  try {
    const titan = await prisma.titan.findUnique({
      where: { userId },
      include: {
        memories: true,
        scars: true,
      },
    });
    return { success: true, data: titan };
  } catch (error) {
    console.error("Error fetching titan:", error);
    return { success: false, error: "Failed to fetch Titan" };
  }
}

export async function ensureTitanAction(userId: string) {
  try {
    const existing = await prisma.titan.findUnique({ where: { userId } });
    if (existing) return { success: true, data: existing };

    const newTitan = await prisma.titan.create({
      data: {
        userId,
        name: "Iron Initiate",
        level: 1,
        xp: 0,
        currentHp: 100,
        maxHp: 100,
        currentEnergy: 100,
        maxEnergy: 100,
        mood: "NEUTRAL",
      },
    });

    revalidatePath("/citadel");
    return { success: true, data: newTitan };
  } catch (error) {
    console.error("Error ensuring titan:", error);
    return { success: false, error: "Failed to create Titan" };
  }
}

/**
 * @deprecated UNSAFE: Clients should not dictate state directly. Use specific actions below.
 */
export async function updateTitanAction(
  userId: string,
  data: z.infer<typeof updateTitanSchema>,
) {
  try {
    const validated = updateTitanSchema.parse(data);
    const titan = await prisma.titan.update({
      where: { userId },
      data: { ...validated, lastActive: new Date() },
    });
    revalidatePath("/citadel");
    return { success: true, data: titan };
  } catch (error) {
    console.error("Error updating titan:", error);
    return { success: false, error: "Failed to update Titan" };
  }
}

// --- NEW AUTHORITATIVE ACTIONS ---

export async function modifyTitanHealthAction(
  userId: string,
  delta: number,
  _reason: string,
) {
  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) throw new Error("Titan not found");

    let newHp = titan.currentHp + delta;
    // Clamp
    if (newHp > titan.maxHp) newHp = titan.maxHp;
    if (newHp < 0) newHp = 0;

    const isInjured = newHp === 0;

    // Optimistic update of mood if injured
    let mood = titan.mood;
    if (isInjured) mood = "WEAKENED";

    const updated = await prisma.titan.update({
      where: { userId },
      data: {
        currentHp: newHp,
        isInjured: isInjured,
        mood: mood,
        lastActive: new Date(),
      },
    });

    revalidatePath("/citadel");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error modifying health:", error);
    return { success: false, error: error.message };
  }
}

export async function awardTitanXpAction(
  userId: string,
  amount: number,
  _source: string,
) {
  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) throw new Error("Titan not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const decree = titan.dailyDecree as any;
    const multiplier = ProgressionService.calculateMultiplier(
      titan.streak,
      titan.mood,
      user?.subscriptionTier || "FREE",
      decree?.type,
      titan.level,
    );

    const adjustedAmount = Math.floor(amount * multiplier);

    let newXp = titan.xp + adjustedAmount;
    let newLevel = titan.level;
    let leveledUp = false;

    // Simple Level Curve: Level * 1000 XP
    const xpToNext = newLevel * 1000;

    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      leveledUp = true;
    }

    const data: any = {
      xp: newXp,
      level: newLevel,
      lastActive: new Date(),
    };

    if (leveledUp) {
      data.maxHp = 100 + newLevel * 10;
      data.currentHp = data.maxHp; // Heal on level up
      data.currentEnergy = 100; // Refill energy
    }

    const updated = await prisma.titan.update({
      where: { userId },
      data,
    });

    revalidatePath("/citadel");
    return { success: true, data: updated, leveledUp };
  } catch (error: any) {
    console.error("Error awarding XP:", error);
    return { success: false, error: error.message };
  }
}

export async function consumeTitanEnergyAction(userId: string, amount: number) {
  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) throw new Error("Titan not found");

    if (titan.currentEnergy < amount) {
      return { success: false, error: "Not enough energy" };
    }

    const updated = await prisma.titan.update({
      where: { userId },
      data: {
        currentEnergy: { decrement: amount },
        lastActive: new Date(),
      },
    });

    revalidatePath("/citadel");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncTitanStateWithWellness(
  userId: string,
  wellness: IntervalsWellness,
) {
  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) return { success: false, error: "Titan not found" };

    const newEnergy = wellness.bodyBattery || titan.currentEnergy;
    let newMood = "NEUTRAL";
    const sleepScore = wellness.sleepScore || 0;
    const hrv = wellness.hrv || 0;

    if (
      (wellness.bodyBattery && wellness.bodyBattery < 30) ||
      (hrv > 0 && hrv < 30)
    ) {
      newMood = "WEAKENED";
    } else if (
      wellness.bodyBattery &&
      wellness.bodyBattery > 80 &&
      sleepScore > 80
    ) {
      newMood = "FOCUSED";
    }

    const isResting = (wellness.bodyBattery || 100) < 20;

    await prisma.titan.update({
      where: { userId },
      data: {
        currentEnergy: newEnergy,
        mood: newMood,
        isResting: isResting,
        lastActive: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Sync Titan/Wellness failed:", error);
    return { success: false };
  }
}

export async function checkAndIncrementStreakAction(
  userId: string,
  timezone: string = "UTC",
) {
  try {
    const titan = await prisma.titan.findUnique({ where: { userId } });
    if (!titan) throw new Error("Titan not found");

    const now = new Date();
    const lastActive = new Date(titan.lastActive);

    // Use 'en-CA' for ISO-like YYYY-MM-DD format
    const options: Intl.DateTimeFormatOptions = { timeZone: timezone };

    // We catch strict timezone errors by defaulting if invalid
    let todayStr: string;
    let lastActiveStr: string;
    try {
      todayStr = now.toLocaleDateString("en-CA", options);
      lastActiveStr = lastActive.toLocaleDateString("en-CA", options);
    } catch {
      console.warn(
        "Invalid timezone for streak check, defaulting to UTC:",
        timezone,
      );
      // Fallback to UTC if timezone is invalid
      const utcOptions = { timeZone: "UTC" };
      todayStr = now.toLocaleDateString("en-CA", utcOptions);
      lastActiveStr = lastActive.toLocaleDateString("en-CA", utcOptions);
    }

    if (todayStr === lastActiveStr) {
      return { success: true, streak: titan.streak, status: "SAME_DAY" };
    }

    // Determine "Yesterday" in the user's timezone
    const yesterdayTs = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let yesterdayStr: string;
    try {
      yesterdayStr = yesterdayTs.toLocaleDateString("en-CA", options);
    } catch {
      yesterdayStr = yesterdayTs.toLocaleDateString("en-CA", {
        timeZone: "UTC",
      });
    }

    let newStreak = 1;
    if (lastActiveStr === yesterdayStr) {
      newStreak = titan.streak + 1;
    }

    // Optimistic update
    await prisma.titan.update({
      where: { userId },
      data: {
        streak: newStreak,
        lastActive: new Date(),
      },
    });

    revalidatePath("/citadel");
    revalidatePath("/dashboard");

    return { success: true, streak: newStreak, status: "UPDATED" };
  } catch (error: any) {
    console.error("Streak update failed:", error);
    return { success: false, error: error.message };
  }
}

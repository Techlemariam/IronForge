"use server";

import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS_DATA } from "@/data/achievements";
import { revalidatePath } from "next/cache";

/**
 * Checks and unlocks achievements based on various triggers.
 * Should be called after key actions (log workout, join guild, etc).
 */
export async function checkAchievementsAction(userId: string) {
  // 1. Fetch current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          exerciseLogs: true,
          cardioLogs: true,
          unlockedMonsters: true,
        },
      },
      achievements: {
        include: { achievement: true },
      },
      guild: true,
    },
  });

  if (!user) return [];

  const unlockedNow = [];

  // 2. Iterate through definitions
  // In strict implementation, we'd query Achievement table, but using const data for speed/simplicity
  // assuming we sync them or just use code reference.
  // Let's assume we use the data from src/data/achievements and Upsert them to DB if missing?
  // For now, check logic against hardcoded rules.

  for (const ach of ACHIEVEMENTS_DATA) {
    // Check if already unlocked
    const hasIt = user.achievements.some(
      (ua) => ua.achievementId === ach.code || ua.achievement.code === ach.code,
    );
    // Note: Relation might be tricky if achievementId is not code.
    // Let's assume we find Achievement by code.

    if (hasIt) continue;

    let qualified = false;

    if (ach.condition.type === "count") {
      const target = ach.condition.target as number;
      if (ach.condition.metric === "workout") {
        qualified = user._count.exerciseLogs >= target;
      }
      if (ach.condition.metric === "cardio") {
        qualified = user._count.cardioLogs >= target;
      }
      if (ach.condition.metric === "boss_kill") {
        qualified = user._count.unlockedMonsters >= target;
      }
    } else if (ach.condition.type === "boolean") {
      if (ach.condition.metric === "guild") {
        qualified = !!user.guildId;
      }
    }

    if (qualified) {
      // Unlock it!
      // First ensure Achievement exists in DB
      const dbAch = await prisma.achievement.upsert({
        where: { code: ach.code },
        update: {},
        create: {
          code: ach.code,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          condition: ach.condition as any,
        },
      });

      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: dbAch.id,
        },
      });

      unlockedNow.push(ach);
    }
  }

  if (unlockedNow.length > 0) {
    revalidatePath("/dashboard");
    // Return unlocked for Toast
    return { newUnlocks: unlockedNow };
  }

  return { newUnlocks: [] };
}

export async function getUnlockedAchievementsAction(userId: string) {
  const data = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });
  return data.map((ua) => ua.achievement);
}

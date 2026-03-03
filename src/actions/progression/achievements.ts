"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS_DATA } from "@/data/achievements";
import { revalidatePath } from "next/cache";

export const checkAchievementsAction = authActionClient
  .schema(z.object({ _trigger: z.string().optional() }))
  .action(async ({ ctx: { userId } }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { exerciseLogs: true, cardioLogs: true, unlockedMonsters: true } },
        achievements: { include: { achievement: true } },
        guild: true,
      },
    });

    if (!user) return { newUnlocks: [] };

    const unlockedNow = [];

    for (const ach of ACHIEVEMENTS_DATA) {
      const hasIt = user.achievements.some(
        (ua) => ua.achievementId === ach.code || ua.achievement.code === ach.code,
      );
      if (hasIt) continue;

      let qualified = false;
      if (ach.condition.type === "count") {
        const target = ach.condition.target as number;
        if (ach.condition.metric === "workout") qualified = user._count.exerciseLogs >= target;
        if (ach.condition.metric === "cardio") qualified = user._count.cardioLogs >= target;
        if (ach.condition.metric === "boss_kill") qualified = user._count.unlockedMonsters >= target;
      } else if (ach.condition.type === "boolean") {
        if (ach.condition.metric === "guild") qualified = !!user.guildId;
      }

      if (qualified) {
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
        await prisma.userAchievement.create({ data: { userId, achievementId: dbAch.id } });
        unlockedNow.push(ach);
      }
    }

    if (unlockedNow.length > 0) revalidatePath("/dashboard");
    return { newUnlocks: unlockedNow };
  });

export const getUnlockedAchievementsAction = authActionClient
  .action(async ({ ctx: { userId } }) => {
    const data = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });
    return data.map((ua) => ua.achievement);
  });

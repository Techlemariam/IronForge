"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

export const sendChatAction = authActionClient
  .schema(z.string().min(1).max(255))
  .action(async ({ parsedInput: message, ctx: { userId } }) => {
    // Get Hero Name from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { heroName: true },
    });

    const userName = dbUser?.heroName || "Unknown Hero";

    return prisma.chatMessage.create({
      data: {
        userName: userName,
        message: message.trim().slice(0, 255), // Limit length
        type: "CHAT",
      },
    });
  });

export const attackBossAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: bossId, ctx: { userId } }) => {
    // 1. Get Boss
    const boss = await prisma.raidBoss.findUnique({
      where: { id: bossId },
    });

    if (!boss || !boss.isActive) {
      throw new Error("Boss not found or inactive");
    }

    if (boss.currentHp <= 0) {
      return { message: "Boss is already defeated!" };
    }

    // 2. Performance Coach Check: Kinetic Energy
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { heroName: true, kineticEnergy: true },
    });

    const currentEnergy = dbUser?.kineticEnergy || 0;
    const ENERGY_COST = 5; // Configurable cost per click

    if (currentEnergy < ENERGY_COST) {
      throw new Error("Insufficient Kinetic Energy. Go lift something!");
    }

    // 3. Calculate Damage
    const damage = Math.floor(Math.random() * 100) + 50;
    const newHp = boss.currentHp - BigInt(damage);
    const finalHp = newHp < 0 ? BigInt(0) : newHp;

    // 4. Update Boss
    await prisma.raidBoss.update({
      where: { id: bossId },
      data: { currentHp: finalHp },
    });

    // 5. Deduct Kinetic Energy (Performance Coach)
    await prisma.user.update({
      where: { id: userId },
      data: { kineticEnergy: { decrement: ENERGY_COST } },
    });

    // Log to chat if it's a kill
    if (finalHp === BigInt(0)) {
      await prisma.chatMessage.create({
        data: {
          userName: "System",
          message: `${dbUser?.heroName || "A Hero"} dealt the killing blow to ${boss.name}!`,
          type: "LOG",
        },
      });
    }

    return {
      damage: damage,
      newHp: finalHp.toString(),
      defeated: finalHp === BigInt(0),
    };
  });

export const getUserStatsAction = authActionClient
  .action(async ({ ctx: { userId } }) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { heroName: true, kineticEnergy: true },
    });

    return dbUser;
  });

export const contributeGuildDamageAction = authActionClient
  .schema(z.object({
    damage: z.number().positive(),
    sessionId: z.string().optional()
  }))
  .action(async ({ parsedInput: { damage }, ctx: { userId } }) => {
    if (damage <= 0) return { success: true, damageDealt: 0 };

    try {
      // 1. Get user's guild
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { guildId: true },
      });

      if (!user?.guildId) {
        return { success: false, error: "No guild found" };
      }

      // 2. Get active active raid for this guild
      const activeRaid = await prisma.guildRaid.findFirst({
        where: {
          guildId: user.guildId,
          endDate: { gt: new Date() }, // Still ongoing
          currentHp: { gt: 0 },
        },
        orderBy: { startDate: "desc" },
      });

      if (!activeRaid) {
        return { success: false, error: "No active raid found" };
      }

      // 3. Apply Damage in Transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedRaid = await tx.guildRaid.update({
          where: { id: activeRaid.id },
          data: {
            currentHp: {
              decrement: damage,
            },
          },
        });

        // Ensure non-negative
        if (updatedRaid.currentHp < 0) {
          await tx.guildRaid.update({
            where: { id: activeRaid.id },
            data: { currentHp: 0 },
          });
        }

        await tx.guildRaidContribution.create({
          data: {
            raidId: activeRaid.id,
            userId: userId,
            damage: damage,
            timestamp: new Date(),
          },
        });

        return updatedRaid;
      });

      const finalHp = Math.max(0, result.currentHp);
      revalidatePath("/dashboard");

      return {
        success: true,
        bossHp: finalHp,
        bossTotalHp: activeRaid.totalHp,
        damageDealt: damage,
      };
    } catch (error) {
      console.error("Guild Raid Error:", error);
      return { success: false, error: "Failed to contribute damage" };
    }
  });

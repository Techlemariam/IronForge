"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface SharedRewardConfig {
  bonusType: "XP" | "GOLD" | "BOTH";
  percentage: number; // Bonus percentage for guild members
  description: string;
}

const GUILD_BONUS_TIERS: Record<number, SharedRewardConfig> = {
  5: {
    bonusType: "XP",
    percentage: 5,
    description: "+5% XP (5+ active members)",
  },
  10: {
    bonusType: "BOTH",
    percentage: 10,
    description: "+10% XP/Gold (10+ members)",
  },
  20: {
    bonusType: "BOTH",
    percentage: 15,
    description: "+15% XP/Gold (20+ members)",
  },
  50: {
    bonusType: "BOTH",
    percentage: 20,
    description: "+20% XP/Gold (50+ members)",
  },
};

/**
 * Calculate guild bonus multiplier based on activity.
 */
export async function calculateGuildBonusAction(userId: string): Promise<{
  hasGuild: boolean;
  bonusMultiplier: number;
  bonusDescription: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        guild: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    if (!user?.guild) {
      return {
        hasGuild: false,
        bonusMultiplier: 1.0,
        bonusDescription: "Join a guild for bonus rewards!",
      };
    }

    const memberCount = user.guild._count.members;
    let applicableBonus: SharedRewardConfig | null = null;

    // Find highest applicable tier
    for (const [threshold, config] of Object.entries(GUILD_BONUS_TIERS)) {
      if (memberCount >= parseInt(threshold)) {
        applicableBonus = config;
      }
    }

    if (!applicableBonus) {
      return {
        hasGuild: true,
        bonusMultiplier: 1.0,
        bonusDescription: "Recruit more members for guild bonuses!",
      };
    }

    return {
      hasGuild: true,
      bonusMultiplier: 1 + applicableBonus.percentage / 100,
      bonusDescription: applicableBonus.description,
    };
  } catch (error) {
    console.error("Error calculating guild bonus:", error);
    return {
      hasGuild: false,
      bonusMultiplier: 1.0,
      bonusDescription: "Error calculating bonus",
    };
  }
}

/**
 * Award shared rewards to all online guild members.
 */
export async function awardGuildSharedRewardAction(
  guildId: string,
  baseXp: number,
  baseGold: number,
  _source: string,
): Promise<{ success: boolean; membersRewarded: number }> {
  try {
    const members = await prisma.user.findMany({
      where: { guildId },
      select: { id: true },
    });

    let rewarded = 0;

    for (const member of members) {
      const bonus = await calculateGuildBonusAction(member.id);
      const xpShare = Math.round(baseXp * 0.1 * bonus.bonusMultiplier); // 10% share
      const _goldShare = Math.round(baseGold * 0.1);

      if (xpShare > 0) {
        await prisma.titan.updateMany({
          where: { userId: member.id },
          data: { xp: { increment: xpShare } },
        });
        rewarded++;
      }
    }

    revalidatePath("/guild");
    return { success: true, membersRewarded: rewarded };
  } catch (error) {
    console.error("Error awarding guild rewards:", error);
    return { success: false, membersRewarded: 0 };
  }
}

/**
 * Get guild activity summary for reward calculation.
 */
export async function getGuildActivitySummaryAction(guildId: string): Promise<{
  weeklyWorkouts: number;
  weeklyVolume: number;
  activeMembers: number;
  topContributor: { userId: string; heroName: string; workouts: number } | null;
}> {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const members = await prisma.user.findMany({
      where: { guildId },
      include: {
        exerciseLogs: {
          where: { date: { gte: weekAgo.toISOString() } },
        },
      },
    });

    let totalWorkouts = 0;
    let totalVolume = 0;
    const activeMembers = new Set<string>();

    members.forEach((member) => {
      totalWorkouts += member.exerciseLogs.length;
      if (member.exerciseLogs.length > 0) {
        activeMembers.add(member.id);
      }
    });

    const topContributorMember = [...members].sort(
      (a, b) => b.exerciseLogs.length - a.exerciseLogs.length,
    )[0];

    const hasTopContributor =
      topContributorMember && topContributorMember.exerciseLogs.length > 0;

    return {
      weeklyWorkouts: totalWorkouts,
      weeklyVolume: totalVolume,
      activeMembers: activeMembers.size,
      topContributor: hasTopContributor
        ? {
          userId: topContributorMember.id,
          heroName: topContributorMember.heroName || "Unknown",
          workouts: topContributorMember.exerciseLogs.length,
        }
        : null,
    };
  } catch (error) {
    console.error("Error getting guild activity:", error);
    return {
      weeklyWorkouts: 0,
      weeklyVolume: 0,
      activeMembers: 0,
      topContributor: null,
    };
  }
}

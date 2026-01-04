"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface DailyReward {
  day: number;
  xp: number;
  gold: number;
  bonus?: string;
  crateRarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  isMilestone: boolean;
}

interface LoginRewardStatus {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  todaysClaimed: boolean;
  nextReward: DailyReward;
  upcomingRewards: DailyReward[];
}

// 7-day reward cycle
const REWARD_CYCLE: DailyReward[] = [
  { day: 1, xp: 50, gold: 25, isMilestone: false },
  { day: 2, xp: 75, gold: 50, isMilestone: false },
  { day: 3, xp: 100, gold: 75, crateRarity: "COMMON", isMilestone: true },
  { day: 4, xp: 125, gold: 100, isMilestone: false },
  { day: 5, xp: 150, gold: 150, isMilestone: false },
  { day: 6, xp: 200, gold: 200, crateRarity: "UNCOMMON", isMilestone: true },
  {
    day: 7,
    xp: 500,
    gold: 500,
    crateRarity: "RARE",
    bonus: "Weekly Bonus!",
    isMilestone: true,
  },
];

// Special milestone rewards
const MILESTONE_REWARDS: Record<
  number,
  { xp: number; gold: number; bonus: string; crateRarity?: string }
> = {
  7: { xp: 1000, gold: 500, bonus: "First Week Complete!" },
  14: { xp: 2000, gold: 1000, bonus: "Two Weeks Strong!", crateRarity: "RARE" },
  30: { xp: 5000, gold: 2500, bonus: "Monthly Champion!", crateRarity: "EPIC" },
  90: {
    xp: 15000,
    gold: 7500,
    bonus: "Quarterly Legend!",
    crateRarity: "LEGENDARY",
  },
  365: {
    xp: 50000,
    gold: 25000,
    bonus: "IRON VETERAN!",
    crateRarity: "LEGENDARY",
  },
};

/**
 * Get login reward status.
 */
export async function getLoginRewardStatusAction(
  userId: string,
): Promise<LoginRewardStatus> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastLoginDate: true,
        loginStreak: true,
        longestLoginStreak: true,
      },
    });

    const today = new Date().toISOString().split("T")[0];
    const lastLogin = user?.lastLoginDate?.toISOString().split("T")[0];
    const currentStreak = user?.loginStreak || 0;
    const todaysClaimed = lastLogin === today;

    // Calculate next reward (cycle repeats)
    const cycleDay = (currentStreak % 7) + 1;
    const nextReward = REWARD_CYCLE[cycleDay - 1];

    // Get upcoming rewards
    const upcomingRewards: DailyReward[] = [];
    for (let i = 0; i < 3; i++) {
      const futureDay = ((currentStreak + i) % 7) + 1;
      upcomingRewards.push({
        ...REWARD_CYCLE[futureDay - 1],
        day: currentStreak + i + 1,
      });
    }

    return {
      currentStreak,
      longestStreak: user?.longestLoginStreak || currentStreak,
      lastLoginDate: lastLogin || "",
      todaysClaimed,
      nextReward: { ...nextReward, day: currentStreak + 1 },
      upcomingRewards,
    };
  } catch (error) {
    console.error("Error getting login reward status:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: "",
      todaysClaimed: false,
      nextReward: REWARD_CYCLE[0],
      upcomingRewards: REWARD_CYCLE.slice(0, 3),
    };
  }
}

/**
 * Claim daily login reward.
 */
export async function claimLoginRewardAction(userId: string): Promise<{
  success: boolean;
  reward?: DailyReward;
  milestoneReward?: (typeof MILESTONE_REWARDS)[7];
  message: string;
}> {
  try {
    const status = await getLoginRewardStatusAction(userId);

    if (status.todaysClaimed) {
      return { success: false, message: "Already claimed today!" };
    }

    const newStreak = status.currentStreak + 1;
    const cycleDay = newStreak % 7 || 7;
    const reward = REWARD_CYCLE[cycleDay - 1];

    // Check for milestone rewards
    const milestoneReward = MILESTONE_REWARDS[newStreak];

    // Update user streak
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginDate: new Date(),
        loginStreak: newStreak,
        longestLoginStreak: Math.max(newStreak, status.longestStreak),
      },
    });

    console.log(
      `Claimed login reward: day ${newStreak}, +${reward.xp} XP, +${reward.gold} Gold`,
    );
    revalidatePath("/");

    return {
      success: true,
      reward: { ...reward, day: newStreak },
      milestoneReward,
      message: milestoneReward
        ? `${milestoneReward.bonus} Day ${newStreak} streak!`
        : `Day ${newStreak} reward claimed!`,
    };
  } catch (error) {
    console.error("Error claiming login reward:", error);
    return { success: false, message: "Failed to claim reward" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ReferralCode {
  code: string;
  userId: string;
  createdAt: Date;
  usedCount: number;
  totalEarnings: { xp: number; gold: number };
}

interface ReferralReward {
  type: "REFERRER" | "REFERRED";
  xp: number;
  gold: number;
  crateRarity?: string;
  milestone?: string;
}

// Rewards for referrer (per successful referral)
const REFERRER_REWARDS = {
  base: { xp: 500, gold: 250 },
  milestones: {
    3: {
      xp: 1000,
      gold: 500,
      crateRarity: "RARE",
      milestone: "Social Butterfly",
    },
    5: { xp: 2000, gold: 1000, crateRarity: "EPIC", milestone: "Recruiter" },
    10: {
      xp: 5000,
      gold: 2500,
      crateRarity: "LEGENDARY",
      milestone: "Army Builder",
    },
    25: {
      xp: 10000,
      gold: 5000,
      crateRarity: "LEGENDARY",
      milestone: "Guild Master",
    },
  },
};

// Rewards for referred user
const REFERRED_REWARDS = {
  xp: 1000,
  gold: 500,
  crateRarity: "UNCOMMON",
};

/**
 * Generate unique referral code for user.
 */
export async function generateReferralCodeAction(
  userId: string,
): Promise<{ code: string }> {
  try {
    // Generate 8-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    console.log(`Generated referral code for ${userId}: ${code}`);
    return { code };
  } catch (error) {
    console.error("Error generating referral code:", error);
    return { code: "" };
  }
}

/**
 * Get user's referral stats.
 */
export async function getReferralStatsAction(userId: string): Promise<{
  code: string;
  referralCount: number;
  pendingRewards: number;
  totalEarned: { xp: number; gold: number };
  nextMilestone?: { count: number; reward: ReferralReward };
}> {
  try {
    // MVP: Return sample data
    return {
      code: "IRON2025",
      referralCount: 3,
      pendingRewards: 0,
      totalEarned: { xp: 1500, gold: 750 },
      nextMilestone: {
        count: 5,
        reward: {
          type: "REFERRER",
          xp: 2000,
          gold: 1000,
          crateRarity: "EPIC",
          milestone: "Recruiter",
        },
      },
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return {
      code: "",
      referralCount: 0,
      pendingRewards: 0,
      totalEarned: { xp: 0, gold: 0 },
    };
  }
}

/**
 * Apply referral code during signup.
 */
export async function applyReferralCodeAction(
  newUserId: string,
  referralCode: string,
): Promise<{
  success: boolean;
  referrerReward?: ReferralReward;
  referredReward?: ReferralReward;
}> {
  try {
    // Validate code exists
    if (!referralCode || referralCode.length !== 8) {
      return { success: false };
    }

    // In production, look up referrer and validate
    console.log(`Applied referral code ${referralCode} for user ${newUserId}`);

    const referrerReward: ReferralReward = {
      type: "REFERRER",
      ...REFERRER_REWARDS.base,
    };

    const referredReward: ReferralReward = {
      type: "REFERRED",
      ...REFERRED_REWARDS,
    };

    revalidatePath("/referrals");
    return {
      success: true,
      referrerReward,
      referredReward,
    };
  } catch (error) {
    console.error("Error applying referral code:", error);
    return { success: false };
  }
}

/**
 * Get referral leaderboard.
 */
export async function getReferralLeaderboardAction(
  limit: number = 10,
): Promise<Array<{ rank: number; heroName: string; referralCount: number }>> {
  // MVP: Return sample leaderboard
  return [
    { rank: 1, heroName: "RecruitMaster", referralCount: 47 },
    { rank: 2, heroName: "SocialKing", referralCount: 35 },
    { rank: 3, heroName: "GrowthHacker", referralCount: 28 },
    { rank: 4, heroName: "TeamBuilder", referralCount: 22 },
    { rank: 5, heroName: "NetworkPro", referralCount: 18 },
  ];
}

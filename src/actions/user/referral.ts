"use server";


import { revalidatePath } from "next/cache";

export async function getReferralStatsAction(_userId: string): Promise<{
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
  _limit: number = 10,
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

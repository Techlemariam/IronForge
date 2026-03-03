"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

type WeeklyChallengeType = "COMMUNITY" | "GUILD" | "GLOBAL";

interface WeeklyChallenge {
  id: string;
  type: WeeklyChallengeType;
  name: string;
  description: string;
  goal: number;
  currentProgress: number;
  userContribution: number;
  participants: number;
  startsAt: Date;
  endsAt: Date;
  rewards: WeeklyChallengeReward[];
  tiers: ChallengeTier[];
  isActive: boolean;
}

interface ChallengeTier {
  level: number;
  targetPercentage: number;
  reached: boolean;
  rewardMultiplier: number;
}

interface WeeklyChallengeReward {
  type: "XP" | "GOLD" | "CRATE" | "COSMETIC";
  name: string;
  value: number;
  tier: number;
}

/**
 * Get current weekly challenges.
 */
export async function getWeeklyChallengesAction(
  _userId: string,
): Promise<WeeklyChallenge[]> {
  const now = new Date();

  // Use fresh Date copies to avoid mutating `now` across calculations
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  weekEnd.setHours(23, 59, 59, 999);

  return [
    {
      id: "wc1",
      type: "COMMUNITY",
      name: "Iron Uprising",
      description: "Community goal: Lift 10,000,000 kg together!",
      goal: 10000000,
      currentProgress: 7250000,
      userContribution: 45000,
      participants: 1247,
      startsAt: weekStart,
      endsAt: weekEnd,
      rewards: [
        { type: "XP", name: "Community XP", value: 500, tier: 1 },
        { type: "GOLD", name: "Bonus Gold", value: 250, tier: 2 },
        { type: "CRATE", name: "Epic Crate", value: 1, tier: 3 },
      ],
      tiers: [
        { level: 1, targetPercentage: 50, reached: true, rewardMultiplier: 1 },
        {
          level: 2,
          targetPercentage: 75,
          reached: true,
          rewardMultiplier: 1.5,
        },
        {
          level: 3,
          targetPercentage: 100,
          reached: false,
          rewardMultiplier: 2,
        },
      ],
      isActive: true,
    },
    {
      id: "wc2",
      type: "GLOBAL",
      name: "PR Week",
      description: "Set personal records across all lifts",
      goal: 5000,
      currentProgress: 3200,
      userContribution: 3,
      participants: 2100,
      startsAt: weekStart,
      endsAt: weekEnd,
      rewards: [
        { type: "XP", name: "PR Hunter XP", value: 1000, tier: 1 },
        { type: "COSMETIC", name: "PR Crown", value: 1, tier: 3 },
      ],
      tiers: [
        { level: 1, targetPercentage: 33, reached: true, rewardMultiplier: 1 },
        {
          level: 2,
          targetPercentage: 66,
          reached: false,
          rewardMultiplier: 1.5,
        },
        {
          level: 3,
          targetPercentage: 100,
          reached: false,
          rewardMultiplier: 2,
        },
      ],
      isActive: true,
    },
  ];
}

const MAX_CONTRIBUTION_AMOUNT = 1_000_000;

/**
 * Contribute to weekly challenge.
 * userId is derived from the server-side session via authActionClient context — not trusted from caller.
 */
export const contributeToWeeklyChallengeAction = authActionClient
  .schema(
    z.object({
      challengeId: z.string().uuid(),
      amount: z
        .number()
        .int()
        .min(1, "Amount must be at least 1")
        .max(MAX_CONTRIBUTION_AMOUNT, `Amount cannot exceed ${MAX_CONTRIBUTION_AMOUNT}`),
    }),
  )
  .action(
    async ({
      parsedInput: { challengeId, amount },
      ctx: { userId: _userId },
    }) => {
      try {
        // userId obtained from session context (not caller param). Log redacted.
        console.log(`contributeToWeeklyChallengeAction: +${amount} on challenge [ID]`);
        revalidatePath("/weekly-challenges");
        // TODO: persist contribution to DB and compute real tierReached
        return { success: true, newProgress: 7250000 + amount };
      } catch (error) {
        console.error("Error contributing:", error);
        return { success: false, newProgress: 0 };
      }
    },
  );

/**
 * Claim weekly challenge rewards.
 * userId is derived from server-side session — the caller-provided userId param is ignored.
 */
export const claimWeeklyChallengeRewardsAction = authActionClient
  .schema(z.object({ challengeId: z.string().uuid() }))
  .action(
    async ({ parsedInput: { challengeId }, ctx: { userId: _userId } }) => {
      try {
        // TODO: verify challenge exists, verify eligibility, check not already claimed, then persist
        const rewards: WeeklyChallengeReward[] = [
          { type: "XP", name: "Community XP", value: 500, tier: 1 },
          { type: "GOLD", name: "Bonus Gold", value: 250, tier: 2 },
        ];

        console.log(`claimWeeklyChallengeRewardsAction: challenge claimed [challengeId redacted]`);
        revalidatePath("/weekly-challenges");
        return { success: true, rewards };
      } catch (error) {
        console.error("Error claiming rewards:", error);
        return { success: false, rewards: [] };
      }
    },
  );

/**
 * Get weekly challenge leaderboard.
 */
export async function getWeeklyChallengeLeaderboardAction(
  _challengeId: string,
  _limit: number = 10,
): Promise<Array<{ rank: number; heroName: string; contribution: number }>> {
  return [
    { rank: 1, heroName: "VolumeKing", contribution: 125000 },
    { rank: 2, heroName: "IronGiant", contribution: 98000 },
    { rank: 3, heroName: "MightLord", contribution: 87000 },
    { rank: 4, heroName: "StormBreaker", contribution: 76000 },
    { rank: 5, heroName: "You", contribution: 45000 },
  ];
}

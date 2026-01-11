"use server";

/**
 * Challenges Server Actions
 *
 * Manages the lifecycle of daily and weekly challenges, including
 * automatic seeding, fetching active challenges, and claiming rewards.
 *
 * @module actions/challenges
 */
import { addBattlePassXpAction } from "@/actions/systems/battle-pass";
import { createClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { ChallengeType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ChallengeCriteria {
  metric: "volume_kg" | "workouts" | "distance_km" | "duration_min";
  target: number;
  unit?: string;
}

export interface ChallengeRewards {
  xp: number;
  gold: number;
  kinetic: number;
}

const DEFAULT_CHALLENGES = [
  {
    code: "WEEKLY_VOL_1",
    title: "Heavy Lifter",
    description: "Lift 10,000 kg total volume this week",
    type: ChallengeType.WEEKLY,
    criteria: { metric: "volume_kg", target: 10000, unit: "kg" },
    rewards: { xp: 500, gold: 100, kinetic: 50 },
  },
  {
    code: "DAILY_WORKOUT_1",
    title: "Daily Grinder",
    description: "Complete 1 workout today",
    type: ChallengeType.DAILY,
    criteria: { metric: "workouts", target: 1 },
    rewards: { xp: 100, gold: 20, kinetic: 10 },
  },
];

async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function seedChallenges() {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  for (const c of DEFAULT_CHALLENGES) {
    const endDate = c.type === ChallengeType.DAILY ? tomorrow : nextWeek;

    // Upsert definition
    await prisma.challenge.upsert({
      where: { code: c.code },
      create: {
        code: c.code,
        title: c.title,
        description: c.description,
        type: c.type,
        criteria: c.criteria as any,
        rewards: c.rewards as any,
        startDate: now,
        endDate: endDate,
      },
      update: {
        // Refresh inactive challenges? For now, do nothing if exists
      },
    });
  }
}

/**
 * Fetches all currently active challenges for the authenticated user.
 *
 * If no active challenges exist in the system, this function will automatically
 * seed a default set of challenges.
 *
 * @returns {Promise<Array<Challenge & { userStatus: UserChallenge }>>} List of challenges with user progress.
 */
export async function getActiveChallengesAction() {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) throw new Error("User not found");

  // Lazy Seed
  const count = await prisma.challenge.count({
    where: { endDate: { gt: new Date() } },
  });
  if (count === 0) {
    await seedChallenges();
  }

  // Fetch active
  const challenges = await prisma.challenge.findMany({
    where: { endDate: { gt: new Date() } },
  });

  // Fetch user progress for these
  const userProgress = await prisma.userChallenge.findMany({
    where: {
      userId: user.id,
      challengeId: { in: challenges.map((c) => c.id) },
    },
  });

  // Map to View Model
  return challenges.map((c) => {
    const progress = userProgress.find((up) => up.challengeId === c.id);
    return {
      ...c,
      criteria: c.criteria as unknown as ChallengeCriteria,
      rewards: c.rewards as unknown as ChallengeRewards,
      userStatus: progress || {
        progress: 0,
        completed: false,
        claimed: false,
      },
    };
  });
}

/**
 * Claims the rewards for a completed challenge.
 *
 * Validates that the challenge is completed and not yet claimed.
 * Updates user resources (Gold, XP, Kinetic Energy) and marks the challenge as claimed.
 *
 * @param {string} challengeId - The ID of the challenge to claim.
 * @returns {Promise<{success: boolean, newGold: number}>} Result and updated gold balance.
 * @throws {Error} If challenge is not found, not completed, or already claimed.
 */
export async function claimChallengeAction(challengeId: string) {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) throw new Error("User not found");

  const record = await prisma.userChallenge.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
    include: { challenge: true },
  });

  if (!record) throw new Error("Challenge not started");
  if (!record.completed) throw new Error("Challenge not completed");
  if (record.claimed) throw new Error("Already claimed");

  const rewards = record.challenge.rewards as unknown as ChallengeRewards;

  // Transaction
  const result = await prisma.$transaction([
    prisma.userChallenge.update({
      where: { userId_challengeId: { userId: user.id, challengeId } },
      data: { claimed: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        gold: { increment: rewards.gold },
        totalExperience: { increment: rewards.xp },
        kineticEnergy: { increment: rewards.kinetic },
      },
    }),
  ]);

  // Award BP XP
  await addBattlePassXpAction(user.id, 50);

  revalidatePath("/dashboard");
  return { success: true, newGold: result[1].gold };
}

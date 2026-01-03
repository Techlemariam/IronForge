import prisma from "@/lib/prisma";
import { ACHIEVEMENTS } from "../data/static";
import { calculateWilks } from "@/utils/wilks";

/**
 * Progression Service (Server-Side)
 * Handles XP and Gold management using Prisma.
 */

const XP_PER_ACHIEVEMENT_POINT = 100;
const XP_LEVEL_THRESHOLD = 1000;

export const ProgressionService = {
  /**
   * Awards Gold to a user.
   */
  async awardGold(userId: string, amount: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { gold: { increment: amount } },
    });
  },

  /**
   * Awards Experience to a user and handles leveling.
   */
  async addExperience(userId: string, amount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalExperience: true, level: true },
    });

    if (!user) throw new Error("User not found");

    const newTotalXp = user.totalExperience + amount;
    const newLevel = Math.floor(newTotalXp / XP_LEVEL_THRESHOLD) + 1;

    return prisma.user.update({
      where: { id: userId },
      data: {
        totalExperience: newTotalXp,
        level: newLevel,
      },
    });
  },

  /**
   * Awards an achievement and its associated rewards.
   */
  async awardAchievement(userId: string, achievementId: string) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    // 1. Record the achievement
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      create: { userId, achievementId },
      update: {}, // Already has it
    });

    // 2. Award rewards
    const goldReward = achievement.points * 50;
    const xpReward = achievement.points * XP_PER_ACHIEVEMENT_POINT;

    await this.awardGold(userId, goldReward);
    await this.addExperience(userId, xpReward);
  },

  /**
   * Gets the full progression state for a user.
   */
  async getProgressionState(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        totalExperience: true,
        gold: true,
        kineticEnergy: true,
      },
    });

    if (!user) return null;

    const xpInCurrentLevel = user.totalExperience % XP_LEVEL_THRESHOLD;
    const progressPct = (xpInCurrentLevel / XP_LEVEL_THRESHOLD) * 100;
    const xpToNextLevel = XP_LEVEL_THRESHOLD - xpInCurrentLevel;

    return {
      level: user.level,
      totalXp: user.totalExperience,
      xpToNextLevel,
      progressPct,
      gold: user.gold,
      kineticEnergy: user.kineticEnergy,
    };
  },

  /**
   * Calculates and updates the user's Wilks Score based on best lifts.
   */
  async updateWilksScore(userId: string) {
    // 1. Get User Bodyweight
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bodyWeight: true },
    });

    if (!user) throw new Error("User not found");

    // 2. Find Best Lifts (e1rm)
    // We look for exercise names that distinctively match powerlifts
    // This is a naive heuristic; ideally we'd have semantic tags.
    const bestSquat = await this.findBestLift(userId, [
      "Squat",
      "Back Squat",
      "Low Bar Squat",
    ]);
    const bestBench = await this.findBestLift(userId, [
      "Bench Press",
      "Flat Barbell Bench Press",
    ]);
    const bestDeadlift = await this.findBestLift(userId, [
      "Deadlift",
      "Conventional Deadlift",
      "Sumo Deadlift",
    ]);

    const total = bestSquat + bestBench + bestDeadlift;

    if (total === 0) return 0;

    // 3. Calculate Wilks
    // Warning: Assuming 'male' coeffs for now until Gender is in User model.
    // TODO: Add gender to User model for accurate Wilks.
    const wilks = calculateWilks({
      weightLifted: total,
      bodyWeight: user.bodyWeight,
      sex: "male",
    });

    // 4. Update PVP Profile
    await prisma.pvpProfile.upsert({
      where: { userId },
      create: {
        userId,
        highestWilksScore: wilks,
        rankScore: 1000, // Default
      },
      update: {
        highestWilksScore: wilks,
      },
    });

    return wilks;
  },

  /**
   * Helper to find max e1rm for a set of exercise names.
   * Calculates e1rm from the sets JSON (Epley formula: weight * (1 + reps/30))
   */
  async findBestLift(userId: string, exerciseNames: string[]): Promise<number> {
    // Fetch all logs for matching exercises
    const logs = await prisma.exerciseLog.findMany({
      where: {
        userId,
        OR: exerciseNames.map((name) => ({
          exerciseId: { contains: name, mode: "insensitive" },
        })),
      },
      select: { sets: true },
    });

    let maxE1rm = 0;

    for (const log of logs) {
      const sets = log.sets as Array<{ weight?: number; reps?: number }>;
      if (!sets || !Array.isArray(sets)) continue;

      for (const set of sets) {
        if (set.weight && set.reps) {
          // Epley formula: e1rm = weight * (1 + reps/30)
          const e1rm = set.weight * (1 + set.reps / 30);
          if (e1rm > maxE1rm) maxE1rm = e1rm;
        }
      }
    }

    return maxE1rm;
  },

  /**
   * Calculates the XP multiplier based on Streak, Mood, and Subscription.
   * @param streak Current streak count
   * @param mood Titan mood (HAPPY, FOCUSED, etc)
   * @param subscriptionTier User subscription (FREE, PRO, LIFETIME)
   * @param decreeType Oracle Decree type (BUFF, NEUTRAL, DEBUFF)
   */
  calculateMultiplier(
    streak: number,
    mood: string,
    subscriptionTier: string,
    decreeType?: string,
    level: number = 999 // Default to high level (no bonus) if not provided
  ): number {
    let mult = 1.0;

    // Streak: +1% per day, cap at 30% (reward consistency)
    mult += Math.min(streak * 0.01, 0.3);

    // Mood
    if (["HAPPY", "FOCUSED"].includes(mood)) {
      mult += 0.1;
    }

    // Subscription
    if (subscriptionTier === "PRO" || subscriptionTier === "LIFETIME") {
      mult += 0.2;
    }

    // Decree
    if (decreeType === "BUFF") {
      mult += 0.3; // Reduced from 0.5 to reduce RNG dependency
    }

    // Apprentice Boost (Newbie Gains)
    // Helps beginners catch up during the first 10 levels
    if (level <= 10) {
      mult += 0.5; // +50% XP
    }

    return parseFloat(mult.toFixed(2));
  },
};

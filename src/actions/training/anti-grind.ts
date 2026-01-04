"use server";

import { prisma } from "@/lib/prisma";

// Constants for anti-grind system
const OPTIMAL_DAILY_WORKOUTS = 1;
const SOFT_CAP_WORKOUTS = 2;
const HARD_CAP_WORKOUTS = 3;

interface DiminishingReturns {
  workoutNumber: number;
  xpMultiplier: number;
  goldMultiplier: number;
  message: string;
  isRecommendedToStop: boolean;
}

/**
 * Calculates diminishing returns for repeated workouts in a day.
 * Prevents grind-like behavior that could lead to injury.
 */
export async function calculateDiminishingReturnsAction(
  userId: string,
): Promise<DiminishingReturns> {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // Count today's workouts
    const todaysWorkouts = await prisma.exerciseLog.count({
      where: {
        userId,
        date: { gte: todayStart.toISOString() },
      },
    });

    const workoutNumber = todaysWorkouts + 1; // Next workout would be this number

    if (workoutNumber <= OPTIMAL_DAILY_WORKOUTS) {
      return {
        workoutNumber,
        xpMultiplier: 1.0,
        goldMultiplier: 1.0,
        message: "Full rewards available. Crush it!",
        isRecommendedToStop: false,
      };
    }

    if (workoutNumber <= SOFT_CAP_WORKOUTS) {
      return {
        workoutNumber,
        xpMultiplier: 0.5,
        goldMultiplier: 0.5,
        message: "Second workout today. Rewards reduced to 50%.",
        isRecommendedToStop: false,
      };
    }

    if (workoutNumber <= HARD_CAP_WORKOUTS) {
      return {
        workoutNumber,
        xpMultiplier: 0.1,
        goldMultiplier: 0.1,
        message: "Multiple workouts detected. Minimal rewards. Consider rest.",
        isRecommendedToStop: true,
      };
    }

    // Beyond hard cap
    return {
      workoutNumber,
      xpMultiplier: 0,
      goldMultiplier: 0,
      message: "Daily workout limit reached. Rest is mandatory for gains.",
      isRecommendedToStop: true,
    };
  } catch (error) {
    console.error("Error calculating diminishing returns:", error);
    return {
      workoutNumber: 1,
      xpMultiplier: 1.0,
      goldMultiplier: 1.0,
      message: "Full rewards available.",
      isRecommendedToStop: false,
    };
  }
}

/**
 * Applies anti-grind penalty to XP.
 */
export async function applyAntiGrindPenalty(
  userId: string,
  baseXp: number,
  baseGold: number,
): Promise<{ finalXp: number; finalGold: number; message: string }> {
  const returns = await calculateDiminishingReturnsAction(userId);

  return {
    finalXp: Math.round(baseXp * returns.xpMultiplier),
    finalGold: Math.round(baseGold * returns.goldMultiplier),
    message: returns.message,
  };
}

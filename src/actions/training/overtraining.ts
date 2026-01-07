"use server";

import { prisma } from "@/lib/prisma";


// Constants for overtraining detection
const DAILY_XP_CAP = 2000;
const WEEKLY_WORKOUT_LIMIT = 14; // Max workouts per week
const FATIGUE_THRESHOLD_HOURS = 4; // Min hours between workouts
const RECOVERY_PENALTY_MULTIPLIER = 0.5; // XP penalty when fatigued

interface OvertrainingStatus {
  isCapped: boolean;
  isFatigued: boolean;
  dailyXpEarned: number;
  dailyXpRemaining: number;
  weeklyWorkouts: number;
  lastWorkoutHoursAgo: number;
  xpMultiplier: number;
  warnings: string[];
}

/**
 * Checks if user is approaching or at overtraining limits.
 * Returns multipliers and warnings for the training session.
 */
export async function checkOvertrainingStatusAction(
  userId: string,
): Promise<OvertrainingStatus> {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user's workout history
    const recentWorkouts = await prisma.exerciseLog.findMany({
      where: {
        userId,
        date: { gte: weekAgo.toISOString() },
      },
      orderBy: { date: "desc" },
    });

    // Calculate daily XP (simplified - count workouts as ~300 XP each)
    const todaysWorkouts = recentWorkouts.filter(
      (w) => new Date(w.date) >= todayStart,
    );
    const dailyXpEarned = todaysWorkouts.length * 300;

    // Weekly workout count
    const weeklyWorkouts = recentWorkouts.length;

    // Time since last workout
    const lastWorkout = recentWorkouts[0];
    const lastWorkoutHoursAgo = lastWorkout
      ? (now.getTime() - new Date(lastWorkout.date).getTime()) /
      (1000 * 60 * 60)
      : 24;

    // Check conditions
    const isCapped = dailyXpEarned >= DAILY_XP_CAP;
    const isFatigued = lastWorkoutHoursAgo < FATIGUE_THRESHOLD_HOURS;
    const isOverworked = weeklyWorkouts >= WEEKLY_WORKOUT_LIMIT;

    // Calculate XP multiplier
    let xpMultiplier = 1.0;
    const warnings: string[] = [];

    if (isCapped) {
      xpMultiplier = 0;
      warnings.push(
        "Daily XP cap reached. Rest and return tomorrow for full rewards.",
      );
    } else if (dailyXpEarned >= DAILY_XP_CAP * 0.75) {
      warnings.push("Approaching daily XP cap. Consider pacing your training.");
    }

    if (isFatigued) {
      xpMultiplier *= RECOVERY_PENALTY_MULTIPLIER;
      warnings.push(
        `Recent workout detected (${Math.round(lastWorkoutHoursAgo)}h ago). XP reduced to allow recovery.`,
      );
    }

    if (isOverworked) {
      xpMultiplier *= 0.75;
      warnings.push(
        "High weekly volume detected. Reduced XP to encourage rest days.",
      );
    }

    return {
      isCapped,
      isFatigued,
      dailyXpEarned,
      dailyXpRemaining: Math.max(0, DAILY_XP_CAP - dailyXpEarned),
      weeklyWorkouts,
      lastWorkoutHoursAgo: Math.round(lastWorkoutHoursAgo),
      xpMultiplier,
      warnings,
    };
  } catch (error) {
    console.error("Error checking overtraining status:", error);
    return {
      isCapped: false,
      isFatigued: false,
      dailyXpEarned: 0,
      dailyXpRemaining: DAILY_XP_CAP,
      weeklyWorkouts: 0,
      lastWorkoutHoursAgo: 24,
      xpMultiplier: 1.0,
      warnings: [],
    };
  }
}

/**
 * Applies XP with overtraining guardrails.
 * Respects daily cap and fatigue penalties.
 */
export async function applyGuardedXpAction(
  userId: string,
  baseXp: number,
  _source: string,
): Promise<{ finalXp: number; cappedAmount: number; warnings: string[] }> {
  const status = await checkOvertrainingStatusAction(userId);

  let finalXp = Math.round(baseXp * status.xpMultiplier);
  let cappedAmount = 0;

  // Apply daily cap
  if (finalXp > status.dailyXpRemaining) {
    cappedAmount = finalXp - status.dailyXpRemaining;
    finalXp = status.dailyXpRemaining;
  }

  // Award XP if any remaining
  if (finalXp > 0) {
    await prisma.titan.updateMany({
      where: { userId },
      data: { xp: { increment: finalXp } },
    });
  }

  return {
    finalXp,
    cappedAmount,
    warnings: status.warnings,
  };
}

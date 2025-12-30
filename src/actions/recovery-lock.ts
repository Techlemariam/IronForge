"use server";

import { prisma } from "@/lib/prisma";
import { checkOvertrainingStatusAction } from "./overtraining";

interface RecoveryLockStatus {
  isLocked: boolean;
  lockReason?: string;
  unlockTime?: Date;
  canOverride: boolean;
  overrideWarning?: string;
  recommendations: string[];
}

const LOCK_THRESHOLDS = {
  // Lock if weekly workouts exceed this
  MAX_WEEKLY_WORKOUTS: 14,
  // Lock if less than this many hours since last workout
  MIN_RECOVERY_HOURS: 4,
  // Lock if fatigue score too high
  MAX_FATIGUE_SCORE: 85,
};

/**
 * Check if user should be locked from training.
 * Protects users from overtraining while allowing override in emergencies.
 */
export async function checkRecoveryLockAction(
  userId: string,
): Promise<RecoveryLockStatus> {
  try {
    const overtraining = await checkOvertrainingStatusAction(userId);
    const recommendations: string[] = [];

    // Check daily cap
    if (overtraining.isCapped) {
      return {
        isLocked: true,
        lockReason: "Daily training limit reached. Your body needs rest.",
        canOverride: false,
        recommendations: [
          "Focus on nutrition and hydration",
          "Get 7-9 hours of quality sleep",
          "Light stretching or mobility work only",
        ],
      };
    }

    // Check fatigue
    if (overtraining.isFatigued) {
      const hoursNeeded =
        LOCK_THRESHOLDS.MIN_RECOVERY_HOURS - overtraining.lastWorkoutHoursAgo;
      return {
        isLocked: true,
        lockReason: `Recent workout detected. Wait ${Math.ceil(hoursNeeded)} more hours.`,
        unlockTime: new Date(Date.now() + hoursNeeded * 60 * 60 * 1000),
        canOverride: true,
        overrideWarning:
          "Training now may reduce recovery and increase injury risk.",
        recommendations: [
          "Do light mobility work or stretching",
          "Focus on meal prep or sleep",
          `Come back in ${Math.ceil(hoursNeeded)} hours for full XP`,
        ],
      };
    }

    // Check weekly volume
    if (overtraining.weeklyWorkouts >= LOCK_THRESHOLDS.MAX_WEEKLY_WORKOUTS) {
      return {
        isLocked: true,
        lockReason: "High weekly volume. Recovery day recommended.",
        canOverride: true,
        overrideWarning:
          "Exceeding recovery limits may lead to overtraining syndrome.",
        recommendations: [
          "Take a full rest day",
          "Try light cardio or active recovery",
          "Focus on sleep and stress management",
        ],
      };
    }

    // Not locked, but add recommendations based on status
    if (overtraining.weeklyWorkouts >= 10) {
      recommendations.push("Consider a lighter session today");
    }
    if (overtraining.xpMultiplier < 1.0) {
      recommendations.push("Recovery-focused training recommended");
    }
    if (overtraining.dailyXpRemaining < 500) {
      recommendations.push("Approaching daily XP cap - pace yourself");
    }

    return {
      isLocked: false,
      canOverride: true,
      recommendations:
        recommendations.length > 0 ? recommendations : ["Train freely!"],
    };
  } catch (error) {
    console.error("Error checking recovery lock:", error);
    return {
      isLocked: false,
      canOverride: true,
      recommendations: ["System check failed - proceed with caution"],
    };
  }
}

/**
 * Override recovery lock (for edge cases).
 * Records the override for accountability.
 */
export async function overrideRecoveryLockAction(
  userId: string,
  reason: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Log the override
    console.log(`Recovery lock override: userId=${userId}, reason=${reason}`);

    // In production, you might want to:
    // 1. Store this in a log table
    // 2. Limit number of overrides per week
    // 3. Send notification to user about risks

    return {
      success: true,
      message: "Lock overridden. Please train responsibly.",
    };
  } catch (error) {
    console.error("Error overriding recovery lock:", error);
    return {
      success: false,
      message: "Failed to override lock.",
    };
  }
}

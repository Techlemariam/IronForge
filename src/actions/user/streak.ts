"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface StreakResult {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  streakMaintained: boolean;
  bonusXp?: number;
}

/**
 * Checks and updates daily workout streak.
 * Should be called after each workout completion.
 */
export async function checkAndIncrementStreakAction(
  userId: string,
  timezone: string = "UTC",
): Promise<StreakResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loginStreak: true,
        longestLoginStreak: true,
        lastLoginDate: true,
      },
    });

    if (!user) {
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        streakMaintained: false,
      };
    }

    const now = new Date();
    const today = new Date(
      now.toLocaleDateString("en-CA", { timeZone: timezone }),
    );
    const lastWorkout = user.lastLoginDate
      ? new Date(user.lastLoginDate)
      : null;

    let newStreak = user.loginStreak || 0;
    let streakMaintained = false;
    let bonusXp = 0;

    if (!lastWorkout) {
      // First workout ever
      newStreak = 1;
      streakMaintained = true;
    } else {
      const lastWorkoutDay = new Date(
        lastWorkout.toLocaleDateString("en-CA", { timeZone: timezone }),
      );
      const diffDays = Math.floor(
        (today.getTime() - lastWorkoutDay.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        // Already worked out today - no change
        streakMaintained = true;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = (user.loginStreak || 0) + 1;
        streakMaintained = true;

        // Milestone bonuses
        if (newStreak === 7) bonusXp = 100;
        else if (newStreak === 30) bonusXp = 500;
        else if (newStreak === 100) bonusXp = 2000;
        else if (newStreak % 7 === 0) bonusXp = 50; // Weekly bonus
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
        streakMaintained = false;
      }
    }

    const newLongestStreak = Math.max(user.longestLoginStreak || 0, newStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        loginStreak: newStreak,
        longestLoginStreak: newLongestStreak,
        lastLoginDate: now,
      },
    });

    // Award bonus XP if milestone reached
    if (bonusXp > 0) {
      await prisma.titan.updateMany({
        where: { userId },
        data: {
          xp: { increment: bonusXp },
        },
      });
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      streakMaintained,
      bonusXp: bonusXp > 0 ? bonusXp : undefined,
    };
  } catch (error) {
    console.error("Error updating streak:", error);
    return {
      success: false,
      currentStreak: 0,
      longestStreak: 0,
      streakMaintained: false,
    };
  }
}

export async function getStreakStatusAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loginStreak: true,
        longestLoginStreak: true,
        lastLoginDate: true,
      },
    });

    if (!user) {
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        isAtRisk: false,
      };
    }

    const now = new Date();
    const lastWorkout = user.lastLoginDate
      ? new Date(user.lastLoginDate)
      : null;

    let isAtRisk = false;
    if (lastWorkout && user.loginStreak && user.loginStreak > 0) {
      const hoursSinceLastWorkout =
        (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
      isAtRisk = hoursSinceLastWorkout > 20; // Less than 4 hours until streak breaks
    }

    return {
      success: true,
      currentStreak: user.loginStreak || 0,
      longestStreak: user.longestLoginStreak || 0,
      lastWorkoutDate: user.lastLoginDate,
      isAtRisk,
    };
  } catch (error) {
    console.error("Error fetching streak:", error);
    return {
      success: false,
      currentStreak: 0,
      longestStreak: 0,
      isAtRisk: false,
    };
  }
}

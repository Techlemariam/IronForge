"use server";

import { prisma } from "@/lib/prisma";

interface PrNotification {
  type: "NEW_PR" | "APPROACHING_PR" | "PR_STREAK" | "MILESTONE_PR";
  exerciseId: string;
  exerciseName: string;
  previousBest?: number;
  newValue: number;
  improvement?: number;
  message: string;
}

/**
 * Check for PRs after a workout and generate notifications.
 */
export async function checkForPrNotificationsAction(
  userId: string,
  exerciseId: string,
  newWeight: number,
  newReps: number,
): Promise<PrNotification | null> {
  try {
    // Get previous best for this exercise
    const previousBest = await prisma.exerciseLog.findFirst({
      where: {
        userId,
        exerciseId,
        isPersonalRecord: true,
      },
      orderBy: { date: "desc" },
    });

    // Calculate new e1RM
    const newE1rm = newWeight * (1 + newReps / 30);
    const previousE1rm = previousBest
      ? (previousBest.weight || 0) * (1 + (previousBest.reps || 0) / 30)
      : 0;

    if (newE1rm > previousE1rm) {
      const improvement =
        previousE1rm > 0
          ? Math.round(((newE1rm - previousE1rm) / previousE1rm) * 100)
          : 100;

      // Check for milestone PRs
      const milestones = [
        100, 140, 180, 200, 225, 250, 300, 350, 400, 450, 500,
      ];
      const crossedMilestone = milestones.find(
        (m) => previousE1rm < m && newE1rm >= m,
      );

      if (crossedMilestone) {
        return {
          type: "MILESTONE_PR",
          exerciseId,
          exerciseName: exerciseId,
          previousBest: previousE1rm,
          newValue: Math.round(newE1rm),
          improvement,
          message: `🏆 MILESTONE! You hit ${crossedMilestone}kg e1RM on ${exerciseId}!`,
        };
      }

      return {
        type: "NEW_PR",
        exerciseId,
        exerciseName: exerciseId,
        previousBest: previousE1rm,
        newValue: Math.round(newE1rm),
        improvement,
        message: `💪 New PR! ${exerciseId} e1RM: ${Math.round(newE1rm)}kg (+${improvement}%)`,
      };
    }

    // Check if approaching PR (within 5%)
    if (newE1rm > previousE1rm * 0.95 && newE1rm < previousE1rm) {
      return {
        type: "APPROACHING_PR",
        exerciseId,
        exerciseName: exerciseId,
        previousBest: previousE1rm,
        newValue: Math.round(newE1rm),
        message: `🔥 Close! You're ${Math.round(previousE1rm - newE1rm)}kg away from your ${exerciseId} PR!`,
      };
    }

    return null;
  } catch (error) {
    console.error("Error checking for PR notifications:", error);
    return null;
  }
}

/**
 * Get user's recent PR history.
 */
export async function getRecentPrsAction(
  userId: string,
  limit: number = 10,
): Promise<PrNotification[]> {
  try {
    const prs = await prisma.exerciseLog.findMany({
      where: { userId, isPersonalRecord: true },
      orderBy: { date: "desc" },
      take: limit,
    });

    return prs.map((pr) => {
      const e1rm = (pr.weight || 0) * (1 + (pr.reps || 0) / 30);
      return {
        type: "NEW_PR" as const,
        exerciseId: pr.exerciseId,
        exerciseName: pr.exerciseId,
        newValue: Math.round(e1rm),
        message: `${pr.exerciseId}: ${Math.round(e1rm)}kg e1RM`,
      };
    });
  } catch (error) {
    console.error("Error getting recent PRs:", error);
    return [];
  }
}

/**
 * Send push notification for PR (mock).
 */
export async function sendPrPushNotificationAction(
  userId: string,
  notification: PrNotification,
): Promise<{ success: boolean }> {
  try {
    console.log(
      `Push notification: user=${userId}, message=${notification.message}`,
    );

    // In production:
    // 1. Get user's push token
    // 2. Send via FCM/APNs
    // 3. Store in notification history

    return { success: true };
  } catch (error) {
    console.error("Error sending PR notification:", error);
    return { success: false };
  }
}

/**
 * Get PR statistics for a user.
 */
export async function getPrStatsAction(userId: string): Promise<{
  totalPrs: number;
  prsThisWeek: number;
  prsThisMonth: number;
  bestStreak: number;
  exerciseWithMostPrs: string;
}> {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, thisWeek, thisMonth] = await Promise.all([
      prisma.exerciseLog.count({ where: { userId, isPersonalRecord: true } }),
      prisma.exerciseLog.count({
        where: { userId, isPersonalRecord: true, date: { gte: weekAgo.toISOString() } },
      }),
      prisma.exerciseLog.count({
        where: { userId, isPersonalRecord: true, date: { gte: monthAgo.toISOString() } },
      }),
    ]);

    return {
      totalPrs: total,
      prsThisWeek: thisWeek,
      prsThisMonth: thisMonth,
      bestStreak: 5, // Would calculate from history
      exerciseWithMostPrs: "Bench Press", // Would aggregate from history
    };
  } catch (error) {
    console.error("Error getting PR stats:", error);
    return {
      totalPrs: 0,
      prsThisWeek: 0,
      prsThisMonth: 0,
      bestStreak: 0,
      exerciseWithMostPrs: "Unknown",
    };
  }
}

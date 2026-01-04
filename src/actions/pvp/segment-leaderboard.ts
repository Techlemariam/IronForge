"use server";

import { prisma } from "@/lib/prisma";

type LeaderboardScope = "GLOBAL" | "COUNTRY" | "CITY";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  heroName: string;
  e1rm: number;
  exerciseId: string;
  exerciseName: string;
  country?: string;
  city?: string;
  date: string;
}

interface LeaderboardResult {
  entries: LeaderboardEntry[];
  scope: LeaderboardScope;
  exercise: string;
  userRank?: number;
  totalEntries: number;
}

/**
 * Get segment leaderboard for a specific exercise e1RM.
 * Strava-style ranking: Global, Country, or City scope.
 */
export async function getSegmentLeaderboardAction(
  exerciseId: string,
  scope: LeaderboardScope = "GLOBAL",
  userId?: string,
  limit: number = 50,
): Promise<LeaderboardResult> {
  try {
    // Get all exercise logs with e1RM for this exercise
    const logs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId,
        weight: { gt: 0 },
      },
      include: {
        user: {
          select: {
            id: true,
            heroName: true,
            country: true,
            city: true,
          },
        },
      },
    });

    const logsWithE1rm = logs.map(log => ({
      ...log,
      e1rm: (log.weight || 0) * (1 + (log.reps || 0) / 30)
    }));

    // Group by user, keeping only best e1RM per user
    const bestByUser = new Map<string, (typeof logsWithE1rm)[0]>();
    logsWithE1rm.forEach((log) => {
      const existing = bestByUser.get(log.userId);
      if (!existing || log.e1rm > existing.e1rm) {
        bestByUser.set(log.userId, log);
      }
    });

    let entries = Array.from(bestByUser.values());

    // Filter by scope if needed
    if (scope === "COUNTRY" && userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { country: true },
      });
      if (currentUser?.country) {
        entries = entries.filter((e) => e.user.country === currentUser.country);
      }
    } else if (scope === "CITY" && userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { city: true },
      });
      if (currentUser?.city) {
        entries = entries.filter((e) => e.user.city === currentUser.city);
      }
    }

    // Sort and rank
    entries.sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0));
    const totalEntries = entries.length;

    // Find user's rank
    let userRank: number | undefined;
    if (userId) {
      const userIndex = entries.findIndex((e) => e.userId === userId);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      }
    }

    // Limit results
    const limitedEntries = entries.slice(0, limit);

    return {
      entries: limitedEntries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        heroName: entry.user.heroName || "Unknown Titan",
        e1rm: entry.e1rm || 0,
        exerciseId: entry.exerciseId,
        exerciseName: exerciseId, // Would need exercise name lookup
        country: entry.user.country || undefined,
        city: entry.user.city || undefined,
        date: entry.date.toISOString(),
      })),
      scope,
      exercise: exerciseId,
      userRank,
      totalEntries,
    };
  } catch (error) {
    console.error("Error fetching segment leaderboard:", error);
    return {
      entries: [],
      scope,
      exercise: exerciseId,
      totalEntries: 0,
    };
  }
}

/**
 * Get user's rankings across all exercises.
 */
export async function getUserRankingsAction(userId: string): Promise<{
  globalRanks: { exerciseId: string; rank: number; e1rm: number }[];
  medalCount: { gold: number; silver: number; bronze: number };
}> {
  try {
    const userLogs = await prisma.exerciseLog.findMany({
      where: { userId, weight: { gt: 0 } },
    });

    const userLogsWithE1rm = userLogs.map(log => ({
      ...log,
      e1rm: (log.weight || 0) * (1 + (log.reps || 0) / 30)
    })).sort((a, b) => b.e1rm - a.e1rm);

    // Get unique exercises
    const exerciseIds = [...new Set(userLogs.map((l) => l.exerciseId))];
    const rankings: { exerciseId: string; rank: number; e1rm: number }[] = [];
    let gold = 0,
      silver = 0,
      bronze = 0;

    for (const exerciseId of exerciseIds) {
      const leaderboard = await getSegmentLeaderboardAction(
        exerciseId,
        "GLOBAL",
        userId,
      );
      if (leaderboard.userRank) {
        const bestLog = userLogsWithE1rm.find((l) => l.exerciseId === exerciseId);
        rankings.push({
          exerciseId,
          rank: leaderboard.userRank,
          e1rm: bestLog?.e1rm || 0,
        });

        if (leaderboard.userRank === 1) gold++;
        else if (leaderboard.userRank === 2) silver++;
        else if (leaderboard.userRank === 3) bronze++;
      }
    }

    return {
      globalRanks: rankings.sort((a, b) => a.rank - b.rank),
      medalCount: { gold, silver, bronze },
    };
  } catch (error) {
    console.error("Error fetching user rankings:", error);
    return { globalRanks: [], medalCount: { gold: 0, silver: 0, bronze: 0 } };
  }
}

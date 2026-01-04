"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LEAGUE_TIERS, LeagueInfo } from "@/lib/game/tier-data";

export interface SeasonInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  daysRemaining: number;
}

/**
 * Get current active season info.
 */
export async function getCurrentSeasonAction(): Promise<SeasonInfo> {
  const now = new Date();
  const seasonStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1,
  );
  const seasonEnd = new Date(
    seasonStart.getFullYear(),
    seasonStart.getMonth() + 3,
    0,
  );

  const seasonNames = ["Winter", "Spring", "Summer", "Fall"];
  const quarter = Math.floor(now.getMonth() / 3);

  return {
    id: `season-${now.getFullYear()}-Q${quarter + 1}`,
    name: `${seasonNames[quarter]} ${now.getFullYear()}`,
    startDate: seasonStart,
    endDate: seasonEnd,
    isActive: true,
    daysRemaining: Math.ceil(
      (seasonEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    ),
  };
}

/**
 * Get user's league info.
 */
export async function getLeagueInfoAction(
  userId: string,
): Promise<LeagueInfo | null> {
  try {
    const profile = await prisma.pvpProfile.findFirst({
      where: { userId },
    });

    if (!profile) return null;

    const rating = profile.duelElo || 1000;
    const tierIndex = LEAGUE_TIERS.findIndex(
      (t) => rating >= t.minRating && rating <= t.maxRating,
    );
    const tier = LEAGUE_TIERS[tierIndex] || LEAGUE_TIERS[0];
    const nextTier = LEAGUE_TIERS[tierIndex + 1];

    // Count users in same league
    const usersInLeague = await prisma.pvpProfile.count({
      where: {
        duelElo: { gte: tier.minRating, lte: tier.maxRating },
      },
    });

    // Get user's rank within league
    const betterInLeague = await prisma.pvpProfile.count({
      where: {
        duelElo: { gt: rating, lte: tier.maxRating },
      },
    });

    return {
      tier,
      rank: betterInLeague + 1,
      totalInLeague: usersInLeague,
      seasonPoints: rating,
      seasonWins: profile.duelsWon || 0,
      seasonLosses: profile.duelsLost || 0,
      nextTier,
      pointsToNextTier: nextTier ? nextTier.minRating - rating : undefined,
    };
  } catch (error) {
    console.error("Error fetching league info:", error);
    return null;
  }
}

/**
 * Get league leaderboard.
 */
export async function getLeagueLeaderboardAction(
  leagueId: string,
  limit: number = 50,
): Promise<{
  entries: Array<{
    rank: number;
    userId: string;
    heroName: string;
    rating: number;
    wins: number;
    losses: number;
    winRate: number;
  }>;
  totalPlayers: number;
}> {
  try {
    const tier = LEAGUE_TIERS.find((t) => t.id === leagueId);
    if (!tier) return { entries: [], totalPlayers: 0 };

    const profiles = await prisma.pvpProfile.findMany({
      where: {
        duelElo: { gte: tier.minRating, lte: tier.maxRating },
      },
      orderBy: { duelElo: "desc" },
      take: limit,
      include: {
        user: { select: { heroName: true } },
      },
    });

    const totalPlayers = await prisma.pvpProfile.count({
      where: {
        duelElo: { gte: tier.minRating, lte: tier.maxRating },
      },
    });

    return {
      entries: profiles.map((p, i) => ({
        rank: i + 1,
        userId: p.userId,
        heroName: p.user.heroName || "Unknown",
        rating: p.duelElo || 1000,
        wins: p.duelsWon || 0,
        losses: p.duelsLost || 0,
        winRate:
          (p.duelsWon || 0) + (p.duelsLost || 0) > 0
            ? Math.round(
              ((p.duelsWon || 0) / ((p.duelsWon || 0) + (p.duelsLost || 0))) *
              100,
            )
            : 0,
      })),
      totalPlayers,
    };
  } catch (error) {
    console.error("Error fetching league leaderboard:", error);
    return { entries: [], totalPlayers: 0 };
  }
}


/**
 * Award season-end rewards (to be called by cron).
 */
export async function awardSeasonRewardsAction(): Promise<{
  success: boolean;
  rewarded: number;
}> {
  try {
    const profiles = await prisma.pvpProfile.findMany({
      where: { duelElo: { gt: 1000 } },
    });

    let rewarded = 0;
    for (const profile of profiles) {
      const tierIndex = LEAGUE_TIERS.findIndex(
        (t) =>
          (profile.duelElo || 1000) >= t.minRating &&
          (profile.duelElo || 1000) <= t.maxRating,
      );

      // Award XP based on tier (higher tier = more XP)
      const xpReward = (tierIndex + 1) * 500;

      await prisma.titan.updateMany({
        where: { userId: profile.userId },
        data: { xp: { increment: xpReward } },
      });

      rewarded++;
    }

    revalidatePath("/iron-arena");
    return { success: true, rewarded };
  } catch (error) {
    console.error("Error awarding season rewards:", error);
    return { success: false, rewarded: 0 };
  }
}

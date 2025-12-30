"use server";

import { prisma } from "@/lib/prisma";

// WoW-inspired PvP ranks
const PVP_RANKS = [
  { rank: 1, title: "Private", minRating: 0, color: "#9d9d9d" },
  { rank: 2, title: "Corporal", minRating: 1000, color: "#ffffff" },
  { rank: 3, title: "Sergeant", minRating: 1100, color: "#1eff00" },
  { rank: 4, title: "Master Sergeant", minRating: 1200, color: "#1eff00" },
  { rank: 5, title: "Sergeant Major", minRating: 1300, color: "#0070dd" },
  { rank: 6, title: "Knight", minRating: 1400, color: "#0070dd" },
  { rank: 7, title: "Knight-Lieutenant", minRating: 1500, color: "#0070dd" },
  { rank: 8, title: "Knight-Captain", minRating: 1600, color: "#a335ee" },
  { rank: 9, title: "Knight-Champion", minRating: 1700, color: "#a335ee" },
  {
    rank: 10,
    title: "Lieutenant Commander",
    minRating: 1800,
    color: "#a335ee",
  },
  { rank: 11, title: "Commander", minRating: 1900, color: "#ff8000" },
  { rank: 12, title: "Marshal", minRating: 2000, color: "#ff8000" },
  { rank: 13, title: "Field Marshal", minRating: 2100, color: "#ff8000" },
  { rank: 14, title: "Grand Marshal", minRating: 2200, color: "#e6cc80" },
  { rank: 15, title: "High Warlord", minRating: 2400, color: "#e6cc80" },
];

interface PvpRankInfo {
  rank: number;
  title: string;
  color: string;
  rating: number;
  nextRank?: { title: string; ratingNeeded: number };
  progress: number; // 0-100
}

/**
 * Get PvP rank info for a user based on their duel Elo.
 */
export async function getPvpRankAction(
  userId: string,
): Promise<PvpRankInfo | null> {
  try {
    const profile = await prisma.pvpProfile.findFirst({
      where: { userId },
      select: { duelElo: true },
    });

    const rating = profile?.duelElo || 1000;
    return calculatePvpRank(rating);
  } catch (error) {
    console.error("Error fetching PvP rank:", error);
    return null;
  }
}

/**
 * Calculate PvP rank from rating.
 */
function calculatePvpRank(rating: number): PvpRankInfo {
  let currentRankData = PVP_RANKS[0];
  let nextRankData: (typeof PVP_RANKS)[0] | undefined;

  for (let i = PVP_RANKS.length - 1; i >= 0; i--) {
    if (rating >= PVP_RANKS[i].minRating) {
      currentRankData = PVP_RANKS[i];
      nextRankData = PVP_RANKS[i + 1];
      break;
    }
  }

  // Calculate progress to next rank
  let progress = 100;
  if (nextRankData) {
    const ratingRange = nextRankData.minRating - currentRankData.minRating;
    const ratingProgress = rating - currentRankData.minRating;
    progress = Math.min(100, Math.round((ratingProgress / ratingRange) * 100));
  }

  return {
    rank: currentRankData.rank,
    title: currentRankData.title,
    color: currentRankData.color,
    rating,
    nextRank: nextRankData
      ? {
          title: nextRankData.title,
          ratingNeeded: nextRankData.minRating - rating,
        }
      : undefined,
    progress,
  };
}

/**
 * Get PvP ladder with rankings.
 */
export async function getPvpLadderAction(limit: number = 100): Promise<{
  entries: Array<{
    rank: number;
    userId: string;
    heroName: string;
    rating: number;
    title: string;
    titleColor: string;
    wins: number;
    losses: number;
    winRate: number;
  }>;
}> {
  try {
    const profiles = await prisma.pvpProfile.findMany({
      orderBy: { duelElo: "desc" },
      take: limit,
      include: {
        user: {
          select: { heroName: true },
        },
      },
    });

    return {
      entries: profiles.map((profile, index) => {
        const rankInfo = calculatePvpRank(profile.duelElo || 1000);
        const wins = profile.duelsWon || 0;
        const losses = profile.duelsLost || 0;
        const total = wins + losses;

        return {
          rank: index + 1,
          userId: profile.userId,
          heroName: profile.user.heroName || "Unknown Titan",
          rating: profile.duelElo || 1000,
          title: rankInfo.title,
          titleColor: rankInfo.color,
          wins,
          losses,
          winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching PvP ladder:", error);
    return { entries: [] };
  }
}

/**
 * Get all PvP rank definitions.
 */
export function getPvpRankDefinitions() {
  return PVP_RANKS;
}

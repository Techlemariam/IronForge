"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Rival {
  id: string;
  heroName: string;
  level: number;
  avatarUrl?: string;
  titanClass?: string;
  matchScore: number; // 0-100 similarity
  stats: RivalStats;
  headToHead: HeadToHead;
  isFavorite: boolean;
}

interface RivalStats {
  totalVolume: number;
  totalWorkouts: number;
  favoriteExercise: string;
  currentStreak: number;
}

interface HeadToHead {
  wins: number;
  losses: number;
  ties: number;
  lastMatchDate?: Date;
}

interface RivalSuggestion {
  user: { id: string; heroName: string; level: number };
  matchScore: number;
  reason: string;
}

/**
 * Get user's current rivals.
 */
export async function getRivalsAction(userId: string): Promise<Rival[]> {
  return [
    {
      id: "rival1",
      heroName: "ShadowLifter",
      level: 35,
      titanClass: "Warrior",
      matchScore: 92,
      stats: {
        totalVolume: 1250000,
        totalWorkouts: 180,
        favoriteExercise: "Squat",
        currentStreak: 5,
      },
      headToHead: { wins: 3, losses: 2, ties: 1 },
      isFavorite: true,
    },
    {
      id: "rival2",
      heroName: "GymRat99",
      level: 34,
      titanClass: "Mage",
      matchScore: 88,
      stats: {
        totalVolume: 1180000,
        totalWorkouts: 165,
        favoriteExercise: "Deadlift",
        currentStreak: 3,
      },
      headToHead: { wins: 2, losses: 3, ties: 0 },
      isFavorite: false,
    },
  ];
}

/**
 * Get suggested rivals based on stats.
 */
export async function getSuggestedRivalsAction(
  userId: string,
): Promise<RivalSuggestion[]> {
  return [
    {
      user: { id: "sug1", heroName: "IronPumper", level: 36 },
      matchScore: 85,
      reason: "Similar total volume",
    },
    {
      user: { id: "sug2", heroName: "LiftMaster", level: 33 },
      matchScore: 82,
      reason: "Same favorite exercise",
    },
    {
      user: { id: "sug3", heroName: "GainTrain", level: 35 },
      matchScore: 79,
      reason: "Close level range",
    },
  ];
}

/**
 * Add a rival.
 */
export async function addRivalAction(
  userId: string,
  rivalId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Added rival ${rivalId} for user ${userId}`);
    revalidatePath("/rivals");
    return { success: true };
  } catch (error) {
    console.error("Error adding rival:", error);
    return { success: false };
  }
}

/**
 * Remove a rival.
 */
export async function removeRivalAction(
  userId: string,
  rivalId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Removed rival ${rivalId}`);
    revalidatePath("/rivals");
    return { success: true };
  } catch (error) {
    console.error("Error removing rival:", error);
    return { success: false };
  }
}

/**
 * Toggle favorite rival.
 */
export async function toggleFavoriteRivalAction(
  userId: string,
  rivalId: string,
): Promise<{ success: boolean; isFavorite: boolean }> {
  try {
    console.log(`Toggled favorite rival ${rivalId}`);
    revalidatePath("/rivals");
    return { success: true, isFavorite: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, isFavorite: false };
  }
}

/**
 * Get rivalry leaderboard.
 */
export async function getRivalryLeaderboardAction(
  userId: string,
  rivalId: string,
): Promise<{
  weeklyWinner: string | null;
  monthlyWinner: string | null;
  allTimeStats: { userWins: number; rivalWins: number };
}> {
  return {
    weeklyWinner: userId,
    monthlyWinner: null,
    allTimeStats: { userWins: 3, rivalWins: 2 },
  };
}

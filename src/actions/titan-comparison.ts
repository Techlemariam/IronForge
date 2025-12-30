"use server";

import { prisma } from "@/lib/prisma";

interface TitanStats {
  userId: string;
  heroName: string;
  level: number;
  titanClass?: string;
  attributes: {
    strength: number;
    vitality: number;
    endurance: number;
    agility: number;
    willpower: number;
  };
  combatStats: {
    totalDamageDealt: number;
    bossesDefeated: number;
    pvpWins: number;
  };
  progressStats: {
    totalXp: number;
    achievementsUnlocked: number;
    skillPointsSpent: number;
  };
  fitnessStats: {
    totalVolume: number;
    totalWorkouts: number;
    totalPRs: number;
    currentStreak: number;
    longestStreak: number;
  };
}

interface ComparisonResult {
  user: TitanStats;
  opponent: TitanStats;
  highlights: ComparisonHighlight[];
  overallScore: { user: number; opponent: number };
}

interface ComparisonHighlight {
  category: string;
  stat: string;
  winner: "USER" | "OPPONENT" | "TIE";
  userValue: number;
  opponentValue: number;
  difference: number;
  differencePercent: number;
}

/**
 * Get Titan stats for comparison.
 */
async function getTitanStats(userId: string): Promise<TitanStats | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { titan: true },
    });

    if (!user) return null;

    return {
      userId: user.id,
      heroName: user.heroName || "Unknown",
      level: user.level || 1,
      attributes: {
        strength: user.titan?.strength || 10,
        vitality: user.titan?.vitality || 10,
        endurance: user.titan?.endurance || 10,
        agility: user.titan?.agility || 10,
        willpower: user.titan?.willpower || 10,
      },
      combatStats: {
        totalDamageDealt: 150000,
        bossesDefeated: 12,
        pvpWins: 8,
      },
      progressStats: {
        totalXp: user.totalExperience || 0,
        achievementsUnlocked: 45,
        skillPointsSpent: 25,
      },
      fitnessStats: {
        totalVolume: 1200000,
        totalWorkouts: 150,
        totalPRs: 35,
        currentStreak: 5,
        longestStreak: 21,
      },
    };
  } catch (error) {
    console.error("Error getting titan stats:", error);
    return null;
  }
}

/**
 * Compare two Titans.
 */
export async function compareTitansAction(
  userId: string,
  opponentId: string,
): Promise<ComparisonResult | null> {
  try {
    const userStats = await getTitanStats(userId);
    const opponentStats = await getTitanStats(opponentId);

    if (!userStats || !opponentStats) return null;

    const highlights: ComparisonHighlight[] = [];
    let userScore = 0;
    let opponentScore = 0;

    // Compare attributes
    for (const [stat, userVal] of Object.entries(userStats.attributes)) {
      const oppVal =
        opponentStats.attributes[stat as keyof typeof opponentStats.attributes];
      const diff = userVal - oppVal;
      const winner = diff > 0 ? "USER" : diff < 0 ? "OPPONENT" : "TIE";

      if (winner === "USER") userScore++;
      else if (winner === "OPPONENT") opponentScore++;

      highlights.push({
        category: "Attributes",
        stat: stat.charAt(0).toUpperCase() + stat.slice(1),
        winner,
        userValue: userVal,
        opponentValue: oppVal,
        difference: Math.abs(diff),
        differencePercent:
          oppVal > 0 ? Math.round((Math.abs(diff) / oppVal) * 100) : 0,
      });
    }

    // Compare fitness stats
    const fitnessComparisons = [
      {
        stat: "Total Volume",
        uv: userStats.fitnessStats.totalVolume,
        ov: opponentStats.fitnessStats.totalVolume,
      },
      {
        stat: "Total Workouts",
        uv: userStats.fitnessStats.totalWorkouts,
        ov: opponentStats.fitnessStats.totalWorkouts,
      },
      {
        stat: "Total PRs",
        uv: userStats.fitnessStats.totalPRs,
        ov: opponentStats.fitnessStats.totalPRs,
      },
    ];

    for (const comp of fitnessComparisons) {
      const diff = comp.uv - comp.ov;
      const winner = diff > 0 ? "USER" : diff < 0 ? "OPPONENT" : "TIE";

      if (winner === "USER") userScore++;
      else if (winner === "OPPONENT") opponentScore++;

      highlights.push({
        category: "Fitness",
        stat: comp.stat,
        winner,
        userValue: comp.uv,
        opponentValue: comp.ov,
        difference: Math.abs(diff),
        differencePercent:
          comp.ov > 0 ? Math.round((Math.abs(diff) / comp.ov) * 100) : 0,
      });
    }

    return {
      user: userStats,
      opponent: opponentStats,
      highlights,
      overallScore: { user: userScore, opponent: opponentScore },
    };
  } catch (error) {
    console.error("Error comparing titans:", error);
    return null;
  }
}

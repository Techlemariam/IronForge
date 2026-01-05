"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getDuelLeaderboardAction(limit: number = 50) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const leaderboard = await prisma.pvpProfile.findMany({
      take: limit,
      orderBy: { duelElo: "desc" },
      include: {
        user: {
          select: {
            id: true,
            heroName: true,
            level: true,
            faction: true,
          },
        },
      },
    });

    // Find current user's rank
    const currentUserProfile = await prisma.pvpProfile.findUnique({
      where: { userId: session.user.id },
    });

    let userRank = null;
    if (currentUserProfile) {
      const higherRanked = await prisma.pvpProfile.count({
        where: { duelElo: { gt: currentUserProfile.duelElo } },
      });
      userRank = higherRanked + 1;
    }

    return {
      success: true,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.user.id,
        heroName: entry.user.heroName || "Unknown Titan",
        faction: entry.user.faction,
        level: entry.user.level,
        duelElo: entry.duelElo,
        wins: entry.duelsWon,
        losses: entry.duelsLost,
        winRate:
          entry.duelsWon + entry.duelsLost > 0
            ? Math.round(
              (entry.duelsWon / (entry.duelsWon + entry.duelsLost)) * 100,
            )
            : 0,
      })),
      userRank,
    };
  } catch (error) {
    console.error("Error fetching duel leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}

export async function sendDuelTauntAction(duelId: string, message: string) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Validate message length
    if (message.length > 200) {
      return { success: false, error: "Taunt too long (max 200 characters)" };
    }

    // Check if duel exists and user is a participant
    const duel = await prisma.duelChallenge.findUnique({
      where: { id: duelId },
    });

    if (!duel) {
      return { success: false, error: "Duel not found" };
    }

    if (
      duel.challengerId !== session.user.id &&
      duel.defenderId !== session.user.id
    ) {
      return { success: false, error: "Not a participant in this duel" };
    }

    // For MVP, we'll just log this. In production, use ChatMessage model or DuelTaunt model
    console.log(
      `[TAUNT] User ${session.user.id} in duel ${duelId}: ${message}`,
    );

    return { success: true, message: "Taunt sent successfully!" };
  } catch (error) {
    console.error("Error sending taunt:", error);
    return { success: false, error: "Failed to send taunt" };
  }
}

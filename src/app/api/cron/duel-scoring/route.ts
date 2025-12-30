import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Scoring formula based on titan_duels.md analysis
function calculateDuelScore(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  // This would aggregate:
  // - workoutCount * 50
  // - totalVolume / 100
  // - totalTSS * 2
  // - prCount * 200
  // - streakMaintained ? 100 : 0
  // - perfectWeek ? 500 : 0

  // For MVP, return placeholder - real implementation needs ExerciseLog and CardioLog aggregation
  return Promise.resolve(0);
}

function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  actualScore: number,
  duelsPlayed: number,
): number {
  // K-factor based on experience
  const K = duelsPlayed < 10 ? 40 : duelsPlayed < 30 ? 20 : 10;

  // Expected score
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

  // New Elo
  return Math.round(K * (actualScore - expectedScore));
}

import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  return await Sentry.withMonitor("duel-scoring", async () => {
    try {
      // Verify cron secret
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const now = new Date();

      // 1. Find all active duels that have ended
      const expiredDuels = await prisma.duelChallenge.findMany({
        where: {
          status: "ACTIVE",
          endDate: { lte: now },
        },
        include: {
          challenger: { include: { pvpProfile: true } },
          defender: { include: { pvpProfile: true } },
        },
      });

      for (const duel of expiredDuels) {
        // Calculate final scores (placeholder - needs real aggregation)
        const challengerScore = await calculateDuelScore(
          duel.challengerId,
          duel.startDate!,
          duel.endDate!,
        );
        const defenderScore = await calculateDuelScore(
          duel.defenderId,
          duel.startDate!,
          duel.endDate!,
        );

        // Determine winner
        let winnerId: string | null = null;
        let actualScoreChallenger = 0.5; // tie
        let actualScoreDefender = 0.5;

        if (challengerScore > defenderScore) {
          winnerId = duel.challengerId;
          actualScoreChallenger = 1;
          actualScoreDefender = 0;
        } else if (defenderScore > challengerScore) {
          winnerId = duel.defenderId;
          actualScoreChallenger = 0;
          actualScoreDefender = 1;
        }

        // Calculate Elo changes
        const challengerElo = duel.challenger.pvpProfile?.duelElo || 1200;
        const defenderElo = duel.defender.pvpProfile?.duelElo || 1200;

        const challengerDuels =
          (duel.challenger.pvpProfile?.duelsWon || 0) +
          (duel.challenger.pvpProfile?.duelsLost || 0);
        const defenderDuels =
          (duel.defender.pvpProfile?.duelsWon || 0) +
          (duel.defender.pvpProfile?.duelsLost || 0);

        const challengerEloChange = calculateEloChange(
          challengerElo,
          defenderElo,
          actualScoreChallenger,
          challengerDuels,
        );
        const defenderEloChange = calculateEloChange(
          defenderElo,
          challengerElo,
          actualScoreDefender,
          defenderDuels,
        );

        // Update duel
        await prisma.duelChallenge.update({
          where: { id: duel.id },
          data: {
            status: "COMPLETED",
            challengerScore,
            defenderScore,
            winnerId,
          },
        });

        // Update PvpProfiles
        if (duel.challenger.pvpProfile) {
          await prisma.pvpProfile.update({
            where: { userId: duel.challengerId },
            data: {
              duelElo: { increment: challengerEloChange },
              duelsWon:
                winnerId === duel.challengerId ? { increment: 1 } : undefined,
              duelsLost:
                winnerId === duel.defenderId ? { increment: 1 } : undefined,
            },
          });
        }

        if (duel.defender.pvpProfile) {
          await prisma.pvpProfile.update({
            where: { userId: duel.defenderId },
            data: {
              duelElo: { increment: defenderEloChange },
              duelsWon:
                winnerId === duel.defenderId ? { increment: 1 } : undefined,
              duelsLost:
                winnerId === duel.challengerId ? { increment: 1 } : undefined,
            },
          });
        }
      }

      // 2. Reset weekly duel limits (runs on Sunday)
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0) {
        // Sunday
        await prisma.pvpProfile.updateMany({
          data: {
            weeklyDuels: 0,
            lastDuelReset: now,
          },
        });
      }

      return NextResponse.json({
        success: true,
        duelsProcessed: expiredDuels.length,
        weeklyReset: dayOfWeek === 0,
      });
    } catch (error) {
      console.error("Duel scoring cron error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}

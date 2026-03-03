"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

// Schema for duel creation
const DuelTypeSchema = z.enum([
  "TITAN_VS_TITAN",
  "DISTANCE_RACE",
  "SPEED_DEMON",
  "ELEVATION_GRIND"
]);

const ActivityTypeSchema = z.enum(["CYCLING", "RUNNING"]);

const _DuelChallengeSchema = z.object({
  duelType: DuelTypeSchema.default("DISTANCE_RACE"),
  activityType: ActivityTypeSchema.optional(),
  targetDistance: z.number().min(0.1).optional(),
  durationMinutes: z.number().min(1).optional(),
  wkgTier: z.number().min(1).max(7).optional(),
  wager: z.number().min(0).optional(),
});

type DuelChallengeInput = z.infer<typeof _DuelChallengeSchema>;

export const createDuelChallengeAction = authActionClient
  .schema(z.object({
    targetUserId: z.string(),
    options: _DuelChallengeSchema.partial().optional()
  }))
  .action(async ({ parsedInput: { targetUserId, options }, ctx: { userId: challengerId } }) => {
    try {
      if (challengerId === targetUserId) {
        return { success: false, error: "Cannot duel yourself" };
      }

      // Check if there is already an active or pending duel between these two
      const existingDuel = await prisma.duelChallenge.findFirst({
        where: {
          OR: [
            { challengerId: challengerId, defenderId: targetUserId },
            { challengerId: targetUserId, defenderId: challengerId },
          ],
          status: { in: ["PENDING", "ACTIVE"] },
        },
      });

      if (existingDuel) {
        return {
          success: false,
          error: "A duel is already active or pending between you.",
        };
      }

      // Create the challenge
      const challenge = await prisma.duelChallenge.create({
        data: {
          challengerId,
          defenderId: targetUserId,
          status: "PENDING",
          duelType: options?.duelType || "TITAN_VS_TITAN",
          activityType: options?.activityType,
          durationMinutes: options?.durationMinutes,
          wkgTier: options?.wkgTier,
          targetDistance: options?.targetDistance,
        },
      });

      revalidatePath("/iron-arena");
      return { success: true, duelId: challenge.id };
    } catch (error) {
      console.error("Error creating duel challenge:", error);
      return { success: false, error: "Failed to create challenge" };
    }
  });

export const acceptDuelChallengeAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: challengeId, ctx: { userId } }) => {
    try {
      const duel = await prisma.duelChallenge.findUnique({
        where: { id: challengeId },
      });

      if (!duel) return { success: false, error: "Duel not found" };
      if (duel.defenderId !== userId)
        return { success: false, error: "Not your challenge to accept" };
      if (duel.status !== "PENDING")
        return { success: false, error: "Duel is not pending" };

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7);

      await prisma.duelChallenge.update({
        where: { id: challengeId },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
        },
      });

      revalidatePath("/iron-arena");
      return { success: true };
    } catch (error) {
      console.error("Error accepting duel:", error);
      return { success: false, error: "Failed to accept duel" };
    }
  });

export const declineDuelChallengeAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: challengeId, ctx: { userId } }) => {
    try {
      const duel = await prisma.duelChallenge.findUnique({
        where: { id: challengeId },
      });

      if (!duel) return { success: false, error: "Duel not found" };
      if (duel.defenderId !== userId)
        return { success: false, error: "Not your challenge to decline" };

      await prisma.duelChallenge.update({
        where: { id: challengeId },
        data: { status: "DECLINED" },
      });

      revalidatePath("/iron-arena");
      return { success: true };
    } catch (error) {
      console.error("Error declining duel:", error);
      return { success: false, error: "Failed to decline duel" };
    }
  });

export const getDuelStatusAction = authActionClient.action(
  async ({ ctx: { userId } }) => {
    try {
      const activeDuel = await prisma.duelChallenge.findFirst({
        where: {
          OR: [{ challengerId: userId }, { defenderId: userId }],
          status: "ACTIVE",
        },
        include: {
          challenger: {
            select: { id: true, heroName: true, level: true, faction: true },
          },
          defender: {
            select: { id: true, heroName: true, level: true, faction: true },
          },
        },
      });

      if (activeDuel) return { success: true, duel: activeDuel };

      const pendingChallenges = await prisma.duelChallenge.findMany({
        where: {
          defenderId: userId,
          status: "PENDING",
        },
        include: {
          challenger: { select: { id: true, heroName: true, level: true, faction: true } },
        },
      });

      return { success: true, duel: null, pending: pendingChallenges };
    } catch (error) {
      console.error("Error fetching duel status:", error);
      return { success: false, error: "Failed to fetch status" };
    }
  }
);

// Internal helper (No Auth Context needed)
// elevationMeters is optional for elevation grind mode
export async function updateCardioDuelProgressInternalWithUser(
  duelId: string,
  userId: string,
  distanceKm: number,
  durationMinutes: number = 0,
  elevationMeters: number = 0
) {
  const duel = await prisma.duelChallenge.findUnique({
    where: { id: duelId },
  });
  if (!duel || duel.status !== "ACTIVE")
    return { success: false, error: "Duel not active" };

  const isChallenger = duel.challengerId === userId;
  const isDefender = duel.defenderId === userId;

  if (!isChallenger && !isDefender)
    return { success: false, error: "Not participant" };

  // Accumulate distance, duration, and elevation
  const newDistance = (isChallenger ? duel.challengerDistance || 0 : duel.defenderDistance || 0) + distanceKm;
  const newDuration = (isChallenger ? duel.challengerDuration || 0 : duel.defenderDuration || 0) + durationMinutes;
  const newElevation = (isChallenger ? duel.challengerElevation || 0 : duel.defenderElevation || 0) + elevationMeters;

  // Update progress with all metrics
  await prisma.duelChallenge.update({
    where: { id: duelId },
    data: isChallenger
      ? { challengerDistance: newDistance, challengerDuration: newDuration, challengerElevation: newElevation }
      : { defenderDistance: newDistance, defenderDuration: newDuration, defenderElevation: newElevation },
  });

  // Check Win Conditions
  let winnerId: string | null = null;
  let isFinished = false;

  if (duel.duelType === "DISTANCE_RACE") {
    // Distance Race: First to reach target distance wins immediately
    if (duel.targetDistance && newDistance >= duel.targetDistance) {
      winnerId = userId;
      isFinished = true;
    }
  } else if (duel.duelType === "SPEED_DEMON") {
    // Speed Demon: Both must complete target distance, fastest time wins
    if (duel.targetDistance && newDistance >= duel.targetDistance) {
      // Check if opponent has already finished
      const opponentDistance = isChallenger ? duel.defenderDistance || 0 : duel.challengerDistance || 0;
      const opponentDuration = isChallenger ? duel.defenderDuration || 0 : duel.challengerDuration || 0;

      if (opponentDistance >= duel.targetDistance) {
        // Both have finished - compare times
        if (newDuration < opponentDuration) {
          winnerId = userId;
        } else {
          winnerId = isChallenger ? duel.defenderId : duel.challengerId;
        }
        isFinished = true;
      } else {
        // First to finish - store completion, wait for opponent
        // Winner determined when opponent finishes or time expires
      }
    }
  } else if (duel.duelType === "ELEVATION_GRIND") {
    // Elevation Grind: First to gain target elevation wins
    // Target is in meters (reusing targetDistance field as the target value)
    const targetElevation = duel.targetDistance || 1000;
    if (newElevation >= targetElevation) {
      winnerId = userId;
      isFinished = true;
    }
  }

  if (isFinished && winnerId) {
    // Determine Loser
    const loserId = isChallenger ? duel.defenderId : duel.challengerId;
    const winnerScore = isChallenger ? newDistance : (isChallenger ? duel.defenderDistance : duel.challengerDistance) || 0;
    const loserScore = isChallenger ? (duel.defenderDistance || 0) : newDistance;

    // Calculate dynamic rewards using DuelRewardsService
    const { DuelRewardsService } = await import("@/services/pvp/DuelRewardsService");

    // Winner Rewards
    const winnerRewards = await DuelRewardsService.calculateRewards(
      winnerId,
      true,
      Math.floor(winnerScore * 10), // Scale distance to score points roughly
      Math.floor(loserScore * 10)
    );

    // Loser Rewards
    const loserRewards = await DuelRewardsService.calculateRewards(
      loserId,
      false,
      Math.floor(loserScore * 10),
      Math.floor(winnerScore * 10)
    );

    await prisma.duelChallenge.update({
      where: { id: duelId },
      data: {
        status: "COMPLETED",
        winnerId: winnerId,
        endDate: new Date(),
        // Store reward summary in metadata if we had a column, for now we just apply
      }
    });

    // Award Loot to Winner
    await prisma.user.update({
      where: { id: winnerId },
      data: {
        totalExperience: { increment: winnerRewards.xp },
        gold: { increment: winnerRewards.gold },
        kineticEnergy: { increment: winnerRewards.kineticEnergy }
      }
    });

    // Award Loot to Loser
    await prisma.user.update({
      where: { id: loserId },
      data: {
        totalExperience: { increment: loserRewards.xp },
        gold: { increment: loserRewards.gold },
        // Loser doesn't typically get KE unless lucky, but service handles base 5
        kineticEnergy: { increment: loserRewards.kineticEnergy }
      }
    });
  }

  return { success: true, isWin: !!winnerId };
}

const cardioProgressSchema = z.object({
  duelId: z.string(),
  distanceKm: z.number().min(0).max(10000), // Max 10,000km arbitrary cap to prevent huge number overflows
  durationMinutes: z.number().min(0).max(10000)
});

export const updateCardioDuelProgressAction = authActionClient
  .schema(cardioProgressSchema)
  .action(async ({ parsedInput: { duelId, distanceKm, durationMinutes }, ctx: { userId } }) => {
    try {
      const result = await updateCardioDuelProgressInternalWithUser(duelId, userId, distanceKm, durationMinutes);
      revalidatePath("/iron-arena");
      return result;
    } catch (error) {
      console.error("Error updating cardio progress:", error);
      return { success: false, error: "Failed update" };
    }
  });

const SendTauntSchema = z.object({
  duelId: z.string(),
  message: z.string().optional().default("Prepare to be crushed!")
});

export const sendTauntAction = authActionClient
  .schema(SendTauntSchema)
  .action(async ({ parsedInput: { duelId, message }, ctx: { userId } }) => {
    try {
      console.log(`Taunt sent in duel ${duelId} from ${userId}: ${message}`);

      // Potential future expansion: Insert into a DuelEvents table

      return { success: true };
    } catch (error) {
      console.error("Error sending taunt:", error);
      return { success: false, error: "Failed to send taunt" };
    }
  });

export const getPotentialOpponentsAction = authActionClient.action(
  async ({ ctx: { userId } }) => {
    try {
      // Fetch own Power Rating
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { titan: true },
      });
      const myRating = currentUser?.titan?.powerRating || 0;

      // Find active duels to exclude them
      const activeDuels = await prisma.duelChallenge.findMany({
        where: {
          OR: [{ challengerId: userId }, { defenderId: userId }],
          status: { in: ["PENDING", "ACTIVE"] },
        },
        select: { challengerId: true, defenderId: true }
      });

      const excludedUserIds = new Set<string>([userId]);
      activeDuels.forEach(d => {
        excludedUserIds.add(d.challengerId);
        excludedUserIds.add(d.defenderId);
      });

      const fetchOpponents = async (bracketSize: number | null) => {
        return prisma.user.findMany({
          where: {
            id: { notIn: Array.from(excludedUserIds) },
            ...(bracketSize !== null ? {
              titan: {
                powerRating: {
                  gte: Math.max(0, myRating - bracketSize),
                  lte: myRating + bracketSize
                }
              }
            } : {})
          },
          take: 20,
          orderBy: {
            titan: { powerRating: 'desc' }
          },
          select: {
            id: true,
            heroName: true,
            level: true,
            faction: true,
            archetype: true,
            titan: {
              select: { powerRating: true }
            }
          }
        });
      };

      // Progressively expand matchmaking bracket
      let opponents = await fetchOpponents(100);

      if (opponents.length < 5) {
        opponents = await fetchOpponents(250);
      }

      if (opponents.length < 5) {
        opponents = await fetchOpponents(500);
      }

      if (opponents.length < 5) {
        opponents = await fetchOpponents(null); // Completely open
      }

      return { success: true, opponents };
    } catch (error) {
      console.error("Error fetching opponents:", error);
      return { success: false, error: "Failed to fetch opponents" };
    }
  }
);

export const getDuelArenaStateAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: duelId, ctx: { userId } }) => {
    try {
      const duel = await prisma.duelChallenge.findUnique({
        where: { id: duelId },
        include: {
          challenger: {
            select: { id: true, heroName: true, level: true, faction: true },
          },
          defender: {
            select: { id: true, heroName: true, level: true, faction: true },
          },
        },
      });

      if (!duel) return { success: false, error: "Duel not found" };

      // Make sure the user is part of this duel? Or maybe arenas are public.
      // If public, we're okay. If private, check:
      // if (duel.challengerId !== userId && duel.defenderId !== userId) return { success: false, error: "Unauthorized" };

      return { success: true, duel };
    } catch (error) {
      console.error("Error fetching arena state:", error);
      return { success: false, error: "Failed to fetch arena state" };
    }
  });

export async function processUserCardioActivity(
  userId: string,
  activityType: string,
  distanceKm: number,
  durationMinutes: number,
  elevationMeters: number = 0
) {
  try {
    console.log(`Processing cardio for user ${userId}: ${activityType} ${distanceKm}km ${elevationMeters}m elevation`);

    const activeDuels = await prisma.duelChallenge.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { challengerId: userId },
          { defenderId: userId }
        ],
        duelType: { not: "TITAN_VS_TITAN" }
      }
    });

    for (const duel of activeDuels) {
      let match = false;
      const type = activityType.toLowerCase();
      // Loose matching for MVP
      if (duel.activityType === "CYCLING" && (type.includes("ride") || type.includes("cycle"))) match = true;
      if (duel.activityType === "RUNNING" && (type.includes("run") || type.includes("walk"))) match = true;

      if (match) {
        await updateCardioDuelProgressInternalWithUser(duel.id, userId, distanceKm, durationMinutes, elevationMeters);
      }
    }

  } catch (e) {
    console.error("Failed to process cardio for duels", e);
  }
}

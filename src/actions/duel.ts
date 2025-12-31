"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const DuelChallengeSchema = z.object({
  targetUserId: z.string(),
  duelType: z.string().optional().default("TITAN_VS_TITAN"),
  activityType: z.string().optional(),
  durationMinutes: z.number().optional(),
  wkgTier: z.number().optional(),
  targetDistance: z.number().optional(),
});

type DuelChallengeInput = z.infer<typeof DuelChallengeSchema>;

export async function createDuelChallengeAction(
  targetUserId: string,
  options?: Partial<DuelChallengeInput>,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const challengerId = user.id;

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
}

export async function acceptDuelChallengeAction(challengeId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

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
}

export async function declineDuelChallengeAction(challengeId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

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
}

export async function getDuelStatusAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

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
        challenger: { select: { id: true, heroName: true, level: true } },
      },
    });

    return { success: true, duel: null, pending: pendingChallenges };
  } catch (error) {
    console.error("Error fetching duel status:", error);
    return { success: false, error: "Failed to fetch status" };
  }
}

// Internal helper (No Auth Context needed)
export async function updateCardioDuelProgressInternalWithUser(duelId: string, userId: string, distanceKm: number, durationMinutes: number = 0) {
  const duel = await prisma.duelChallenge.findUnique({
    where: { id: duelId },
  });
  if (!duel || duel.status !== "ACTIVE")
    return { success: false, error: "Duel not active" };

  const isChallenger = duel.challengerId === userId;
  const isDefender = duel.defenderId === userId;

  if (!isChallenger && !isDefender)
    return { success: false, error: "Not participant" };

  const newDistance = (isChallenger ? duel.challengerDistance || 0 : duel.defenderDistance || 0) + distanceKm;

  await prisma.duelChallenge.update({
    where: { id: duelId },
    data: isChallenger
      ? { challengerDistance: newDistance }
      : { defenderDistance: newDistance },
  });

  // Check Win Conditions
  let winnerId: string | null = null;
  let isFinished = false;

  if (duel.duelType === "DISTANCE_RACE" || duel.duelType === "SPEED_DEMON") {
    if (duel.targetDistance && newDistance >= duel.targetDistance) {
      winnerId = userId;
      isFinished = true;
    }
  }

  if (isFinished && winnerId) {
    await prisma.duelChallenge.update({
      where: { id: duelId },
      data: {
        status: "COMPLETED",
        winnerId: winnerId,
        endDate: new Date()
      }
    });

    // Award Loot
    await prisma.user.update({
      where: { id: winnerId },
      data: {
        totalExperience: { increment: 100 },
        gold: { increment: 50 },
        kineticEnergy: { increment: 25 }
      }
    });

    const loserId = isChallenger ? duel.defenderId : duel.challengerId;
    await prisma.user.update({
      where: { id: loserId },
      data: {
        totalExperience: { increment: 25 },
        gold: { increment: 10 }
      }
    });
  }

  return { success: true, isWin: !!winnerId };
}

export async function updateCardioDuelProgressAction(
  duelId: string,
  distanceKm: number,
  durationMinutes: number = 0
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result = await updateCardioDuelProgressInternalWithUser(duelId, user.id, distanceKm, durationMinutes);
    revalidatePath("/iron-arena");
    return result;
  } catch (error) {
    console.error("Error updating cardio progress:", error);
    return { success: false, error: "Failed update" };
  }
}

export async function sendTauntAction(duelId: string, message: string = "Prepare to be crushed!") {
  // In a real app, this would create a notification or chat message
  // For now, we'll just log it and maybe simulate a delay
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    console.log(`Taunt sent in duel ${duelId} from ${user.id}: ${message}`);

    // Potential future expansion: Insert into a DuelEvents table

    return { success: true };
  } catch (error) {
    console.error("Error sending taunt:", error);
    return { success: false, error: "Failed to send taunt" };
  }
}

export async function getPotentialOpponentsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch users excluding self
    // In a real app, we'd filter by friends or matchmaking rating
    const opponents = await prisma.user.findMany({
      where: {
        id: { not: user.id }
      },
      take: 20,
      select: {
        id: true,
        heroName: true,
        level: true,
        faction: true
      }
    });

    return { success: true, opponents };
  } catch (error) {
    console.error("Error fetching opponents:", error);
    return { success: false, error: "Failed to fetch opponents" };
  }
}

export async function getDuelArenaStateAction(duelId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

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

    return { success: true, duel };
  } catch (error) {
    console.error("Error fetching arena state:", error);
    return { success: false, error: "Failed to fetch arena state" };
  }
}

export async function processUserCardioActivity(userId: string, activityType: string, distanceKm: number, durationMinutes: number) {
  try {
    console.log(`Processing cardio for user ${userId}: ${activityType} ${distanceKm}km`);

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
        await updateCardioDuelProgressInternalWithUser(duel.id, userId, distanceKm, durationMinutes);
      }
    }

  } catch (e) {
    console.error("Failed to process cardio for duels", e);
  }
}

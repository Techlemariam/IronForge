"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================
// BATTLE PASS ACTIONS
// ============================================

const ClaimRewardSchema = z.object({
  seasonId: z.string(),
  tierLevel: z.number().int().min(1),
  isPremium: z.boolean(),
});

interface BattlePassProgress {
  seasonId: string;
  seasonName: string;
  level: number;
  xp: number;
  hasPremium: boolean;
  tiers: {
    level: number;
    requiredXp: number;
    freeReward: { id: string | null; data: any };
    premiumReward: { id: string | null; data: any };
    isClaimedFree: boolean;
    isClaimedPremium: boolean;
    isUnlocked: boolean;
  }[];
}

/**
 * Get the currently active Battle Pass season.
 */
export async function getActiveSeasonAction() {
  try {
    const season = await prisma.battlePassSeason.findFirst({
      where: { isActive: true },
      include: { tiers: { orderBy: { tierLevel: "asc" } } },
    });
    return season;
  } catch (error) {
    console.error("Error fetching active season:", error);
    return null;
  }
}

/**
 * Get a user's progress for the active season.
 */
export async function getUserBattlePassProgressAction(
  userId: string,
): Promise<BattlePassProgress | null> {
  try {
    const season = await getActiveSeasonAction();
    if (!season) return null;

    // Get or create user progress
    let userPass = await prisma.userBattlePass.findUnique({
      where: {
        userId_seasonId: {
          userId,
          seasonId: season.id,
        },
      },
      include: { claims: true },
    });

    if (!userPass) {
      userPass = await prisma.userBattlePass.create({
        data: {
          userId,
          seasonId: season.id,
        },
        include: { claims: true },
      });
    }

    // Map tiers and claims
    const tiers = season.tiers.map((tier) => {
      const isUnlocked = userPass!.seasonXp >= tier.requiredXp;
      const freeClaim = userPass!.claims.find(
        (c) => c.tierLevel === tier.tierLevel && !c.isPremium,
      );
      const premiumClaim = userPass!.claims.find(
        (c) => c.tierLevel === tier.tierLevel && c.isPremium,
      );

      return {
        level: tier.tierLevel,
        requiredXp: tier.requiredXp,
        freeReward: { id: tier.freeRewardId, data: tier.freeRewardData },
        premiumReward: {
          id: tier.premiumRewardId,
          data: tier.premiumRewardData,
        },
        isClaimedFree: !!freeClaim,
        isClaimedPremium: !!premiumClaim,
        isUnlocked,
      };
    });

    return {
      seasonId: season.id,
      seasonName: season.name,
      level: userPass.currentTier,
      xp: userPass.seasonXp,
      hasPremium: userPass.hasPremium,
      tiers,
    };
  } catch (error) {
    console.error("Error fetching battle pass progress:", error);
    return null;
  }
}

/**
 * Add XP to the user's Battle Pass.
 * This should be called when completing workouts or challenges.
 */
export async function addBattlePassXpAction(userId: string, amount: number) {
  try {
    const season = await getActiveSeasonAction();
    if (!season) return { success: false, message: "No active season" };

    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Get current progress
      let userPass = await tx.userBattlePass.findUnique({
        where: { userId_seasonId: { userId, seasonId: season.id } },
      });

      if (!userPass) {
        userPass = await tx.userBattlePass.create({
          data: { userId, seasonId: season.id },
        });
      }

      const newXp = userPass.seasonXp + amount;

      // Calculate new tier based on tiers in the season
      // Assuming we fetch all tiers. For optimization, might cache this or fetch relevant ones.
      const tiers = await tx.battlePassTier.findMany({
        where: { seasonId: season.id },
        orderBy: { tierLevel: "asc" },
      });

      // Find highest unlocked tier
      // Assuming requiredXp is cumulative TOTAL required
      let newTier = 0;
      for (const tier of tiers) {
        if (newXp >= tier.requiredXp) {
          newTier = tier.tierLevel;
        } else {
          break;
        }
      }

      await tx.userBattlePass.update({
        where: { id: userPass.id },
        data: {
          seasonXp: newXp,
          currentTier: newTier,
        },
      });
    });

    revalidatePath("/battle-pass");
    return { success: true, message: `Added ${amount} Season XP` };
  } catch (error) {
    console.error("Error adding Battle Pass XP:", error);
    return { success: false, message: "Failed to add XP" };
  }
}

/**
 * Claim a reward for a specific tier.
 */
export async function claimBattlePassRewardAction(
  userId: string,
  tierLevel: number,
  isPremium: boolean,
) {
  try {
    const season = await getActiveSeasonAction();
    if (!season) return { success: false, message: "No active season" };

    const userPass = await prisma.userBattlePass.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { claims: true },
    });

    if (!userPass)
      return { success: false, message: "Battle Pass not initialized" };

    // Check if unlocked
    // We need to fetch the tier requirement
    const tier = await prisma.battlePassTier.findUnique({
      where: {
        seasonId_tierLevel: {
          seasonId: season.id,
          tierLevel: tierLevel,
        },
      },
    });

    if (!tier) return { success: false, message: "Tier not found" };

    if (userPass.seasonXp < tier.requiredXp) {
      return { success: false, message: "Tier not yet unlocked" };
    }

    // Check premium
    if (isPremium && !userPass.hasPremium) {
      return { success: false, message: "Premium Pass required" };
    }

    // Check availability of reward data (don't claim empty tiers if that's a thing)
    if (isPremium && !tier.premiumRewardId && !tier.premiumRewardData) {
      return { success: false, message: "No reward to claim" };
    }
    if (!isPremium && !tier.freeRewardId && !tier.freeRewardData) {
      return { success: false, message: "No reward to claim" };
    }

    // Check if already claimed
    const existingClaim = userPass.claims.find(
      (c) => c.tierLevel === tierLevel && c.isPremium === isPremium,
    );

    if (existingClaim) {
      return { success: false, message: "Already claimed" };
    }

    // Process Reward Logic
    const rewardData = isPremium ? tier.premiumRewardData : tier.freeRewardData;
    if (rewardData) {
      // @ts-ignore - Assuming JSON structure
      const data = rewardData as {
        type: string;
        amount?: number;
        itemId?: string;
        titleId?: string;
      };

      if (data.type === "GOLD" && data.amount) {
        await prisma.user.update({
          where: { id: userId },
          data: { gold: { increment: data.amount } },
        });
      }

      if (data.type === "ITEM" && data.itemId) {
        // Add item to equipment
        await prisma.userEquipment.upsert({
          where: { userId_equipmentId: { userId, equipmentId: data.itemId } },
          create: { userId, equipmentId: data.itemId, isOwned: true },
          update: { isOwned: true },
        });
      }

      if (data.type === "TITLE" && data.titleId) {
        // Unlock title
        await prisma.userTitle.upsert({
          where: { userId_titleId: { userId, titleId: data.titleId } },
          create: { userId, titleId: data.titleId },
          update: {},
        });
      }
      // Add more types as needed (e.g. XP_BOOST)
    }

    // Record Claim
    await prisma.userBattlePassClaim.create({
      data: {
        userBattlePassId: userPass.id,
        tierLevel,
        isPremium,
      },
    });

    revalidatePath("/battle-pass");
    return { success: true, message: "Reward claimed!" };
  } catch (error) {
    console.error("Error claiming reward:", error);
    return { success: false, message: "Failed to claim reward" };
  }
}

/**
 * Upgrade to Premium Battle Pass.
 * In a real app, this would verify payment.
 */
export async function upgradeToPremiumAction(userId: string) {
  try {
    const season = await getActiveSeasonAction();
    if (!season) return { success: false, message: "No active season" };

    // Check user balance (Mocking cost: 1000 Gold)
    // ideally unrelated to gold, but for now let's make it free or check functionality
    // Let's just set it for now.

    await prisma.userBattlePass.upsert({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      create: {
        userId,
        seasonId: season.id,
        hasPremium: true,
      },
      update: { hasPremium: true },
    });

    revalidatePath("/battle-pass");
    revalidatePath("/dashboard");
    return { success: true, message: "Upgraded to Premium!" };
  } catch (error) {
    console.error("Upgrade error:", error);
    return { success: false, message: "Failed to upgrade" };
  }
}

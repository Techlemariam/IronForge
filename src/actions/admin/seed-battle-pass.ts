"use server";

import { prisma } from "@/lib/prisma";

export async function seedBattlePassSeasonAction() {
  try {
    const seasonCode = "SEASON_1";

    // Check if exists
    const existing = await prisma.battlePassSeason.findUnique({
      where: { code: seasonCode },
    });

    if (existing) {
      return { success: false, message: "Season 1 already exists" };
    }

    // Create Season
    const season = await prisma.battlePassSeason.create({
      data: {
        name: "Season 1: Genesis",
        code: seasonCode,
        startDate: new Date(), // Starts now
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
        isActive: true,
      },
    });

    // Create 50 Tiers
    const tiers = [];
    let xpCumulative = 0;

    for (let i = 1; i <= 50; i++) {
      // Simple XP Curve: 1000 * 1.05^(level-1)
      const xpForLevel = Math.floor(1000 * Math.pow(1.05, i - 1));
      xpCumulative += xpForLevel;

      // Rewards
      let freeRewardData: any = undefined;
      let premiumRewardData: any = undefined;

      // Every 5 levels: Free Gold
      if (i % 5 === 0) {
        freeRewardData = { type: "GOLD", amount: 500 * (i / 5) };
      }

      // Every level Premium: Gold or Item placeholder
      if (i % 10 === 0) {
        premiumRewardData = { type: "TITLE", titleId: `title_s1_tier_${i}` }; // Placeholder
      } else {
        premiumRewardData = { type: "GOLD", amount: 100 * i };
      }

      tiers.push({
        seasonId: season.id,
        tierLevel: i,
        requiredXp: xpCumulative,
        freeRewardData,
        premiumRewardData,
      });
    }

    await prisma.battlePassTier.createMany({
      data: tiers as any,
    });

    return {
      success: true,
      message: `Created Season 1 with ${tiers.length} tiers.`,
    };
  } catch (error) {
    console.error("Seeding error:", error);
    return { success: false, message: "Failed to seed season" };
  }
}

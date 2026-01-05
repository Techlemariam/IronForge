"use server";

import { revalidatePath } from "next/cache";

interface PrestigeLevel {
  level: number;
  name: string;
  requirement: number; // Total level required
  bonuses: PrestigeBonus[];
  cosmetic?: string;
}

interface PrestigeBonus {
  stat: string;
  value: number;
  type: "PERCENT" | "FLAT";
}

interface PrestigeStatus {
  currentPrestige: number;
  totalPrestiges: number;
  bonuses: PrestigeBonus[];
  canPrestige: boolean;
  prestigeRequirement: number;
  currentLevel: number;
}

const PRESTIGE_LEVELS: PrestigeLevel[] = [
  {
    level: 1,
    name: "Bronze Titan",
    requirement: 50,
    bonuses: [{ stat: "xpGain", value: 5, type: "PERCENT" }],
    cosmetic: "frame-bronze",
  },
  {
    level: 2,
    name: "Silver Titan",
    requirement: 50,
    bonuses: [
      { stat: "xpGain", value: 10, type: "PERCENT" },
      { stat: "goldGain", value: 5, type: "PERCENT" },
    ],
    cosmetic: "frame-silver",
  },
  {
    level: 3,
    name: "Gold Titan",
    requirement: 50,
    bonuses: [
      { stat: "xpGain", value: 15, type: "PERCENT" },
      { stat: "goldGain", value: 10, type: "PERCENT" },
    ],
    cosmetic: "frame-gold",
  },
  {
    level: 4,
    name: "Platinum Titan",
    requirement: 50,
    bonuses: [
      { stat: "xpGain", value: 20, type: "PERCENT" },
      { stat: "goldGain", value: 15, type: "PERCENT" },
      { stat: "damage", value: 5, type: "PERCENT" },
    ],
    cosmetic: "frame-platinum",
  },
  {
    level: 5,
    name: "Diamond Titan",
    requirement: 50,
    bonuses: [
      { stat: "xpGain", value: 25, type: "PERCENT" },
      { stat: "goldGain", value: 20, type: "PERCENT" },
      { stat: "damage", value: 10, type: "PERCENT" },
      { stat: "defense", value: 5, type: "PERCENT" },
    ],
    cosmetic: "frame-diamond",
  },
  {
    level: 10,
    name: "Mythic Titan",
    requirement: 50,
    bonuses: [
      { stat: "xpGain", value: 50, type: "PERCENT" },
      { stat: "goldGain", value: 50, type: "PERCENT" },
      { stat: "allStats", value: 10, type: "PERCENT" },
    ],
    cosmetic: "frame-mythic",
  },
];

/**
 * Get prestige status.
 */
export async function getPrestigeStatusAction(
  _userId: string,
): Promise<PrestigeStatus> {
  const currentPrestige = 1;
  const currentLevel = 35;
  const nextPrestige = PRESTIGE_LEVELS.find(
    (p) => p.level === currentPrestige + 1,
  );
  const currentBonuses = PRESTIGE_LEVELS.filter(
    (p) => p.level <= currentPrestige,
  ).flatMap((p) => p.bonuses);

  return {
    currentPrestige,
    totalPrestiges: currentPrestige,
    bonuses: currentBonuses,
    canPrestige: currentLevel >= (nextPrestige?.requirement || 50),
    prestigeRequirement: nextPrestige?.requirement || 50,
    currentLevel,
  };
}

/**
 * Perform prestige reset.
 */
export async function performPrestigeAction(userId: string): Promise<{
  success: boolean;
  newPrestigeLevel: number;
  bonusesGained: PrestigeBonus[];
  message: string;
}> {
  const status = await getPrestigeStatusAction(userId);

  if (!status.canPrestige) {
    return {
      success: false,
      newPrestigeLevel: status.currentPrestige,
      bonusesGained: [],
      message: `Reach level ${status.prestigeRequirement} to prestige`,
    };
  }

  const newLevel = status.currentPrestige + 1;
  const newPrestige = PRESTIGE_LEVELS.find((p) => p.level === newLevel);

  console.log(`User ${userId} prestiged to level ${newLevel}`);
  revalidatePath("/prestige");

  return {
    success: true,
    newPrestigeLevel: newLevel,
    bonusesGained: newPrestige?.bonuses || [],
    message: `Congratulations! You are now a ${newPrestige?.name || "Titan"}!`,
  };
}

/**
 * Get prestige leaderboard.
 */
export async function getPrestigeLeaderboardAction(
  _limit: number = 10,
): Promise<Array<{ rank: number; heroName: string; prestigeLevel: number }>> {
  return [
    { rank: 1, heroName: "AncientOne", prestigeLevel: 10 },
    { rank: 2, heroName: "DiamondKing", prestigeLevel: 7 },
    { rank: 3, heroName: "PlatinumGod", prestigeLevel: 5 },
  ];
}

/**
 * Calculate total bonuses from prestige.
 */
export function calculatePrestigeBonuses(
  prestigeLevel: number,
): Record<string, number> {
  const bonuses: Record<string, number> = {};

  for (const prestige of PRESTIGE_LEVELS) {
    if (prestige.level <= prestigeLevel) {
      for (const bonus of prestige.bonuses) {
        bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
      }
    }
  }

  return bonuses;
}

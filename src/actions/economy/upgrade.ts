"use server";

import { revalidatePath } from "next/cache";

type UpgradeRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

interface EquipmentItem {
  id: string;
  name: string;
  rarity: UpgradeRarity;
  level: number;
  maxLevel: number;
  stats: Record<string, number>;
  upgradeHistory: UpgradeAttempt[];
}

interface UpgradeAttempt {
  date: Date;
  fromLevel: number;
  toLevel: number;
  success: boolean;
  goldSpent: number;
}

interface UpgradeCost {
  gold: number;
  materials: Array<{ name: string; amount: number }>;
  successRate: number;
}

// Upgrade costs by level
const UPGRADE_COSTS: Record<number, UpgradeCost> = {
  1: { gold: 100, materials: [], successRate: 100 },
  2: { gold: 250, materials: [], successRate: 95 },
  3: {
    gold: 500,
    materials: [{ name: "Iron Ingot", amount: 2 }],
    successRate: 90,
  },
  4: {
    gold: 1000,
    materials: [{ name: "Steel Ingot", amount: 2 }],
    successRate: 80,
  },
  5: {
    gold: 2000,
    materials: [{ name: "Mithril Ingot", amount: 1 }],
    successRate: 70,
  },
  6: {
    gold: 4000,
    materials: [{ name: "Mithril Ingot", amount: 3 }],
    successRate: 60,
  },
  7: {
    gold: 8000,
    materials: [{ name: "Dragon Scale", amount: 1 }],
    successRate: 50,
  },
  8: {
    gold: 15000,
    materials: [{ name: "Dragon Scale", amount: 2 }],
    successRate: 40,
  },
  9: {
    gold: 30000,
    materials: [{ name: "Titan Essence", amount: 1 }],
    successRate: 30,
  },
  10: {
    gold: 50000,
    materials: [{ name: "Titan Essence", amount: 3 }],
    successRate: 20,
  },
};

// Stat multipliers per level
const STAT_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.1,
  3: 1.25,
  4: 1.4,
  5: 1.6,
  6: 1.8,
  7: 2.0,
  8: 2.3,
  9: 2.6,
  10: 3.0,
};

/**
 * Get upgrade cost for next level.
 */
export async function getUpgradeCostAction(
  itemId: string,
  currentLevel: number,
): Promise<UpgradeCost | null> {
  const nextLevel = currentLevel + 1;
  return UPGRADE_COSTS[nextLevel] || null;
}

/**
 * Attempt to upgrade equipment.
 */
export async function upgradeEquipmentAction(
  userId: string,
  itemId: string,
): Promise<{ success: boolean; newLevel?: number; message: string }> {
  try {
    // In production, validate item ownership and resources
    const currentLevel = 3; // Would fetch from DB
    const cost = UPGRADE_COSTS[currentLevel + 1];

    if (!cost) {
      return { success: false, message: "Item is already at max level" };
    }

    // Simulate upgrade attempt
    const roll = Math.random() * 100;
    const succeeded = roll <= cost.successRate;

    if (succeeded) {
      const newLevel = currentLevel + 1;
      console.log(`Upgrade success: ${itemId} -> Level ${newLevel}`);
      revalidatePath("/inventory");
      return {
        success: true,
        newLevel,
        message: `Upgrade successful! Item is now level ${newLevel}`,
      };
    } else {
      console.log(`Upgrade failed: ${itemId}`);
      return {
        success: false,
        message: "Upgrade failed. Materials were consumed.",
      };
    }
  } catch (error) {
    console.error("Error upgrading equipment:", error);
    return { success: false, message: "An error occurred" };
  }
}

/**
 * Calculate stats at specific level.
 */
export function calculateUpgradedStats(
  baseStats: Record<string, number>,
  level: number,
): Record<string, number> {
  const multiplier = STAT_MULTIPLIERS[level] || 1.0;
  const result: Record<string, number> = {};

  for (const [stat, value] of Object.entries(baseStats)) {
    result[stat] = Math.round(value * multiplier);
  }

  return result;
}

/**
 * Get user's upgradeable equipment.
 */
export async function getUpgradeableEquipmentAction(
  _userId: string,
): Promise<EquipmentItem[]> {
  // MVP: Return sample equipment
  return [
    {
      id: "item-sword-1",
      name: "Iron Sword",
      rarity: "UNCOMMON",
      level: 3,
      maxLevel: 10,
      stats: { damage: 50, critChance: 5 },
      upgradeHistory: [],
    },
    {
      id: "item-armor-1",
      name: "Steel Plate",
      rarity: "RARE",
      level: 5,
      maxLevel: 10,
      stats: { defense: 80, hp: 100 },
      upgradeHistory: [],
    },
  ];
}

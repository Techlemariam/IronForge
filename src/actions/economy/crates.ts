"use server";

import { prisma as _prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CrateRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
type RewardType =
  | "XP"
  | "GOLD"
  | "EQUIPMENT"
  | "COSMETIC"
  | "BOOST"
  | "SKILL_POINT";

interface CrateReward {
  type: RewardType;
  name: string;
  description: string;
  rarity: CrateRarity;
  value?: number;
  itemId?: string;
}

interface RewardCrate {
  id: string;
  rarity: CrateRarity;
  name: string;
  description: string;
  possibleRewards: number;
  source: string;
  obtainedAt: Date;
  isOpened: boolean;
}

const RARITY_COLORS: Record<CrateRarity, string> = {
  COMMON: "#9ca3af",
  UNCOMMON: "#22c55e",
  RARE: "#3b82f6",
  EPIC: "#a855f7",
  LEGENDARY: "#f59e0b",
};

// Reward pools by crate rarity
const REWARD_POOLS: Record<CrateRarity, CrateReward[]> = {
  COMMON: [
    {
      type: "XP",
      name: "XP Bundle",
      description: "+100 XP",
      rarity: "COMMON",
      value: 100,
    },
    {
      type: "GOLD",
      name: "Gold Pouch",
      description: "+50 Gold",
      rarity: "COMMON",
      value: 50,
    },
    {
      type: "BOOST",
      name: "Minor XP Boost",
      description: "+10% XP for 1 hour",
      rarity: "COMMON",
    },
  ],
  UNCOMMON: [
    {
      type: "XP",
      name: "XP Pack",
      description: "+250 XP",
      rarity: "UNCOMMON",
      value: 250,
    },
    {
      type: "GOLD",
      name: "Gold Bag",
      description: "+150 Gold",
      rarity: "UNCOMMON",
      value: 150,
    },
    {
      type: "EQUIPMENT",
      name: "Training Gloves",
      description: "+5% grip strength",
      rarity: "UNCOMMON",
      itemId: "gloves-basic",
    },
    {
      type: "COSMETIC",
      name: "Bronze Frame",
      description: "Profile frame",
      rarity: "UNCOMMON",
      itemId: "frame-bronze",
    },
  ],
  RARE: [
    {
      type: "XP",
      name: "XP Chest",
      description: "+500 XP",
      rarity: "RARE",
      value: 500,
    },
    {
      type: "GOLD",
      name: "Gold Chest",
      description: "+300 Gold",
      rarity: "RARE",
      value: 300,
    },
    {
      type: "EQUIPMENT",
      name: "Iron Gauntlets",
      description: "+10% strength bonus",
      rarity: "RARE",
      itemId: "gauntlets-iron",
    },
    {
      type: "BOOST",
      name: "XP Boost",
      description: "+25% XP for 3 hours",
      rarity: "RARE",
    },
    {
      type: "SKILL_POINT",
      name: "Skill Tome",
      description: "+1 Skill Point",
      rarity: "RARE",
      value: 1,
    },
  ],
  EPIC: [
    {
      type: "XP",
      name: "XP Hoard",
      description: "+1000 XP",
      rarity: "EPIC",
      value: 1000,
    },
    {
      type: "GOLD",
      name: "Gold Hoard",
      description: "+750 Gold",
      rarity: "EPIC",
      value: 750,
    },
    {
      type: "EQUIPMENT",
      name: "Dragon Scale Armor",
      description: "+20% defense",
      rarity: "EPIC",
      itemId: "armor-dragon",
    },
    {
      type: "COSMETIC",
      name: "Epic Aura",
      description: "Purple particle effect",
      rarity: "EPIC",
      itemId: "aura-epic",
    },
    {
      type: "SKILL_POINT",
      name: "Ancient Tome",
      description: "+2 Skill Points",
      rarity: "EPIC",
      value: 2,
    },
  ],
  LEGENDARY: [
    {
      type: "XP",
      name: "XP Treasury",
      description: "+2500 XP",
      rarity: "LEGENDARY",
      value: 2500,
    },
    {
      type: "GOLD",
      name: "Gold Treasury",
      description: "+2000 Gold",
      rarity: "LEGENDARY",
      value: 2000,
    },
    {
      type: "EQUIPMENT",
      name: "Titan Blade",
      description: "+50% damage",
      rarity: "LEGENDARY",
      itemId: "weapon-titan",
    },
    {
      type: "COSMETIC",
      name: "Legendary Mount",
      description: "Unique title animation",
      rarity: "LEGENDARY",
      itemId: "mount-legend",
    },
    {
      type: "SKILL_POINT",
      name: "Forbidden Knowledge",
      description: "+5 Skill Points",
      rarity: "LEGENDARY",
      value: 5,
    },
  ],
};

/**
 * Get user's unopened crates.
 */
export async function getUserCratesAction(
  _userId: string,
): Promise<RewardCrate[]> {
  try {
    // MVP: Return sample crates
    return [
      {
        id: "crate-1",
        rarity: "COMMON",
        name: "Common Crate",
        description: "A basic reward crate",
        possibleRewards: 3,
        source: "Daily Quest",
        obtainedAt: new Date(),
        isOpened: false,
      },
      {
        id: "crate-2",
        rarity: "RARE",
        name: "Rare Crate",
        description: "A valuable reward crate",
        possibleRewards: 5,
        source: "PR Achievement",
        obtainedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isOpened: false,
      },
    ];
  } catch (error) {
    console.error("Error getting crates:", error);
    return [];
  }
}

/**
 * Open a crate and get rewards.
 */
export async function openCrateAction(
  userId: string,
  crateId: string,
): Promise<{ success: boolean; rewards: CrateReward[]; animation?: string }> {
  try {
    // Determine crate rarity (in production, fetch from DB)
    const rarity = "RARE" as CrateRarity;
    const pool = REWARD_POOLS[rarity];

    // Select random rewards (1-3 based on rarity)
    const rewardCount = rarity === "LEGENDARY" ? 3 : rarity === "EPIC" ? 2 : 1;
    const rewards: CrateReward[] = [];

    for (let i = 0; i < rewardCount; i++) {
      const reward = pool[Math.floor(Math.random() * pool.length)];
      rewards.push(reward);
    }

    console.log(
      `Opened crate ${crateId}: ${rewards.map((r) => r.name).join(", ")}`,
    );
    revalidatePath("/inventory");

    return {
      success: true,
      rewards,
      animation: `crate-open-${rarity.toLowerCase()}`,
    };
  } catch (error) {
    console.error("Error opening crate:", error);
    return { success: false, rewards: [] };
  }
}

/**
 * Award a crate to user.
 */
export async function awardCrateAction(
  userId: string,
  rarity: CrateRarity,
  source: string,
): Promise<{ success: boolean; crateId?: string }> {
  try {
    const crateId = `crate-${userId}-${Date.now()}`;
    console.log(`Awarded ${rarity} crate to ${userId} from ${source}`);
    revalidatePath("/inventory");
    return { success: true, crateId };
  } catch (error) {
    console.error("Error awarding crate:", error);
    return { success: false };
  }
}

export function getCrateColors() {
  return RARITY_COLORS;
}

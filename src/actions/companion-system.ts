"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CompanionType = "WOLF" | "PHOENIX" | "GOLEM" | "DRAGON" | "SPIRIT";
type CompanionRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

interface Companion {
  id: string;
  type: CompanionType;
  rarity: CompanionRarity;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  bond: number; // 0-100 affection level
  abilities: CompanionAbility[];
  stats: CompanionStats;
  appearance: string;
  isActive: boolean;
  obtainedAt: Date;
}

interface CompanionAbility {
  id: string;
  name: string;
  description: string;
  effect: { type: string; value: number };
  unlockedAtLevel: number;
  isUnlocked: boolean;
}

interface CompanionStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

// Companion templates
const COMPANION_TEMPLATES: Record<
  CompanionType,
  { name: string; baseStats: CompanionStats; abilities: CompanionAbility[] }
> = {
  WOLF: {
    name: "Iron Wolf",
    baseStats: { hp: 80, attack: 25, defense: 15, speed: 30 },
    abilities: [
      {
        id: "wolf-1",
        name: "Pack Bonus",
        description: "+5% XP gain",
        effect: { type: "XP_BOOST", value: 5 },
        unlockedAtLevel: 1,
        isUnlocked: true,
      },
      {
        id: "wolf-2",
        name: "Howl",
        description: "+10% damage for 3 turns",
        effect: { type: "DAMAGE_BOOST", value: 10 },
        unlockedAtLevel: 10,
        isUnlocked: false,
      },
      {
        id: "wolf-3",
        name: "Alpha Strike",
        description: "Guaranteed crit",
        effect: { type: "CRIT", value: 100 },
        unlockedAtLevel: 25,
        isUnlocked: false,
      },
    ],
  },
  PHOENIX: {
    name: "Ember Phoenix",
    baseStats: { hp: 60, attack: 35, defense: 10, speed: 25 },
    abilities: [
      {
        id: "phoenix-1",
        name: "Rebirth",
        description: "Revive once per battle",
        effect: { type: "REVIVE", value: 50 },
        unlockedAtLevel: 1,
        isUnlocked: true,
      },
      {
        id: "phoenix-2",
        name: "Flame Shield",
        description: "Absorb damage",
        effect: { type: "SHIELD", value: 20 },
        unlockedAtLevel: 15,
        isUnlocked: false,
      },
    ],
  },
  GOLEM: {
    name: "Stone Golem",
    baseStats: { hp: 150, attack: 15, defense: 35, speed: 10 },
    abilities: [
      {
        id: "golem-1",
        name: "Fortify",
        description: "+20% defense",
        effect: { type: "DEFENSE_BOOST", value: 20 },
        unlockedAtLevel: 1,
        isUnlocked: true,
      },
    ],
  },
  DRAGON: {
    name: "Storm Dragon",
    baseStats: { hp: 100, attack: 40, defense: 20, speed: 20 },
    abilities: [
      {
        id: "dragon-1",
        name: "Dragon's Fury",
        description: "+25% damage",
        effect: { type: "DAMAGE_BOOST", value: 25 },
        unlockedAtLevel: 1,
        isUnlocked: true,
      },
    ],
  },
  SPIRIT: {
    name: "Ancient Spirit",
    baseStats: { hp: 70, attack: 20, defense: 20, speed: 35 },
    abilities: [
      {
        id: "spirit-1",
        name: "Wisdom",
        description: "+15% XP",
        effect: { type: "XP_BOOST", value: 15 },
        unlockedAtLevel: 1,
        isUnlocked: true,
      },
    ],
  },
};

/**
 * Get user's active companion.
 */
export async function getActiveCompanionAction(
  userId: string,
): Promise<Companion | null> {
  // MVP: Return sample companion
  const template = COMPANION_TEMPLATES.WOLF;
  return {
    id: "companion-wolf-1",
    type: "WOLF",
    rarity: "RARE",
    name: "Shadow",
    level: 15,
    xp: 1200,
    xpToNextLevel: 2000,
    bond: 75,
    abilities: template.abilities.map((a) => ({
      ...a,
      isUnlocked: a.unlockedAtLevel <= 15,
    })),
    stats: {
      hp: template.baseStats.hp + 15 * 5,
      attack: template.baseStats.attack + 15 * 2,
      defense: template.baseStats.defense + 15,
      speed: template.baseStats.speed + 15,
    },
    appearance: "wolf-shadow",
    isActive: true,
    obtainedAt: new Date("2024-06-01"),
  };
}

/**
 * Get all user's companions.
 */
export async function getAllCompanionsAction(
  userId: string,
): Promise<Companion[]> {
  const active = await getActiveCompanionAction(userId);
  return active ? [active] : [];
}

/**
 * Feed companion to increase bond.
 */
export async function feedCompanionAction(
  userId: string,
  companionId: string,
  foodType: string,
): Promise<{ success: boolean; newBond: number }> {
  console.log(`Fed companion ${companionId} with ${foodType}`);
  revalidatePath("/companion");
  return { success: true, newBond: 80 };
}

/**
 * Train companion to gain XP.
 */
export async function trainCompanionAction(
  userId: string,
  companionId: string,
): Promise<{ success: boolean; xpGained: number; leveledUp: boolean }> {
  console.log(`Trained companion ${companionId}`);
  revalidatePath("/companion");
  return { success: true, xpGained: 100, leveledUp: false };
}

/**
 * Set active companion.
 */
export async function setActiveCompanionAction(
  userId: string,
  companionId: string,
): Promise<{ success: boolean }> {
  console.log(`Set active companion: ${companionId}`);
  revalidatePath("/companion");
  return { success: true };
}

/**
 * Summon new companion (gacha-style).
 */
export async function summonCompanionAction(
  userId: string,
): Promise<{ success: boolean; companion?: Companion }> {
  const types: CompanionType[] = [
    "WOLF",
    "PHOENIX",
    "GOLEM",
    "DRAGON",
    "SPIRIT",
  ];
  const randomType = types[Math.floor(Math.random() * types.length)];
  // In production, implement gacha rates
  console.log(`Summoned new ${randomType} companion`);
  revalidatePath("/companion");
  return { success: true };
}

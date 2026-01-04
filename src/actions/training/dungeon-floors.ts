"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type FloorType = "NORMAL" | "ELITE" | "BOSS" | "TREASURE" | "REST";
type FloorTheme = "MINES" | "CAVES" | "FORTRESS" | "ABYSS" | "VOLCANIC";

interface DungeonFloor {
  id: string;
  number: number;
  type: FloorType;
  theme: FloorTheme;
  name: string;
  description: string;
  difficulty: number; // 1-10
  enemies: FloorEnemy[];
  rewards: FloorReward[];
  isCleared: boolean;
  bestClearTime?: number;
}

interface FloorEnemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  damage: number;
  isBoss: boolean;
}

interface FloorReward {
  type: "XP" | "GOLD" | "CRATE" | "EQUIPMENT" | "MATERIAL";
  amount: number;
  guaranteed: boolean;
  dropChance: number;
}

interface DungeonProgress {
  currentFloor: number;
  highestFloor: number;
  totalClears: number;
  currentRunFloors: number;
  runActive: boolean;
}

// Floor generation templates
const FLOOR_TEMPLATES: Record<FloorType, Partial<DungeonFloor>> = {
  NORMAL: { difficulty: 1, enemies: [], rewards: [] },
  ELITE: { difficulty: 1.5, enemies: [], rewards: [] },
  BOSS: { difficulty: 2, enemies: [], rewards: [] },
  TREASURE: { difficulty: 0.5, enemies: [], rewards: [] },
  REST: { difficulty: 0, enemies: [], rewards: [] },
};

/**
 * Get dungeon progress for user.
 */
export async function getDungeonProgressAction(
  userId: string,
): Promise<DungeonProgress> {
  return {
    currentFloor: 15,
    highestFloor: 23,
    totalClears: 145,
    currentRunFloors: 5,
    runActive: true,
  };
}

/**
 * Get floor details.
 */
export async function getFloorDetailsAction(
  userId: string,
  floorNumber: number,
): Promise<DungeonFloor> {
  const type: FloorType =
    floorNumber % 10 === 0
      ? "BOSS"
      : floorNumber % 5 === 0
        ? "ELITE"
        : "NORMAL";
  const theme: FloorTheme =
    floorNumber <= 10
      ? "MINES"
      : floorNumber <= 20
        ? "CAVES"
        : floorNumber <= 30
          ? "FORTRESS"
          : "ABYSS";

  return {
    id: `floor-${floorNumber}`,
    number: floorNumber,
    type,
    theme,
    name: `${theme} Floor ${floorNumber}`,
    description: `Venture into ${theme.toLowerCase()} level ${floorNumber}`,
    difficulty: Math.min(10, Math.ceil(floorNumber / 5)),
    enemies: [
      {
        id: "e1",
        name: "Iron Golem",
        level: floorNumber,
        hp: 100 + floorNumber * 20,
        damage: 10 + floorNumber * 2,
        isBoss: type === "BOSS",
      },
    ],
    rewards: [
      {
        type: "XP",
        amount: 50 * floorNumber,
        guaranteed: true,
        dropChance: 100,
      },
      {
        type: "GOLD",
        amount: 25 * floorNumber,
        guaranteed: true,
        dropChance: 100,
      },
      { type: "MATERIAL", amount: 1, guaranteed: false, dropChance: 30 },
    ],
    isCleared: floorNumber <= 23,
  };
}

/**
 * Start a dungeon run.
 */
export async function startDungeonRunAction(
  userId: string,
): Promise<{ success: boolean; startingFloor: number }> {
  console.log(`Starting dungeon run for ${userId}`);
  revalidatePath("/dungeon");
  return { success: true, startingFloor: 1 };
}

/**
 * Clear a floor and progress.
 */
export async function clearFloorAction(
  userId: string,
  floorNumber: number,
  clearTimeMs: number,
): Promise<{ success: boolean; rewards: FloorReward[]; nextFloor: number }> {
  const rewards: FloorReward[] = [
    { type: "XP", amount: 50 * floorNumber, guaranteed: true, dropChance: 100 },
    {
      type: "GOLD",
      amount: 25 * floorNumber,
      guaranteed: true,
      dropChance: 100,
    },
  ];

  console.log(`Cleared floor ${floorNumber} in ${clearTimeMs}ms`);
  revalidatePath("/dungeon");
  return { success: true, rewards, nextFloor: floorNumber + 1 };
}

/**
 * End dungeon run.
 */
export async function endDungeonRunAction(
  userId: string,
): Promise<{ floorsCleared: number; totalRewards: FloorReward[] }> {
  console.log(`Ending dungeon run for ${userId}`);
  revalidatePath("/dungeon");
  return {
    floorsCleared: 5,
    totalRewards: [
      { type: "XP", amount: 1500, guaranteed: true, dropChance: 100 },
      { type: "GOLD", amount: 750, guaranteed: true, dropChance: 100 },
    ],
  };
}

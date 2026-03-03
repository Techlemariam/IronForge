"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

type FloorType = "NORMAL" | "ELITE" | "BOSS" | "TREASURE" | "REST";
type FloorTheme = "MINES" | "CAVES" | "FORTRESS" | "ABYSS" | "VOLCANIC";

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

interface DungeonFloor {
  id: string;
  number: number;
  type: FloorType;
  theme: FloorTheme;
  name: string;
  description: string;
  difficulty: number;
  enemies: FloorEnemy[];
  rewards: FloorReward[];
  isCleared: boolean;
  bestClearTime?: number;
}

export const getAvailableFloorsAction = authActionClient
  .action(async () => {
    return {
      currentFloor: 15,
      highestFloor: 23,
      totalClears: 145,
      currentRunFloors: 5,
      runActive: true,
    };
  });

export const getFloorDetailsAction = authActionClient
  .schema(z.object({ floorNumber: z.number().int().min(1) }))
  .action(async ({ parsedInput: { floorNumber } }): Promise<DungeonFloor> => {
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
        { type: "XP", amount: 50 * floorNumber, guaranteed: true, dropChance: 100 },
        { type: "GOLD", amount: 25 * floorNumber, guaranteed: true, dropChance: 100 },
        { type: "MATERIAL", amount: 1, guaranteed: false, dropChance: 30 },
      ],
      isCleared: floorNumber <= 23,
    };
  });

export const startFloorRunAction = authActionClient
  .action(async ({ ctx: { userId } }) => {
    console.log(`Starting dungeon run for ID:[REDACTED]`);
    revalidatePath("/dungeon");
    return { startingFloor: 1 };
  });

export const clearFloorAction = authActionClient
  .schema(z.object({ floorNumber: z.number().int().min(1), clearTimeMs: z.number().int().min(0) }))
  .action(async ({ parsedInput: { floorNumber, clearTimeMs }, ctx: { userId } }) => {
    const rewards: FloorReward[] = [
      { type: "XP", amount: 50 * floorNumber, guaranteed: true, dropChance: 100 },
      { type: "GOLD", amount: 25 * floorNumber, guaranteed: true, dropChance: 100 },
    ];
    console.log(`Cleared floor ${floorNumber} in ${clearTimeMs}ms for ID:[REDACTED]`);
    revalidatePath("/dungeon");
    return { rewards, nextFloor: floorNumber + 1 };
  });

export const endFloorRunAction = authActionClient
  .action(async ({ ctx: { userId } }) => {
    console.log(`Ending dungeon run for ID:[REDACTED]`);
    revalidatePath("/dungeon");
    return {
      floorsCleared: 5,
      totalRewards: [
        { type: "XP" as const, amount: 1500, guaranteed: true, dropChance: 100 },
        { type: "GOLD" as const, amount: 750, guaranteed: true, dropChance: 100 },
      ],
    };
  });

"use server";

import { prisma } from "@/lib/prisma";

interface DungeonRequirement {
  dungeonId: string;
  name: string;
  requiredLevel: number;
  requiredBossKills: number;
  requiredCardioSessions?: number;
  isUnlocked: boolean;
  progress: {
    currentLevel: number;
    currentBossKills: number;
    currentCardioSessions: number;
  };
  unlockMessage: string;
}

const DUNGEON_GATES: Omit<DungeonRequirement, "isUnlocked" | "progress">[] = [
  {
    dungeonId: "deadmines",
    name: "The Dead Mines",
    requiredLevel: 1,
    requiredBossKills: 0,
    unlockMessage: "Available to all Titans.",
  },
  {
    dungeonId: "iron_halls",
    name: "Iron Halls",
    requiredLevel: 5,
    requiredBossKills: 1,
    unlockMessage: "Defeat 1 boss to unlock.",
  },
  {
    dungeonId: "zone_2_cardio",
    name: "The Cardio Crucible",
    requiredLevel: 3,
    requiredBossKills: 0,
    requiredCardioSessions: 5,
    unlockMessage: "Complete 5 cardio sessions to unlock Zone 2 training.",
  },
  {
    dungeonId: "shadow_forge",
    name: "Shadow Forge",
    requiredLevel: 10,
    requiredBossKills: 5,
    unlockMessage: "Reach level 10 and defeat 5 bosses.",
  },
  {
    dungeonId: "titan_trials",
    name: "Titan Trials",
    requiredLevel: 20,
    requiredBossKills: 15,
    unlockMessage: "Only the strongest Titans may enter.",
  },
];

/**
 * Check dungeon unlock status for a user.
 */
export async function checkDungeonUnlockAction(
  userId: string,
  dungeonId: string,
): Promise<DungeonRequirement | null> {
  try {
    const [user, titan] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              unlockedMonsters: true,
              cardioLogs: true,
            },
          },
        },
      }),
      prisma.titan.findFirst({
        where: { userId },
        select: { level: true },
      }),
    ]);

    if (!user) return null;

    const gate = DUNGEON_GATES.find((d) => d.dungeonId === dungeonId);
    if (!gate) return null;

    const currentLevel = titan?.level || 1;
    const currentBossKills = user._count.unlockedMonsters;
    const currentCardioSessions = user._count.cardioLogs;

    const isUnlocked =
      currentLevel >= gate.requiredLevel &&
      currentBossKills >= gate.requiredBossKills &&
      (!gate.requiredCardioSessions ||
        currentCardioSessions >= gate.requiredCardioSessions);

    return {
      ...gate,
      isUnlocked,
      progress: {
        currentLevel,
        currentBossKills,
        currentCardioSessions,
      },
    };
  } catch (error) {
    console.error("Error checking dungeon unlock:", error);
    return null;
  }
}

/**
 * Get all dungeons with unlock status.
 */
export async function getAllDungeonsAction(
  userId: string,
): Promise<DungeonRequirement[]> {
  try {
    const [user, titan] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              unlockedMonsters: true,
              cardioLogs: true,
            },
          },
        },
      }),
      prisma.titan.findFirst({
        where: { userId },
        select: { level: true },
      }),
    ]);

    if (!user) return [];

    const currentLevel = titan?.level || 1;
    const currentBossKills = user._count.unlockedMonsters;
    const currentCardioSessions = user._count.cardioLogs;

    return DUNGEON_GATES.map((gate) => ({
      ...gate,
      isUnlocked:
        currentLevel >= gate.requiredLevel &&
        currentBossKills >= gate.requiredBossKills &&
        (!gate.requiredCardioSessions ||
          currentCardioSessions >= gate.requiredCardioSessions),
      progress: {
        currentLevel,
        currentBossKills,
        currentCardioSessions,
      },
    }));
  } catch (error) {
    console.error("Error getting all dungeons:", error);
    return [];
  }
}

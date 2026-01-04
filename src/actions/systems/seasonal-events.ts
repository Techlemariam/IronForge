"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type EventType = "SEASONAL" | "HOLIDAY" | "COMPETITION" | "COMMUNITY";

interface SeasonalEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  rewards: EventReward[];
  challenges: EventChallenge[];
  cosmetics: EventCosmetic[];
  leaderboard?: EventLeaderboard;
}

interface EventReward {
  id: string;
  name: string;
  description: string;
  requirement: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  type: "COSMETIC" | "EQUIPMENT" | "TITLE" | "CURRENCY";
  claimed?: boolean;
}

interface EventChallenge {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  eventPoints: number;
}

interface EventCosmetic {
  id: string;
  name: string;
  type: "SKIN" | "FRAME" | "AURA" | "TITLE" | "EMOTE";
  preview: string;
  cost: number; // Event currency
  isOwned: boolean;
}

interface EventLeaderboard {
  entries: Array<{ rank: number; heroName: string; points: number }>;
  userRank?: number;
  userPoints?: number;
}

/**
 * Get current active events.
 */
export async function getActiveEventsAction(): Promise<SeasonalEvent[]> {
  const now = new Date();

  // MVP: Return sample seasonal event
  const winterEvent: SeasonalEvent = {
    id: "winter-2025",
    type: "SEASONAL",
    name: "Iron Winter Festival",
    description: "Brave the cold and conquer the frozen forge!",
    theme: "winter",
    startDate: new Date("2024-12-20"),
    endDate: new Date("2025-01-10"),
    isActive: true,
    rewards: [
      {
        id: "r1",
        name: "Frost Armor",
        description: "Icy blue armor set",
        requirement: "Complete 10 winter challenges",
        rarity: "EPIC",
        type: "EQUIPMENT",
      },
      {
        id: "r2",
        name: "Snowflake Frame",
        description: "Winter-themed profile frame",
        requirement: "Earn 1000 event points",
        rarity: "RARE",
        type: "COSMETIC",
      },
      {
        id: "r3",
        name: "Blizzard Prince",
        description: "Exclusive winter title",
        requirement: "Reach top 100 on leaderboard",
        rarity: "LEGENDARY",
        type: "TITLE",
      },
    ],
    challenges: [
      {
        id: "c1",
        name: "Cold Muscles",
        description: "Complete 5 workouts",
        progress: 3,
        target: 5,
        xpReward: 500,
        eventPoints: 100,
      },
      {
        id: "c2",
        name: "Frozen Volume",
        description: "Log 50,000kg total volume",
        progress: 32500,
        target: 50000,
        xpReward: 1000,
        eventPoints: 200,
      },
      {
        id: "c3",
        name: "Ice Breaker",
        description: "Set 3 new PRs",
        progress: 1,
        target: 3,
        xpReward: 1500,
        eventPoints: 300,
      },
    ],
    cosmetics: [
      {
        id: "cos1",
        name: "Frost Aura",
        type: "AURA",
        preview: "/events/winter/frost-aura.png",
        cost: 500,
        isOwned: false,
      },
      {
        id: "cos2",
        name: "Ice Crown",
        type: "SKIN",
        preview: "/events/winter/ice-crown.png",
        cost: 1000,
        isOwned: false,
      },
      {
        id: "cos3",
        name: "Blizzard Emote",
        type: "EMOTE",
        preview: "/events/winter/blizzard-emote.png",
        cost: 250,
        isOwned: true,
      },
    ],
    leaderboard: {
      entries: [
        { rank: 1, heroName: "FrostGiant", points: 4500 },
        { rank: 2, heroName: "IceQueen", points: 4200 },
        { rank: 3, heroName: "WinterWarrior", points: 3800 },
      ],
      userRank: 47,
      userPoints: 850,
    },
  };

  return [winterEvent];
}

/**
 * Get user's event progress.
 */
export async function getEventProgressAction(
  userId: string,
  eventId: string,
): Promise<{
  points: number;
  rank: number;
  completedChallenges: number;
  ownedCosmetics: string[];
}> {
  return {
    points: 850,
    rank: 47,
    completedChallenges: 2,
    ownedCosmetics: ["cos3"],
  };
}

/**
 * Purchase event cosmetic.
 */
export async function purchaseEventCosmeticAction(
  userId: string,
  eventId: string,
  cosmeticId: string,
): Promise<{ success: boolean; newBalance?: number }> {
  try {
    console.log(`Purchased cosmetic ${cosmeticId} from event ${eventId}`);
    revalidatePath("/events");
    return { success: true, newBalance: 350 };
  } catch (error) {
    console.error("Error purchasing cosmetic:", error);
    return { success: false };
  }
}

/**
 * Claim event reward.
 */
export async function claimEventRewardAction(
  userId: string,
  eventId: string,
  rewardId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Claimed reward ${rewardId} from event ${eventId}`);
    revalidatePath("/events");
    return { success: true, message: "Reward claimed!" };
  } catch (error) {
    console.error("Error claiming reward:", error);
    return { success: false, message: "Failed to claim reward" };
  }
}

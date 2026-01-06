"use server";

// import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ChallengeType = "VOLUME" | "REPS" | "WEIGHT" | "STREAK" | "XP" | "CUSTOM";
type ChallengeStatus =
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "DECLINED"
  | "EXPIRED";

interface FriendChallenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  challengers: ChallengerInfo[];
  target: number;
  deadline: Date;
  status: ChallengeStatus;
  wager?: { xp: number; gold: number };
  winnerId?: string;
}

interface ChallengerInfo {
  userId: string;
  heroName: string;
  progress: number;
  isChallenger: boolean;
}

interface ChallengeTemplate {
  type: ChallengeType;
  name: string;
  description: string;
  defaultTarget: number;
  defaultDurationDays: number;
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    type: "VOLUME",
    name: "Volume War",
    description: "Most total volume wins",
    defaultTarget: 50000,
    defaultDurationDays: 7,
  },
  {
    type: "REPS",
    name: "Rep Battle",
    description: "Most reps completed",
    defaultTarget: 500,
    defaultDurationDays: 3,
  },
  {
    type: "STREAK",
    name: "Streak Showdown",
    description: "Longest workout streak",
    defaultTarget: 7,
    defaultDurationDays: 14,
  },
  {
    type: "XP",
    name: "XP Race",
    description: "Most XP earned",
    defaultTarget: 5000,
    defaultDurationDays: 7,
  },
];

/**
 * Create a challenge to a friend.
 */
export async function createFriendChallengeAction(
  challengerId: string,
  challengedId: string,
  type: ChallengeType,
  target: number,
  durationDays: number,
  _wager?: { xp: number; gold: number },
): Promise<{ success: boolean; challengeId?: string }> {
  try {
    const challengeId = `challenge-${Date.now()}`;
    const _deadline = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    console.log(
      `Created challenge ${type} from ${challengerId} to ${challengedId}`,
    );
    revalidatePath("/challenges");
    return { success: true, challengeId };
  } catch (error) {
    console.error("Error creating challenge:", error);
    return { success: false };
  }
}

/**
 * Accept a challenge.
 */
export async function acceptChallengeAction(
  userId: string,
  challengeId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Accepted challenge ${challengeId}`);
    revalidatePath("/challenges");
    return { success: true };
  } catch (error) {
    console.error("Error accepting challenge:", error);
    return { success: false };
  }
}

/**
 * Decline a challenge.
 */
export async function declineChallengeAction(
  userId: string,
  challengeId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Declined challenge ${challengeId}`);
    revalidatePath("/challenges");
    return { success: true };
  } catch (error) {
    console.error("Error declining challenge:", error);
    return { success: false };
  }
}

/**
 * Get user's active challenges.
 */
export async function getActiveChallengesAction(
  userId: string,
): Promise<FriendChallenge[]> {
  return [
    {
      id: "c1",
      type: "VOLUME",
      name: "Volume War",
      description: "Most total volume wins",
      challengers: [
        { userId, heroName: "You", progress: 32500, isChallenger: true },
        {
          userId: "f1",
          heroName: "IronGiant",
          progress: 28000,
          isChallenger: false,
        },
      ],
      target: 50000,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      wager: { xp: 500, gold: 250 },
    },
  ];
}

/**
 * Get pending challenges (received).
 */
export async function getPendingChallengesAction(
  userId: string,
): Promise<FriendChallenge[]> {
  return [
    {
      id: "c2",
      type: "STREAK",
      name: "Streak Showdown",
      description: "Longest workout streak",
      challengers: [
        {
          userId: "f2",
          heroName: "StormBreaker",
          progress: 0,
          isChallenger: true,
        },
        { userId, heroName: "You", progress: 0, isChallenger: false },
      ],
      target: 7,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "PENDING",
    },
  ];
}

/**
 * Get challenge templates.
 */
export function getChallengeTemplates(): ChallengeTemplate[] {
  return CHALLENGE_TEMPLATES;
}

/**
 * Complete and finalize a challenge.
 */
export async function finalizeChallengeAction(
  challengeId: string,
): Promise<{ winnerId: string; rewards: { xp: number; gold: number } }> {
  // In production, calculate winner and distribute rewards
  return {
    winnerId: "user-id",
    rewards: { xp: 1000, gold: 500 },
  };
}

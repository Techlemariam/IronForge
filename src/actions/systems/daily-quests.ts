"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type QuestType =
  | "WORKOUT"
  | "VOLUME"
  | "CARDIO"
  | "STREAK"
  | "PR"
  | "COMBO"
  | "SOCIAL";
type QuestDifficulty = "EASY" | "MEDIUM" | "HARD" | "LEGENDARY";

interface DailyQuest {
  id: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  goldReward: number;
  bonusReward?: string;
  expiresAt: Date;
  isCompleted: boolean;
  isClaimed: boolean;
}

const DAILY_QUEST_TEMPLATES = [
  {
    code: "DAILY_WORKOUT_1",
    title: "First Steps",
    description: "Complete any workout",
    type: "DAILY",
    criteria: { metric: "workouts", target: 1 },
    rewards: { xp: 100, gold: 50 },
    difficulty: "EASY"
  },
  {
    code: "DAILY_VOL_1",
    title: "Volume Builder",
    description: "Log 5000kg total volume",
    type: "DAILY",
    criteria: { metric: "volume_kg", target: 5000 },
    rewards: { xp: 150, gold: 75 },
    difficulty: "MEDIUM"
  },
  {
    code: "DAILY_CARDIO_1",
    title: "Heart Starter",
    description: "Complete 15 min cardio",
    type: "DAILY",
    criteria: { metric: "duration_min", target: 15 },
    rewards: { xp: 100, gold: 50 },
    difficulty: "EASY"
  }
];

/**
 * Generate (or fetch) daily quests for a user.
 * Now backed by DB.
 */
export async function generateDailyQuestsAction(
  userId: string,
): Promise<DailyQuest[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Check existing active daily quests
    const existing = await prisma.userChallenge.findMany({
      where: {
        userId,
        challenge: {
          type: "DAILY",
          endDate: { gt: new Date() } // Not expired
        }
      },
      include: { challenge: true }
    });

    if (existing.length > 0) {
      return existing.map(mapUserChallengeToDailyQuest);
    }

    // 2. Generate new ones if none exist

    // GPE Integration: Check for DELOAD
    let templateList = [...DAILY_QUEST_TEMPLATES];
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wardensManifest: true }
      });

      if (user && user.wardensManifest) {
        const phase = user.wardensManifest.phase || "BALANCED";

        if (phase === "DELOAD") {
          // Filter out Volume/High-Intensity
          templateList = templateList.filter(t => t.code !== 'DAILY_VOL_1' && t.code !== 'DAILY_WORKOUT_1');

          // Add Recovery Quest
          templateList.push({
            code: "DAILY_RECOVERY_1",
            title: "Active Recovery",
            description: "Log 15 min mobility or yoga",
            type: "DAILY",
            criteria: { metric: "duration_min", target: 15 },
            rewards: { xp: 200, gold: 0 },
            difficulty: "EASY"
          });
        }
      }
    } catch (e) {
      console.warn("GPE Quest Check failed", e);
    }

    // Create/Find Templates
    const dbChallenges = [];
    for (const tpl of templateList) {
      // Daily challenges need unique dates if we track history? 
      // Or we re-use the same "Challenge" def and just create new "UserChallenge" rows?
      // Schema: UserChallenge has ID (userId, challengeId). 
      // If we reuse challengeId, we can't track history.
      // We likely need a "Active Daily Challenge" system.
      // Let's create specific Challenge rows for TODAY.
      const code = `${tpl.code}_${today.toISOString().split('T')[0]}`;

      const challenge = await prisma.challenge.upsert({
        where: { code },
        create: {
          code,
          title: tpl.title,
          description: tpl.description,
          type: "DAILY",
          startDate: today,
          endDate: tomorrow,
          criteria: tpl.criteria,
          rewards: tpl.rewards
        },
        update: {}
      });
      dbChallenges.push(challenge);
    }

    // 3. Assign to User
    const newQuests = [];
    for (const c of dbChallenges) {
      const userQuest = await prisma.userChallenge.create({
        data: {
          userId,
          challengeId: c.id,
          progress: 0,
          completed: false
        },
        include: { challenge: true }
      });
      newQuests.push(mapUserChallengeToDailyQuest(userQuest));
    }

    return newQuests;

  } catch (error) {
    console.error("Error generating daily quests:", error);
    return [];
  }
}

function mapUserChallengeToDailyQuest(uc: any): DailyQuest {
  const c = uc.challenge;
  const criteria = c.criteria as any;
  const rewards = c.rewards as any;
  return {
    id: c.id, // Use Challenge ID for tracking
    type: mapMetricToType(criteria.metric),
    difficulty: "MEDIUM", // Hardcoded for simplified mapping
    title: c.title,
    description: c.description,
    target: criteria.target,
    current: uc.progress,
    xpReward: rewards.xp || 0,
    goldReward: rewards.gold || 0,
    expiresAt: c.endDate,
    isCompleted: uc.completed,
    isClaimed: uc.claimed
  };
}

function mapMetricToType(metric: string): QuestType {
  if (metric === 'volume_kg') return 'VOLUME';
  if (metric === 'workouts') return 'WORKOUT';
  if (metric === 'duration_min') return 'CARDIO';
  if (metric === 'distance_km') return 'CARDIO';
  return 'WORKOUT';
}

/**
 * Get user's current daily quests.
 */
export async function getDailyQuestsAction(
  userId: string,
): Promise<DailyQuest[]> {
  return generateDailyQuestsAction(userId);
}

/**
 * Update quest progress - DEPRECATED via wrapper.
 * Actual logic is in challengeService.ts processWorkoutLog
 */
export async function updateQuestProgressAction(
  _userId: string,
  _questType: QuestType,
  _amount: number,
): Promise<{ questsUpdated: number; questsCompleted: string[] }> {
  // No-op, logic moved to challengeService
  return { questsUpdated: 0, questsCompleted: [] };
}

/**
 * Claim completed quest rewards.
 */
export async function claimQuestRewardAction(
  userId: string,
  questId: string, // actually challengeId
): Promise<{ success: boolean; xp: number; gold: number; bonus?: string }> {
  try {
    const uc = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId: questId } },
      include: { challenge: true }
    });

    if (!uc || !uc.completed || uc.claimed) {
      return { success: false, xp: 0, gold: 0 };
    }

    const rewards = uc.challenge.rewards as any;
    const xp = rewards.xp || 0;
    const gold = rewards.gold || 0;

    // 1. Award
    const { ProgressionService } = await import("@/services/progression");
    if (xp > 0) await ProgressionService.addExperience(userId, xp);
    if (gold > 0) await ProgressionService.awardGold(userId, gold);

    // 2. Mark Claimed
    await prisma.userChallenge.update({
      where: { userId_challengeId: { userId, challengeId: questId } },
      data: { claimed: true }
    });

    revalidatePath("/daily-quests");
    return {
      success: true,
      xp,
      gold,
    };
  } catch (error) {
    console.error("Error claiming quest:", error);
    return { success: false, xp: 0, gold: 0 };
  }
}

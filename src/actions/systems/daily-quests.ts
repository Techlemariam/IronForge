"use server";

// import { prisma } from "@/lib/prisma";
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

const QUEST_TEMPLATES: Array<
  Omit<DailyQuest, "id" | "current" | "expiresAt" | "isCompleted" | "isClaimed">
> = [
    // Easy
    {
      type: "WORKOUT",
      difficulty: "EASY",
      title: "First Steps",
      description: "Complete any workout",
      target: 1,
      xpReward: 100,
      goldReward: 50,
    },
    {
      type: "VOLUME",
      difficulty: "EASY",
      title: "Warm Up",
      description: "Log 10 sets",
      target: 10,
      xpReward: 100,
      goldReward: 50,
    },
    {
      type: "CARDIO",
      difficulty: "EASY",
      title: "Heart Starter",
      description: "Complete 15 min cardio",
      target: 15,
      xpReward: 100,
      goldReward: 50,
    },

    // Medium
    {
      type: "WORKOUT",
      difficulty: "MEDIUM",
      title: "Dedicated",
      description: "Complete 2 workouts",
      target: 2,
      xpReward: 250,
      goldReward: 100,
    },
    {
      type: "VOLUME",
      difficulty: "MEDIUM",
      title: "Volume Builder",
      description: "Log 5000kg total volume",
      target: 5000,
      xpReward: 250,
      goldReward: 100,
    },
    {
      type: "STREAK",
      difficulty: "MEDIUM",
      title: "Consistent",
      description: "Maintain your streak",
      target: 1,
      xpReward: 200,
      goldReward: 80,
    },
    {
      type: "COMBO",
      difficulty: "MEDIUM",
      title: "Combo Master",
      description: "Execute 3 combat combos",
      target: 3,
      xpReward: 300,
      goldReward: 120,
    },

    // Hard
    {
      type: "PR",
      difficulty: "HARD",
      title: "Record Breaker",
      description: "Set a new PR",
      target: 1,
      xpReward: 500,
      goldReward: 200,
      bonusReward: "Rare Crate",
    },
    {
      type: "VOLUME",
      difficulty: "HARD",
      title: "Beast Mode",
      description: "Log 15000kg total volume",
      target: 15000,
      xpReward: 500,
      goldReward: 200,
    },
    {
      type: "SOCIAL",
      difficulty: "HARD",
      title: "Team Player",
      description: "Complete guild quest contribution",
      target: 1,
      xpReward: 400,
      goldReward: 150,
    },

    // Legendary
    {
      type: "WORKOUT",
      difficulty: "LEGENDARY",
      title: "Iron Will",
      description: "Complete 3 workouts today",
      target: 3,
      xpReward: 1000,
      goldReward: 500,
      bonusReward: "Legendary Crate",
    },
  ];

const _DIFFICULTY_MULTIPLIERS: Record<QuestDifficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  LEGENDARY: 5,
};

/**
 * Generate daily quests for a user.
 */
export async function generateDailyQuestsAction(
  userId: string,
): Promise<DailyQuest[]> {
  try {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Select 3 quests: 1 easy, 1 medium, 1 hard/legendary
    const easyQuests = QUEST_TEMPLATES.filter((q) => q.difficulty === "EASY");
    const mediumQuests = QUEST_TEMPLATES.filter(
      (q) => q.difficulty === "MEDIUM",
    );
    const hardQuests = QUEST_TEMPLATES.filter(
      (q) => q.difficulty === "HARD" || q.difficulty === "LEGENDARY",
    );

    const selectedQuests = [
      easyQuests[Math.floor(Math.random() * easyQuests.length)],
      mediumQuests[Math.floor(Math.random() * mediumQuests.length)],
      hardQuests[Math.floor(Math.random() * hardQuests.length)],
    ];

    return selectedQuests.map((template, i) => ({
      ...template,
      id: `quest-${userId}-${now.toISOString().split("T")[0]}-${i}`,
      current: 0,
      expiresAt: endOfDay,
      isCompleted: false,
      isClaimed: false,
    }));
  } catch (error) {
    console.error("Error generating daily quests:", error);
    return [];
  }
}

/**
 * Get user's current daily quests.
 */
export async function getDailyQuestsAction(
  userId: string,
): Promise<DailyQuest[]> {
  // In production, check if quests exist for today, else generate new ones
  return generateDailyQuestsAction(userId);
}

/**
 * Update quest progress.
 */
export async function updateQuestProgressAction(
  _userId: string,
  questType: QuestType,
  amount: number,
): Promise<{ questsUpdated: number; questsCompleted: string[] }> {
  try {
    // In production, update quest progress in database
    console.log(`Quest progress: ${questType} +${amount}`);

    return {
      questsUpdated: 1,
      questsCompleted: [],
    };
  } catch (error) {
    console.error("Error updating quest progress:", error);
    return { questsUpdated: 0, questsCompleted: [] };
  }
}

/**
 * Claim completed quest rewards.
 */
export async function claimQuestRewardAction(
  _userId: string,
  questId: string,
): Promise<{ success: boolean; xp: number; gold: number; bonus?: string }> {
  try {
    // In production, validate quest is complete and not claimed
    const quest = QUEST_TEMPLATES[0]; // Placeholder

    console.log(`Claimed quest: ${questId}`);
    revalidatePath("/daily-quests");

    return {
      success: true,
      xp: quest.xpReward,
      gold: quest.goldReward,
      bonus: quest.bonusReward,
    };
  } catch (error) {
    console.error("Error claiming quest:", error);
    return { success: false, xp: 0, gold: 0 };
  }
}

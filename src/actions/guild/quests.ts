"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type QuestType =
  | "TOTAL_WORKOUTS"
  | "TOTAL_VOLUME"
  | "BOSS_KILLS"
  | "COMBINED_STREAK";

interface GuildQuest {
  id: string;
  guildId: string;
  name: string;
  description: string;
  type: QuestType;
  targetValue: number;
  currentProgress: number;
  startDate: Date;
  endDate: Date;
  rewardXp: number;
  rewardGold: number;
  isCompleted: boolean;
  contributors: { userId: string; contribution: number }[];
}

const QUEST_TEMPLATES = [
  {
    type: "TOTAL_WORKOUTS" as QuestType,
    name: "Iron Brotherhood",
    description: "Complete {target} workouts as a guild",
    targets: [50, 100, 200],
    xpPerTarget: 500,
    goldPerTarget: 200,
  },
  {
    type: "TOTAL_VOLUME" as QuestType,
    name: "Mountain of Iron",
    description: "Lift {target}kg total as a guild",
    targets: [100000, 500000, 1000000],
    xpPerTarget: 1000,
    goldPerTarget: 400,
  },
  {
    type: "BOSS_KILLS" as QuestType,
    name: "Raid Night",
    description: "Defeat {target} bosses as a guild",
    targets: [10, 25, 50],
    xpPerTarget: 750,
    goldPerTarget: 300,
  },
  {
    type: "COMBINED_STREAK" as QuestType,
    name: "Eternal Flame",
    description: "Maintain {target} combined streak days",
    targets: [100, 250, 500],
    xpPerTarget: 600,
    goldPerTarget: 250,
  },
];

/**
 * Generate weekly guild quests.
 */
export async function generateGuildQuestsAction(
  guildId: string,
): Promise<GuildQuest[]> {
  try {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Select 2 random quest types
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2);

    const quests: GuildQuest[] = selected.map((template, index) => ({
      id: `quest-${guildId}-${now.getTime()}-${index}`,
      guildId,
      name: template.name,
      description: template.description.replace(
        "{target}",
        template.targets[0].toString(),
      ),
      type: template.type,
      targetValue: template.targets[0],
      currentProgress: 0,
      startDate: now,
      endDate: weekEnd,
      rewardXp: template.xpPerTarget,
      rewardGold: template.goldPerTarget,
      isCompleted: false,
      contributors: [],
    }));

    return quests;
  } catch (error) {
    console.error("Error generating guild quests:", error);
    return [];
  }
}

/**
 * Update quest progress when member completes activity.
 */
export async function updateQuestProgressAction(
  guildId: string,
  questId: string,
  userId: string,
  contribution: number,
): Promise<{ success: boolean; questCompleted: boolean }> {
  try {
    // In production, this would update the database
    // For MVP, we'll return a simulated response
    console.log(
      `Quest progress: guild=${guildId}, quest=${questId}, user=${userId}, +${contribution}`,
    );

    revalidatePath("/guild");
    return { success: true, questCompleted: false };
  } catch (error) {
    console.error("Error updating quest progress:", error);
    return { success: false, questCompleted: false };
  }
}

/**
 * Get active quests for a guild.
 */
export async function getGuildQuestsAction(
  guildId: string,
): Promise<GuildQuest[]> {
  try {
    // In production, fetch from database
    // For MVP, return sample quests
    return generateGuildQuestsAction(guildId);
  } catch (error) {
    console.error("Error fetching guild quests:", error);
    return [];
  }
}

/**
 * Claim quest rewards for all guild members.
 */
export async function claimQuestRewardsAction(
  guildId: string,
  questId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Get all guild members
    const members = await prisma.user.findMany({
      where: { guildId },
      select: { id: true },
    });

    // Award XP and gold to each member
    // In production, this would be based on contribution
    for (const member of members) {
      await prisma.titan.updateMany({
        where: { userId: member.id },
        data: { xp: { increment: 100 } },
      });
    }

    revalidatePath("/guild");
    return {
      success: true,
      message: `Rewards distributed to ${members.length} members!`,
    };
  } catch (error) {
    console.error("Error claiming quest rewards:", error);
    return { success: false, message: "Failed to claim rewards" };
  }
}

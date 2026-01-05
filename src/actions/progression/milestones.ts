"use server";

import { revalidatePath } from "next/cache";

type MilestoneType =
  | "LEVEL"
  | "WORKOUT"
  | "VOLUME"
  | "PR"
  | "STREAK"
  | "DUNGEON";

interface Milestone {
  id: string;
  type: MilestoneType;
  name: string;
  description: string;
  requirement: number;
  rewards: MilestoneReward[];
  isCompleted: boolean;
  completedAt?: Date;
  isClaimed: boolean;
}

interface MilestoneReward {
  type: "XP" | "GOLD" | "CRATE" | "COSMETIC" | "SKILL_POINT" | "TITLE";
  name: string;
  value: number | string;
}

const MILESTONES: Milestone[] = [
  // Level milestones
  {
    id: "level-5",
    type: "LEVEL",
    name: "Getting Started",
    description: "Reach level 5",
    requirement: 5,
    rewards: [
      { type: "GOLD", name: "100 Gold", value: 100 },
      { type: "CRATE", name: "Common Crate", value: 1 },
    ],
    isCompleted: true,
    isClaimed: true,
  },
  {
    id: "level-10",
    type: "LEVEL",
    name: "Rising Power",
    description: "Reach level 10",
    requirement: 10,
    rewards: [
      { type: "GOLD", name: "250 Gold", value: 250 },
      { type: "XP", name: "500 XP", value: 500 },
    ],
    isCompleted: true,
    isClaimed: true,
  },
  {
    id: "level-25",
    type: "LEVEL",
    name: "Seasoned Warrior",
    description: "Reach level 25",
    requirement: 25,
    rewards: [
      { type: "CRATE", name: "Rare Crate", value: 1 },
      { type: "TITLE", name: "Seasoned", value: "Seasoned" },
    ],
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: "level-50",
    type: "LEVEL",
    name: "Iron Veteran",
    description: "Reach level 50",
    requirement: 50,
    rewards: [
      { type: "CRATE", name: "Epic Crate", value: 1 },
      { type: "SKILL_POINT", name: "5 Skill Points", value: 5 },
      { type: "TITLE", name: "Veteran", value: "Veteran" },
    ],
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: "level-100",
    type: "LEVEL",
    name: "Living Legend",
    description: "Reach level 100",
    requirement: 100,
    rewards: [
      { type: "CRATE", name: "Legendary Crate", value: 1 },
      { type: "COSMETIC", name: "Golden Aura", value: "aura-gold" },
      { type: "TITLE", name: "Legend", value: "Legend" },
    ],
    isCompleted: false,
    isClaimed: false,
  },

  // Workout milestones
  {
    id: "workout-10",
    type: "WORKOUT",
    name: "Consistent",
    description: "Complete 10 workouts",
    requirement: 10,
    rewards: [{ type: "XP", name: "200 XP", value: 200 }],
    isCompleted: true,
    isClaimed: true,
  },
  {
    id: "workout-100",
    type: "WORKOUT",
    name: "Dedicated",
    description: "Complete 100 workouts",
    requirement: 100,
    rewards: [
      { type: "CRATE", name: "Rare Crate", value: 1 },
      { type: "TITLE", name: "Devoted", value: "Devoted" },
    ],
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: "workout-365",
    type: "WORKOUT",
    name: "Iron Will",
    description: "Complete 365 workouts",
    requirement: 365,
    rewards: [
      { type: "CRATE", name: "Legendary Crate", value: 1 },
      { type: "COSMETIC", name: "Iron Crown", value: "crown-iron" },
    ],
    isCompleted: false,
    isClaimed: false,
  },

  // PR milestones
  {
    id: "pr-10",
    type: "PR",
    name: "Record Setter",
    description: "Set 10 PRs",
    requirement: 10,
    rewards: [{ type: "GOLD", name: "500 Gold", value: 500 }],
    isCompleted: true,
    isClaimed: true,
  },
  {
    id: "pr-50",
    type: "PR",
    name: "Record Breaker",
    description: "Set 50 PRs",
    requirement: 50,
    rewards: [{ type: "CRATE", name: "Epic Crate", value: 1 }],
    isCompleted: false,
    isClaimed: false,
  },

  // Streak milestones
  {
    id: "streak-7",
    type: "STREAK",
    name: "Week Warrior",
    description: "Maintain 7-day streak",
    requirement: 7,
    rewards: [{ type: "XP", name: "300 XP", value: 300 }],
    isCompleted: true,
    isClaimed: true,
  },
  {
    id: "streak-30",
    type: "STREAK",
    name: "Month Monster",
    description: "Maintain 30-day streak",
    requirement: 30,
    rewards: [
      { type: "CRATE", name: "Epic Crate", value: 1 },
      { type: "TITLE", name: "Unstoppable", value: "Unstoppable" },
    ],
    isCompleted: false,
    isClaimed: false,
  },
];

/**
 * Get user's milestones.
 */
export async function getMilestonesAction(
  _userId: string,
): Promise<Milestone[]> {
  return MILESTONES;
}

/**
 * Get unclaimed milestones.
 */
export async function getUnclaimedMilestonesAction(
  _userId: string,
): Promise<Milestone[]> {
  return MILESTONES.filter((m) => m.isCompleted && !m.isClaimed);
}

/**
 * Claim milestone reward.
 */
export async function claimMilestoneAction(
  userId: string,
  milestoneId: string,
): Promise<{ success: boolean; rewards: MilestoneReward[] }> {
  const milestone = MILESTONES.find((m) => m.id === milestoneId);
  if (!milestone || !milestone.isCompleted || milestone.isClaimed) {
    return { success: false, rewards: [] };
  }

  console.log(`Claimed milestone: ${milestone.name}`);
  revalidatePath("/milestones");
  return { success: true, rewards: milestone.rewards };
}

/**
 * Check for newly completed milestones.
 */
export async function checkMilestoneCompletionAction(
  _userId: string,
  stats: { level: number; workouts: number; prs: number; streak: number },
): Promise<Milestone[]> {
  const newlyCompleted: Milestone[] = [];

  for (const milestone of MILESTONES) {
    if (milestone.isCompleted) continue;

    let completed = false;
    switch (milestone.type) {
      case "LEVEL":
        completed = stats.level >= milestone.requirement;
        break;
      case "WORKOUT":
        completed = stats.workouts >= milestone.requirement;
        break;
      case "PR":
        completed = stats.prs >= milestone.requirement;
        break;
      case "STREAK":
        completed = stats.streak >= milestone.requirement;
        break;
    }

    if (completed) newlyCompleted.push(milestone);
  }

  return newlyCompleted;
}

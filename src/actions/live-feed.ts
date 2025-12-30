"use server";

import { prisma } from "@/lib/prisma";

type ActivityType =
  | "WORKOUT"
  | "PR"
  | "LEVEL_UP"
  | "ACHIEVEMENT"
  | "CHALLENGE"
  | "GUILD"
  | "STREAK";

interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  heroName: string;
  avatarUrl?: string;
  content: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  likes: number;
  hasLiked: boolean;
  comments: number;
}

interface LiveFeedData {
  activities: ActivityItem[];
  hasMore: boolean;
  lastUpdate: Date;
}

/**
 * Get live activity feed.
 */
export async function getLiveActivityFeedAction(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<LiveFeedData> {
  // MVP: Return sample activity feed
  const activities: ActivityItem[] = [
    {
      id: "a1",
      type: "PR",
      userId: "f1",
      heroName: "IronGiant",
      content: "set a new PR: Bench Press 120kg x 5",
      details: { exercise: "Bench Press", weight: 120, reps: 5 },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      likes: 12,
      hasLiked: false,
      comments: 3,
    },
    {
      id: "a2",
      type: "LEVEL_UP",
      userId: "f2",
      heroName: "StormBreaker",
      content: "reached Level 39!",
      details: { newLevel: 39 },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      likes: 8,
      hasLiked: true,
      comments: 2,
    },
    {
      id: "a3",
      type: "WORKOUT",
      userId: "f3",
      heroName: "MightLord",
      content: "completed Push Day - 24 sets, 15,500kg volume",
      details: { sets: 24, volume: 15500 },
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      likes: 5,
      hasLiked: false,
      comments: 1,
    },
    {
      id: "a4",
      type: "ACHIEVEMENT",
      userId: "f1",
      heroName: "IronGiant",
      content: 'unlocked "Century Club" (100kg bench)',
      details: { achievement: "Century Club" },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      hasLiked: true,
      comments: 7,
    },
    {
      id: "a5",
      type: "STREAK",
      userId: "f2",
      heroName: "StormBreaker",
      content: "is on a 14-day streak! 🔥",
      details: { streakDays: 14 },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 15,
      hasLiked: false,
      comments: 4,
    },
  ];

  return {
    activities,
    hasMore: false,
    lastUpdate: new Date(),
  };
}

/**
 * Like an activity.
 */
export async function likeActivityAction(
  userId: string,
  activityId: string,
): Promise<{ success: boolean; newLikes: number }> {
  console.log(`User ${userId} liked activity ${activityId}`);
  return { success: true, newLikes: 13 };
}

/**
 * Unlike an activity.
 */
export async function unlikeActivityAction(
  userId: string,
  activityId: string,
): Promise<{ success: boolean; newLikes: number }> {
  console.log(`User ${userId} unliked activity ${activityId}`);
  return { success: true, newLikes: 11 };
}

/**
 * Post a comment on activity.
 */
export async function commentOnActivityAction(
  userId: string,
  activityId: string,
  content: string,
): Promise<{ success: boolean; commentId?: string }> {
  console.log(`User ${userId} commented on ${activityId}: ${content}`);
  return { success: true, commentId: `comment-${Date.now()}` };
}

/**
 * Get polling interval for live updates.
 */
export function getLiveFeedPollingInterval(): number {
  return 30000; // 30 seconds
}

"use server";

// import { prisma } from "@/lib/prisma";

interface FeedItem {
  id: string;
  type: "WORKOUT" | "ACHIEVEMENT" | "PR" | "LEVEL_UP" | "STREAK";
  userId: string;
  userHeroName: string;
  userAvatar?: string;
  timestamp: Date;
  content: {
    title: string;
    description: string;
    stats?: Record<string, string | number>;
    imageUrl?: string;
  };
  reactions: {
    likes: number;
    comments: number;
    hasLiked: boolean;
  };
}

/**
 * Get social feed for user.
 */
export async function getSocialFeedAction(
  userId: string,
  _limit: number = 20,
  _offset: number = 0,
): Promise<FeedItem[]> {
  try {
    // MVP: Return sample feed
    return [
      {
        id: "feed-1",
        type: "WORKOUT",
        userId: "friend-1",
        userHeroName: "IronWarrior",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        content: {
          title: "Completed Push Day",
          description: "Crushed a great chest and shoulder workout!",
          stats: { exercises: 6, sets: 24, volume: "12,500kg" },
        },
        reactions: { likes: 12, comments: 3, hasLiked: false },
      },
      {
        id: "feed-2",
        type: "PR",
        userId: "friend-2",
        userHeroName: "SteelTitan",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        content: {
          title: "New Bench Press PR! 💪",
          description: "Finally hit 140kg!",
          stats: { previous: "135kg", new: "140kg", improvement: "+3.7%" },
        },
        reactions: { likes: 45, comments: 12, hasLiked: true },
      },
      {
        id: "feed-3",
        type: "ACHIEVEMENT",
        userId: "friend-3",
        userHeroName: "LiftLegend",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        content: {
          title: "Achievement Unlocked: Century Club",
          description: "Completed 100 workouts! 🎉",
        },
        reactions: { likes: 89, comments: 21, hasLiked: false },
      },
      {
        id: "feed-4",
        type: "STREAK",
        userId: "friend-4",
        userHeroName: "DailyGrinder",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        content: {
          title: "🔥 30-Day Streak!",
          description: "One month of consistency. Let's keep going!",
        },
        reactions: { likes: 156, comments: 34, hasLiked: true },
      },
      {
        id: "feed-5",
        type: "LEVEL_UP",
        userId: "friend-1",
        userHeroName: "IronWarrior",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        content: {
          title: "Level 25 Reached! ⬆️",
          description: "Unlocked new skill tree abilities.",
          stats: { newSkills: 2 },
        },
        reactions: { likes: 34, comments: 8, hasLiked: false },
      },
    ];
  } catch (error) {
    console.error("Error getting social feed:", error);
    return [];
  }
}

/**
 * Like a feed item.
 */
export async function likeFeedItemAction(
  userId: string,
  feedItemId: string,
): Promise<{ success: boolean; newCount: number }> {
  try {
    console.log(`User ${userId} liked feed item ${feedItemId}`);
    return { success: true, newCount: 14 }; // Mock
  } catch (error) {
    console.error("Error liking feed item:", error);
    return { success: false, newCount: 0 };
  }
}

/**
 * Unlike a feed item.
 */
export async function unlikeFeedItemAction(
  userId: string,
  feedItemId: string,
): Promise<{ success: boolean; newCount: number }> {
  try {
    console.log(`User ${userId} unliked feed item ${feedItemId}`);
    return { success: true, newCount: 12 };
  } catch (error) {
    console.error("Error unliking feed item:", error);
    return { success: false, newCount: 0 };
  }
}

/**
 * Comment on a feed item.
 */
export async function commentOnFeedItemAction(
  userId: string,
  feedItemId: string,
  comment: string,
): Promise<{ success: boolean; commentId?: string }> {
  try {
    if (comment.length > 500) {
      return { success: false };
    }

    console.log(`Comment on ${feedItemId}: ${comment}`);
    return { success: true, commentId: `comment-${Date.now()}` };
  } catch (error) {
    console.error("Error commenting:", error);
    return { success: false };
  }
}

/**
 * Share workout to feed.
 */
export async function shareWorkoutToFeedAction(
  userId: string,
  workoutId: string,
  message?: string,
): Promise<{ success: boolean; feedItemId?: string }> {
  try {
    console.log(`User ${userId} shared workout ${workoutId} with message: ${message}`);
    return { success: true, feedItemId: `feed-${Date.now()}` };
  } catch (error) {
    console.error("Error sharing workout:", error);
    return { success: false };
  }
}

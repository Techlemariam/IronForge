"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type FriendStatus = "PENDING" | "ACCEPTED" | "BLOCKED";

interface Friend {
  id: string;
  heroName: string;
  level: number;
  avatarUrl?: string;
  isOnline: boolean;
  lastActive: Date;
  titanClass?: string;
  friendSince: Date;
}

interface FriendRequest {
  id: string;
  fromUser: { id: string; heroName: string; level: number };
  toUserId: string;
  status: FriendStatus;
  createdAt: Date;
}

/**
 * Send friend request.
 */
export async function sendFriendRequestAction(
  fromUserId: string,
  toHeroName: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate target exists
    const targetUser = await prisma.user.findFirst({
      where: { heroName: toHeroName },
    });

    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    if (targetUser.id === fromUserId) {
      return { success: false, message: "Cannot add yourself" };
    }

    console.log(`Friend request sent from ${fromUserId} to ${targetUser.id}`);
    revalidatePath("/friends");
    return { success: true, message: "Friend request sent!" };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, message: "Failed to send request" };
  }
}

/**
 * Accept friend request.
 */
export async function acceptFriendRequestAction(
  userId: string,
  requestId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Accepted friend request ${requestId}`);
    revalidatePath("/friends");
    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { success: false };
  }
}

/**
 * Decline friend request.
 */
export async function declineFriendRequestAction(
  userId: string,
  requestId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Declined friend request ${requestId}`);
    revalidatePath("/friends");
    return { success: true };
  } catch (error) {
    console.error("Error declining friend request:", error);
    return { success: false };
  }
}

/**
 * Remove friend.
 */
export async function removeFriendAction(
  userId: string,
  friendId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Removed friend ${friendId}`);
    revalidatePath("/friends");
    return { success: true };
  } catch (error) {
    console.error("Error removing friend:", error);
    return { success: false };
  }
}

/**
 * Get user's friends list.
 */
export async function getFriendsListAction(userId: string): Promise<Friend[]> {
  // MVP: Return sample friends
  return [
    {
      id: "f1",
      heroName: "IronGiant",
      level: 42,
      isOnline: true,
      lastActive: new Date(),
      titanClass: "Warrior",
      friendSince: new Date("2024-06-01"),
    },
    {
      id: "f2",
      heroName: "StormBreaker",
      level: 38,
      isOnline: false,
      lastActive: new Date(Date.now() - 3600000),
      titanClass: "Mage",
      friendSince: new Date("2024-08-15"),
    },
    {
      id: "f3",
      heroName: "MightLord",
      level: 55,
      isOnline: true,
      lastActive: new Date(),
      titanClass: "Tank",
      friendSince: new Date("2024-03-20"),
    },
  ];
}

/**
 * Get pending friend requests.
 */
export async function getPendingRequestsAction(
  userId: string,
): Promise<FriendRequest[]> {
  return [
    {
      id: "req1",
      fromUser: { id: "u1", heroName: "NewHero", level: 15 },
      toUserId: userId,
      status: "PENDING",
      createdAt: new Date(),
    },
  ];
}

/**
 * Search for users to add.
 */
export async function searchUsersAction(
  query: string,
): Promise<Array<{ id: string; heroName: string; level: number }>> {
  if (!query || query.length < 2) return [];

  return [
    { id: "search1", heroName: "IronFist", level: 30 },
    { id: "search2", heroName: "IronWill", level: 45 },
  ];
}

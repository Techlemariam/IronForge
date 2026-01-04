import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  followUser,
  unfollowUser,
  getLeaderboard,
  getSocialFeed,
  getFactionStatsAction,
} from "@/actions/social/core";
import prisma from "@/lib/prisma";

// Mocks
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    follow: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    exerciseLog: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock lib/leaderboard for getLeaderboard tests
vi.mock("@/lib/leaderboard", () => ({
  getLeaderboard: vi.fn(),
}));
import * as libLeaderboard from "@/lib/leaderboard";

describe("social actions", () => {
  const mockUser = { id: "user-123", heroName: "Hero" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("followUser", () => {
    it("should throw if unauthorized", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      await expect(followUser("target-456")).rejects.toThrow("Unauthorized");
    });

    it("should create follow record", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(mockUser);
      (prisma.follow.create as any).mockResolvedValue({});

      const result = await followUser("target-456");

      expect(prisma.follow.create).toHaveBeenCalledWith({
        data: { followerId: mockUser.id, followingId: "target-456" },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("unfollowUser", () => {
    it("should delete follow record", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(mockUser);
      (prisma.follow.delete as any).mockResolvedValue({});

      const result = await unfollowUser("target-456");

      expect(prisma.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: mockUser.id,
            followingId: "target-456",
          },
        },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("getLeaderboard", () => {
    it("GLOBAL: should return sorted users", async () => {
      const mockLeaderboard = [
        { userId: "u1", heroName: "Hero1", totalExperience: 100 },
        { userId: "u2", heroName: "Hero2", totalExperience: 50 },
      ];
      vi.spyOn(libLeaderboard, "getLeaderboard").mockResolvedValue(
        mockLeaderboard as any,
      );

      const result = await getLeaderboard("GLOBAL");
      expect(libLeaderboard.getLeaderboard).toHaveBeenCalledWith({
        scope: "GLOBAL",
        type: "XP",
        limit: 50,
      });
      expect(result).toEqual(mockLeaderboard);
    });

    it("FRIENDS: should return friends + self sorted", async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        ...mockUser,
        totalExperience: 50,
      });
      (prisma.follow.findMany as any).mockResolvedValue([
        { followingId: "f1" },
        { followingId: "f2" },
      ]);

      const mockFriendsLeaderboard = [
        { userId: "f1", heroName: "Friend1", totalExperience: 100 },
        { userId: "user-123", heroName: "Hero", totalExperience: 50 },
        { userId: "f2", heroName: "Friend2", totalExperience: 10 },
      ];
      vi.spyOn(libLeaderboard, "getLeaderboard").mockResolvedValue(
        mockFriendsLeaderboard as any,
      );

      const result = await getLeaderboard("FRIENDS");

      expect(result).toHaveLength(3);
      expect(result[0].userId).toBe("f1");
      expect(result[1].userId).toBe("user-123");
      expect(result[2].userId).toBe("f2");
    });
  });

  describe("getSocialFeed", () => {
    it("should return recent workouts from following", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(mockUser);
      (prisma.follow.findMany as any).mockResolvedValue([
        { followingId: "f1" },
      ]);

      const mockWorkouts = [
        {
          id: "w1",
          userId: "f1",
          date: new Date(),
          isEpic: true,
          user: { heroName: "Friend" },
        },
      ];
      (prisma.exerciseLog.findMany as any).mockResolvedValue(mockWorkouts);

      const result = await getSocialFeed();

      expect(prisma.exerciseLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: { in: ["f1", "user-123"] }, isPersonalRecord: true },
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("WORKOUT_PR");
    });
  });

  describe("getFactionStatsAction", () => {
    it("should aggregate faction stats correctly", async () => {
      const mockAggregation = [
        {
          faction: "ALLIANCE",
          _count: { id: 10 },
          _sum: { totalExperience: 1000 },
        },
        {
          faction: "HORDE",
          _count: { id: 20 },
          _sum: { totalExperience: 2000 },
        },
      ];

      // Mock prisma.user.groupBy
      (prisma.user.groupBy as any).mockResolvedValue(mockAggregation);

      const result = await getFactionStatsAction();

      expect(prisma.user.groupBy).toHaveBeenCalledWith({
        by: ["faction"],
        _count: { id: true },
        _sum: { totalExperience: true },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        alliance: { members: 10, totalXp: 1000 },
        horde: { members: 20, totalXp: 2000 },
      });
    });
  });
});

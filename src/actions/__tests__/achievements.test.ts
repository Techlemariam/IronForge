import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkAchievementsAction,
  getUnlockedAchievementsAction,
} from "../achievements";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    achievement: {
      upsert: vi.fn(),
    },
    userAchievement: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/data/achievements", () => ({
  ACHIEVEMENTS_DATA: [
    {
      code: "FIRST_WORKOUT",
      name: "First Steps",
      description: "Complete your first workout",
      icon: "🏋️",
      condition: { type: "count", metric: "workout", target: 1 },
    },
    {
      code: "GUILD_MEMBER",
      name: "Brotherhood",
      description: "Join a guild",
      icon: "🛡️",
      condition: { type: "boolean", metric: "guild" },
    },
    {
      code: "CARDIO_KING",
      name: "Cardio King",
      description: "Complete 10 cardio sessions",
      icon: "🏃",
      condition: { type: "count", metric: "cardio", target: 10 },
    },
  ],
}));

import { prisma } from "@/lib/prisma";

describe("Achievements Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAchievementsAction", () => {
    it("should return empty if user not found", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const result = await checkAchievementsAction("user-1");

      expect(result).toEqual([]);
    });

    it("should unlock workout achievement when count met", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        _count: { exerciseLogs: 1, cardioLogs: 0, unlockedMonsters: 0 },
        achievements: [],
        guildId: null,
        guild: null,
      });

      (prisma.achievement.upsert as any).mockResolvedValue({
        id: "ach-1",
        code: "FIRST_WORKOUT",
      });

      (prisma.userAchievement.create as any).mockResolvedValue({});

      const result = await checkAchievementsAction("user-1");

      expect(result).toHaveProperty("newUnlocks");
      expect(result.newUnlocks).toHaveLength(1);
      expect(result.newUnlocks[0].code).toBe("FIRST_WORKOUT");
    });

    it("should unlock guild achievement when in guild", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        _count: { exerciseLogs: 0, cardioLogs: 0, unlockedMonsters: 0 },
        achievements: [],
        guildId: "guild-1",
        guild: { id: "guild-1", name: "Test Guild" },
      });

      (prisma.achievement.upsert as any).mockResolvedValue({
        id: "ach-2",
        code: "GUILD_MEMBER",
      });

      (prisma.userAchievement.create as any).mockResolvedValue({});

      const result = await checkAchievementsAction("user-1");

      expect(result).toHaveProperty("newUnlocks");
      expect(
        result.newUnlocks.some((a: any) => a.code === "GUILD_MEMBER"),
      ).toBe(true);
    });

    it("should not unlock already unlocked achievements", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        _count: { exerciseLogs: 5, cardioLogs: 0, unlockedMonsters: 0 },
        achievements: [
          { achievementId: "ach-1", achievement: { code: "FIRST_WORKOUT" } },
        ],
        guildId: null,
        guild: null,
      });

      const result = await checkAchievementsAction("user-1");

      expect(result).toHaveProperty("newUnlocks");
      expect(result.newUnlocks).toHaveLength(0);
    });

    it("should not unlock if conditions not met", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        _count: { exerciseLogs: 0, cardioLogs: 5, unlockedMonsters: 0 },
        achievements: [],
        guildId: null,
        guild: null,
      });

      const result = await checkAchievementsAction("user-1");

      // Cardio needs 10, user has 5 - shouldn't unlock
      expect(result).toHaveProperty("newUnlocks");
      expect(
        result.newUnlocks.every((a: any) => a.code !== "CARDIO_KING"),
      ).toBe(true);
    });
  });

  describe("getUnlockedAchievementsAction", () => {
    it("should return all unlocked achievements for user", async () => {
      (prisma.userAchievement.findMany as any).mockResolvedValue([
        {
          achievement: {
            id: "ach-1",
            code: "FIRST_WORKOUT",
            name: "First Steps",
          },
        },
        {
          achievement: {
            id: "ach-2",
            code: "GUILD_MEMBER",
            name: "Brotherhood",
          },
        },
      ]);

      const result = await getUnlockedAchievementsAction("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe("FIRST_WORKOUT");
      expect(result[1].code).toBe("GUILD_MEMBER");
    });

    it("should return empty array if no achievements", async () => {
      (prisma.userAchievement.findMany as any).mockResolvedValue([]);

      const result = await getUnlockedAchievementsAction("user-1");

      expect(result).toEqual([]);
    });
  });
});

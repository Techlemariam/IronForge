import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  modifyTitanHealthAction,
  awardTitanXpAction,
  checkAndIncrementStreakAction,
} from "../titan";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    titan: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return {
    default: mockPrisma,
    prisma: mockPrisma,
  }
});

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Titan Server Actions", () => {
  const mockTitan = {
    id: "t1",
    userId: "u1",
    currentHp: 100,
    maxHp: 100,
    xp: 0,
    level: 1,
    energy: 100,
    mood: "NEUTRAL",
    isInjured: false,
    streak: 0,
    lastActive: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default User mock
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1",
      subscriptionTier: "FREE",
    });
  });

  describe("modifyTitanHealthAction", () => {
    it("should reduce HP and withstand death if HP > 0", async () => {
      (prisma.titan.findUnique as any).mockResolvedValue(mockTitan);
      (prisma.titan.update as any).mockResolvedValue({
        ...mockTitan,
        currentHp: 80,
      });

      const result = await modifyTitanHealthAction("u1", -20, "Test Damage");

      expect(result.success).toBe(true);
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({
          currentHp: 80,
          isInjured: false,
        }),
      });
    });

    it("should clamp HP to 0 and set isInjured if damage exceeds HP", async () => {
      (prisma.titan.findUnique as any).mockResolvedValue(mockTitan);
      (prisma.titan.update as any).mockResolvedValue({
        ...mockTitan,
        currentHp: 0,
        isInjured: true,
      });

      const result = await modifyTitanHealthAction("u1", -150, "Fatal Damage");

      expect(result.success).toBe(true);
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({
          currentHp: 0,
          isInjured: true,
          mood: "WEAKENED",
        }),
      });
    });
  });

  describe("awardTitanXpAction", () => {
    it("should award XP without leveling up", async () => {
      (prisma.titan.findUnique as any).mockResolvedValue(mockTitan);
      (prisma.titan.update as any).mockResolvedValue({ ...mockTitan, xp: 500 });

      const result = await awardTitanXpAction("u1", 500, "Quest");

      expect(result.success).toBe(true);
      expect(result.leveledUp).toBe(false);
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({ xp: 500, level: 1 }),
      });
    });

    it("should level up when XP crosses threshold", async () => {
      // Level 1 threshold is 1000 XP
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "u1",
        subscriptionTier: "FREE",
      });
      (prisma.titan.findUnique as any).mockResolvedValue({
        ...mockTitan,
        xp: 900,
      });
      (prisma.titan.update as any).mockResolvedValue({
        ...mockTitan,
        xp: 100,
        level: 2,
      });

      const result = await awardTitanXpAction("u1", 200, "Big Quest"); // 900 + 200 = 1100 -> Lvl 2 + 100 XP

      expect(result.success).toBe(true);
      expect(result.leveledUp).toBe(true);
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({
          xp: 100,
          level: 2,
          currentHp: 120, // 100 + (2*10)
          maxHp: 120,
        }),
      });
    });

    it("should apply XP multipliers (Streak + Mood + Sub + Decree)", async () => {
      // Mock User as PRO
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "u1",
        subscriptionTier: "PRO",
      });

      // Mock Titan with Streak=10 (+10%), Mood=FOCUSED (+10%), Decree=BUFF (+50%)
      // Base 1.0 + 0.1 + 0.1 + 0.2 + 0.5 = 1.9x
      const richTitan = {
        ...mockTitan,
        streak: 10,
        mood: "FOCUSED",
        dailyDecree: { type: "BUFF" },
      };
      (prisma.titan.findUnique as any).mockResolvedValue(richTitan);
      (prisma.titan.update as any).mockResolvedValue({ ...richTitan, xp: 190 });

      const result = await awardTitanXpAction("u1", 100, "Test");

      expect(result.success).toBe(true);
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({ xp: 190 }), // 0 + 100 * 1.9 = 190
      });
    });
  });
  describe("checkAndIncrementStreakAction", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should increment streak if last active was yesterday", async () => {
      // Mock Today: 2024-01-02
      vi.setSystemTime(new Date("2024-01-02T12:00:00Z"));

      (prisma.titan.findUnique as any).mockResolvedValue({
        ...mockTitan,
        streak: 5,
        lastActive: new Date("2024-01-01T10:00:00Z"), // Yesterday
      });

      const result = await checkAndIncrementStreakAction("u1", "UTC");

      expect(result.success).toBe(true);
      expect(result.streak).toBe(6);
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({ streak: 6 }),
      });
    });

    it("should reset streak if missed a day", async () => {
      // Mock Today: 2024-01-03
      vi.setSystemTime(new Date("2024-01-03T12:00:00Z"));

      (prisma.titan.findUnique as any).mockResolvedValue({
        ...mockTitan,
        streak: 5,
        lastActive: new Date("2024-01-01T10:00:00Z"), // 2 days ago
      });

      const result = await checkAndIncrementStreakAction("u1", "UTC");

      expect(result.success).toBe(true);
      expect(result.streak).toBe(1); // Reset to 1 (today)
      expect(prisma.titan.update).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: expect.objectContaining({ streak: 1 }),
      });
    });

    it("should do nothing if already active today", async () => {
      // Mock Today: 2024-01-02
      vi.setSystemTime(new Date("2024-01-02T18:00:00Z"));

      (prisma.titan.findUnique as any).mockResolvedValue({
        ...mockTitan,
        streak: 5,
        lastActive: new Date("2024-01-02T10:00:00Z"), // Same day
      });

      const result = await checkAndIncrementStreakAction("u1", "UTC");

      expect(result.success).toBe(true);
      expect(result.streak).toBe(5);
      expect(prisma.titan.update).not.toHaveBeenCalled();
    });
  });
});

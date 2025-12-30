import { describe, it, expect, vi, beforeEach } from "vitest";
import { logGauntletRunAction, getGauntletStatsAction } from "../gauntlet";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    gauntletRun: {
      create: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

describe("Gauntlet Server Actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("logGauntletRunAction", () => {
    it("should throw error if not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(
        logGauntletRunAction({
          wavesCleared: 5,
          totalDamage: 1000,
          duration: 300,
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("should log run and award rewards", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "test@test.com" } },
      });

      (prisma.gauntletRun.create as any).mockResolvedValue({
        id: "run-1",
        wavesCleared: 10,
        totalDamage: 5000,
      });

      (prisma.user.update as any).mockResolvedValue({
        id: "user-1",
        totalExperience: 200,
      });

      const result = await logGauntletRunAction({
        wavesCleared: 10,
        totalDamage: 5000,
        duration: 600,
      });

      expect(result.success).toBe(true);
      expect(result.runId).toBe("run-1");
      expect(result.rewards.xp).toBeGreaterThan(0);
      expect(result.rewards.gold).toBeGreaterThan(0);
      expect(result.rewards.kinetic).toBeGreaterThan(0);
    });

    it("should calculate wave multiplier correctly", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.gauntletRun.create as any).mockResolvedValue({ id: "run-1" });
      (prisma.user.update as any).mockResolvedValue({});

      // 15 waves = 1 + floor(15/5)*0.1 = 1.3 multiplier
      // XP = 15 * 10 * 1.3 = 195
      const result = await logGauntletRunAction({
        wavesCleared: 15,
        totalDamage: 3000,
        duration: 900,
      });

      expect(result.rewards.xp).toBe(195);
      expect(result.rewards.gold).toBe(97); // floor(15*5*1.3)
    });
  });

  describe("getGauntletStatsAction", () => {
    it("should return null if not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await getGauntletStatsAction();

      expect(result).toBeNull();
    });

    it("should return best run stats", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.gauntletRun.findFirst as any).mockResolvedValue({
        wavesCleared: 25,
        totalDamage: 10000,
      });

      (prisma.gauntletRun.count as any).mockResolvedValue(5);

      const result = await getGauntletStatsAction();

      expect(result).toEqual({
        bestWaves: 25,
        bestDamage: 10000,
        totalRuns: 5,
      });
    });

    it("should return zeros if no runs exist", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.gauntletRun.findFirst as any).mockResolvedValue(null);
      (prisma.gauntletRun.count as any).mockResolvedValue(0);

      const result = await getGauntletStatsAction();

      expect(result).toEqual({
        bestWaves: 0,
        bestDamage: 0,
        totalRuns: 0,
      });
    });
  });
});

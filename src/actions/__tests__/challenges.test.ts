import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActiveChallengesAction, claimChallengeAction } from "../challenges";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/prisma", () => {
  const mockPrismaClient = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    challenge: {
      count: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    userChallenge: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === 'function') {
        // @ts-ignore
        return callback(mockPrismaClient);
      }
      return Promise.resolve(callback); // For array input
    }),
    // Battle Pass mocks needed for addBattlePassXpAction
    battlePassSeason: { findFirst: vi.fn() },
    userBattlePass: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    battlePassTier: { findMany: vi.fn() },
  };

  return {
    default: mockPrismaClient,
    prisma: mockPrismaClient,
  };
});

// We need to access these mocks in tests, so we can re-import or expect on the module
// But since we need to set return values in tests, we rely on the fact that 
// importing '@/lib/prisma' returns the SAME mock object.


import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

describe("Challenges Server Actions", () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("getActiveChallengesAction", () => {
    it("should return active challenges with user progress", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { email: "test@example.com" } } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      (prisma.challenge.count as any).mockResolvedValue(2);
      (prisma.challenge.findMany as any).mockResolvedValue([
        {
          id: "challenge-1",
          code: "WEEKLY_VOL_1",
          title: "Heavy Lifter",
          type: "WEEKLY",
          criteria: { metric: "volume_kg", target: 10000 },
          rewards: { xp: 500, gold: 100, kinetic: 50 },
          endDate: new Date(Date.now() + 86400000),
        },
      ]);

      (prisma.userChallenge.findMany as any).mockResolvedValue([
        {
          challengeId: "challenge-1",
          progress: 5000,
          completed: false,
          claimed: false,
        },
      ]);

      const result = await getActiveChallengesAction();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Heavy Lifter");
      expect(result[0].userStatus.progress).toBe(5000);
    });

    it("should seed challenges if none exist", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { email: "test@example.com" } } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      // No challenges exist
      (prisma.challenge.count as any).mockResolvedValue(0);
      (prisma.challenge.upsert as any).mockResolvedValue({});
      (prisma.challenge.findMany as any).mockResolvedValue([]);
      (prisma.userChallenge.findMany as any).mockResolvedValue([]);

      await getActiveChallengesAction();

      expect(prisma.challenge.upsert).toHaveBeenCalled();
    });

    it("should throw error if not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      await expect(getActiveChallengesAction()).rejects.toThrow("Unauthorized");
    });
  });

  describe("claimChallengeAction", () => {
    it("should claim rewards for completed challenge", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { email: "test@example.com" } } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      (prisma.userChallenge.findUnique as any).mockResolvedValue({
        userId: "user-1",
        challengeId: "challenge-1",
        completed: true,
        claimed: false,
        challenge: {
          rewards: { xp: 500, gold: 100, kinetic: 50 },
        },
      });

      (prisma.$transaction as any).mockResolvedValue([
        { claimed: true },
        { gold: 200 },
      ]);

      const result = await claimChallengeAction("challenge-1");

      expect(result.success).toBe(true);
      expect(result.newGold).toBe(200);
    });

    it("should throw error if challenge not completed", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { email: "test@example.com" } } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      (prisma.userChallenge.findUnique as any).mockResolvedValue({
        userId: "user-1",
        challengeId: "challenge-1",
        completed: false,
        claimed: false,
        challenge: {},
      });

      await expect(claimChallengeAction("challenge-1")).rejects.toThrow(
        "Challenge not completed",
      );
    });

    it("should throw error if already claimed", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { email: "test@example.com" } } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      (prisma.userChallenge.findUnique as any).mockResolvedValue({
        userId: "user-1",
        challengeId: "challenge-1",
        completed: true,
        claimed: true,
        challenge: {},
      });

      await expect(claimChallengeAction("challenge-1")).rejects.toThrow(
        "Already claimed",
      );
    });
  });
});

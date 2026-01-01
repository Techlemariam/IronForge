import {
  createDuelChallengeAction,
  acceptDuelChallengeAction,
  updateCardioDuelProgressAction,
} from "../duel";
import { prisma } from "@/lib/prisma";
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from "@/utils/supabase/server";


// Mocks
vi.mock("@/lib/prisma", () => ({
  prisma: {
    duelChallenge: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mock Supabase
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Titan Duel Actions", () => {
  const mockUser = { id: "user-1", email: "titan@forge.com" };
  const targetId = "user-2";

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup Supabase Mock
    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("createDuelChallengeAction", () => {
    it("should create a challenge if no active duel exists", async () => {
      (prisma.duelChallenge.findFirst as any).mockResolvedValue(null);
      (prisma.duelChallenge.create as any).mockResolvedValue({
        id: "duel-123",
      });

      const result = await createDuelChallengeAction(targetId);

      expect(prisma.duelChallenge.findFirst).toHaveBeenCalled();
      expect(prisma.duelChallenge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          challengerId: mockUser.id,
          defenderId: targetId,
          status: "PENDING",
          duelType: "TITAN_VS_TITAN",
        }),
      });
      expect(result).toEqual({ success: true, duelId: "duel-123" });
    });

    it("should create a CARDIO challenge with valid options", async () => {
      (prisma.duelChallenge.findFirst as any).mockResolvedValue(null);
      (prisma.duelChallenge.create as any).mockResolvedValue({
        id: "cardio-duel-123",
      });

      const options = {
        duelType: "SPEED_DEMON",
        activityType: "CYCLING",
        targetDistance: 20,
      };

      const result = await createDuelChallengeAction(targetId, options as any);

      expect(prisma.duelChallenge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          duelType: "SPEED_DEMON",
          activityType: "CYCLING",
          targetDistance: 20,
        }),
      });
      expect(result.success).toBe(true);
    });

    it("should fail if trying to duel self", async () => {
      const result = await createDuelChallengeAction(mockUser.id);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot duel yourself");
    });

    it("should fail if duel already active", async () => {
      (prisma.duelChallenge.findFirst as any).mockResolvedValue({
        id: "existing",
      });
      const result = await createDuelChallengeAction(targetId);
      expect(result.success).toBe(false);
      expect(result.error).toContain("already active");
    });
  });

  describe("acceptDuelChallengeAction", () => {
    it("should activate duel if user is defender", async () => {
      (prisma.duelChallenge.findUnique as any).mockResolvedValue({
        id: "duel-123",
        defenderId: mockUser.id,
        status: "PENDING",
      });

      const result = await acceptDuelChallengeAction("duel-123");
      expect(prisma.duelChallenge.update).toHaveBeenCalledWith({
        where: { id: "duel-123" },
        data: expect.objectContaining({ status: "ACTIVE" }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCardioDuelProgressAction", () => {
    it("should update challenger distance", async () => {
      (prisma.duelChallenge.findUnique as any).mockResolvedValue({
        id: "duel-active",
        challengerId: mockUser.id,
        defenderId: "other",
        status: "ACTIVE",
      });

      const result = await updateCardioDuelProgressAction("duel-active", 5.5);

      expect(prisma.duelChallenge.update).toHaveBeenCalledWith({
        where: { id: "duel-active" },
        data: { challengerDistance: 5.5 },
      });
      expect(result.success).toBe(true);
    });

    it("should update defender distance", async () => {
      (prisma.duelChallenge.findUnique as any).mockResolvedValue({
        id: "duel-active",
        challengerId: "other",
        defenderId: mockUser.id,
        status: "ACTIVE",
      });

      const result = await updateCardioDuelProgressAction("duel-active", 3.2);

      expect(prisma.duelChallenge.update).toHaveBeenCalledWith({
        where: { id: "duel-active" },
        data: { defenderDistance: 3.2 },
      });
      expect(result.success).toBe(true);
    });

    it("should fail if not participant", async () => {
      (prisma.duelChallenge.findUnique as any).mockResolvedValue({
        id: "duel-active",
        challengerId: "other1",
        defenderId: "other2",
        status: "ACTIVE",
      });

      const result = await updateCardioDuelProgressAction("duel-active", 10);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Not participant");
    });
  });
});

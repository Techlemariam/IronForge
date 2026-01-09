import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProgressionService } from '@/services/progression';
import prisma from "@/lib/prisma";
import { calculateWilks } from "@/utils/wilks";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    exerciseLog: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    pvpProfile: {
      upsert: vi.fn(),
    },
  },
}));

describe("ProgressionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateWilksScore", () => {
    it("should calculate and update Wilks score correctly", async () => {
      // 1. Mock User (75kg Male)
      (prisma.user.findUnique as any).mockResolvedValue({ bodyWeight: 75.0 });

      // 2. Mock Lifts
      // We need logs that produce E1RMs of 100, 80, and 140 respectively.
      // Formula: e1rm = weight * (1 + reps/30)
      // Using reps=30 means factor is 2. So weight should be half the target E1RM.
      (prisma.exerciseLog.findMany as any)
        .mockResolvedValueOnce([{ sets: [{ weight: 50, reps: 30 }] }]) // Squat: 50 * 2 = 100
        .mockResolvedValueOnce([{ sets: [{ weight: 40, reps: 30 }] }]) // Bench: 40 * 2 = 80
        .mockResolvedValueOnce([{ sets: [{ weight: 70, reps: 30 }] }]); // Deadlift: 70 * 2 = 140

      // 3. Run
      const wilks = await ProgressionService.updateWilksScore("user-123");

      // 4. Verify Calculation
      // 320kg @ 75kg bw male ~ 228.57
      const expected = calculateWilks({
        weightLifted: 320,
        bodyWeight: 75.0,
        sex: "male",
      });
      expect(wilks).toBeCloseTo(expected, 1);

      // 5. Verify DB Update
      expect(prisma.pvpProfile.upsert).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        create: expect.objectContaining({ highestWilksScore: wilks }),
        update: expect.objectContaining({ highestWilksScore: wilks }),
      });
    });

    it("should handle zero lifts", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ bodyWeight: 75.0 });
      (prisma.exerciseLog.findMany as any).mockResolvedValue([]);

      const wilks = await ProgressionService.updateWilksScore("user-123");
      expect(wilks).toBe(0);
    });
  });

  describe("calculateMultiplier", () => {
    it("should return base multiplier for high level user", () => {
      const mult = ProgressionService.calculateMultiplier(
        0,
        "NEUTRAL",
        "FREE",
        "NEUTRAL",
        50
      );
      expect(mult).toBe(1.0);
    });

    it("should apply apprentice boost for levels <= 10", () => {
      // Level 1
      const mult1 = ProgressionService.calculateMultiplier(
        0,
        "NEUTRAL",
        "FREE",
        "NEUTRAL",
        1
      );
      expect(mult1).toBe(1.5);

      // Level 10
      const mult10 = ProgressionService.calculateMultiplier(
        0,
        "NEUTRAL",
        "FREE",
        "NEUTRAL",
        10
      );
      expect(mult10).toBe(1.5);

      // Level 11
      const mult11 = ProgressionService.calculateMultiplier(
        0,
        "NEUTRAL",
        "FREE",
        "NEUTRAL",
        11
      );
      expect(mult11).toBe(1.0);
    });

    it("should stack streaks and subscriptions", () => {
      // Level 1 (+0.5) + Streak 10 (+0.1) + PRO (+0.2) = 1.8
      // Note: Config values are now: Base 1.0 + Appr 0.5 + Streak 0.1 + Sub 0.2 = 1.8
      // If we had a max streak (30) it would be: 1.0 + 0.5 + 0.3 + 0.2 = 2.0
      const mult = ProgressionService.calculateMultiplier(
        10,
        "NEUTRAL",
        "PRO",
        "NEUTRAL",
        1
      );
      expect(mult).toBe(1.8);
    });

    it("should respect new streak cap and decree values", () => {
      // Base (1.0) + Streak 35 (Cap 0.3) + Decree (0.3) = 1.6
      const mult = ProgressionService.calculateMultiplier(
        35,
        "NEUTRAL",
        "FREE",
        "BUFF",
        20 // No apprentice boost
      );
      expect(mult).toBe(1.6);
    });
  });
});

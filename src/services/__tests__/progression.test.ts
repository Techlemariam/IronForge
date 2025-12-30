import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProgressionService } from "../progression";
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
});

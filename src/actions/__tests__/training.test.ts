import { describe, it, expect, vi, beforeEach } from "vitest";
import { logTitanSet, updateActivePathAction } from "../training";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Mock dependencies
const mockGetUser = vi.fn();
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    exerciseLog: {
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Training Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logTitanSet", () => {
    it("should log set and award rewards", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "test-user" } } });
      (prisma.exerciseLog.create as any).mockResolvedValue({});

      // Mock sequence:
      // 1. Update stats -> return { level: 1, totalExperience: 199 } (Just enough to trigger check)
      // 2. Update level -> return { level: 2 }
      (prisma.user.update as any)
        .mockResolvedValueOnce({
          id: "test-user",
          totalExperience: 199,
          level: 1,
          kineticEnergy: 20,
        })
        .mockResolvedValueOnce({
          id: "test-user",
          level: 2,
        });

      const result = await logTitanSet("ex-1", 10, 100, 8);

      expect(result.success).toBe(true);
      expect(result.xpGained).toBe(20); // 10 base + 10 reps
      expect(result.energyGained).toBe(20); // 10 reps * 2

      expect(prisma.exerciseLog.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("should return error if unauthorized", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const result = await logTitanSet("ex-1", 10, 100, 8);
      expect(result.success).toBe(false);
      expect(result.message).toBe("User not authenticated");
    });
  });

  describe("updateActivePathAction", () => {
    it("should update path successfully", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "test-user" } } });
      (prisma.user.update as any).mockResolvedValue({});

      const result = await updateActivePathAction("HYBRID_WARDEN");

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "test-user" },
        data: { activePath: "HYBRID_WARDEN" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("should return error if unauthorized", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const result = await updateActivePathAction("HYBRID_WARDEN");
      expect(result.success).toBe(false);
    });
  });
});

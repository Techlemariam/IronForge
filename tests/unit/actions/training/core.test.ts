import { describe, it, expect, vi, beforeEach } from "vitest";
import { logTitanSet, updateActivePathAction } from "@/actions/training/core";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Mock dependencies (Keep these as they are not global)
vi.mock("@/actions/systems/battle-pass", () => ({
  addBattlePassXpAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/services/challengeService", () => ({
  processWorkoutLog: vi.fn(),
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
      const mockSupabase = await createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({ data: { user: { id: "test-user" } } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "test-user-id", gold: 100 } as any);

      // Mock sequence for user.update
      vi.mocked(prisma.user.update)
        .mockResolvedValueOnce({
          id: "test-user",
          totalExperience: 199,
          level: 1,
          kineticEnergy: 20,
        } as any)
        .mockResolvedValueOnce({
          id: "test-user",
          level: 2,
        } as any);

      const result = await logTitanSet("ex-1", 10, 100, 8);

      expect(result.success).toBe(true);
      expect(result.xpGained).toBe(20); // 10 base + 10 reps
      expect(result.energyGained).toBe(20); // 10 reps * 2

      expect(prisma.exerciseLog.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("should return error if unauthorized", async () => {
      const mockSupabase = await createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({ data: { user: null } } as any);
      const result = await logTitanSet("ex-1", 10, 100, 8);
      expect(result.success).toBe(false);
      expect(result.message).toBe("User not authenticated");
    });
  });

  describe("updateActivePathAction", () => {
    it("should update path successfully", async () => {
      const mockSupabase = await createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({ data: { user: { id: "test-user" } } } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await updateActivePathAction("WARDEN");
      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "test-user" },
        data: { activePath: "WARDEN" },
      });
    });

    it("should fail if updateActivePathAction is called with WARDEN but DB fails", async () => {
      const mockSupabase = await createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({ data: { user: { id: "test-user" } } } as any);
      vi.mocked(prisma.user.update).mockRejectedValueOnce(new Error("DB Error"));
      const result = await updateActivePathAction("WARDEN");
      expect(result.success).toBe(false);
    });

    it("should return error if unauthorized", async () => {
      const mockSupabase = await createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({ data: { user: null } } as any);
      const result = await updateActivePathAction("WARDEN");
      expect(result.success).toBe(false);
    });
  });
});

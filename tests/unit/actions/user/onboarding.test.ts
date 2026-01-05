import { describe, it, expect, vi, beforeEach } from "vitest";
import { completeOnboardingAction } from "@/actions/user/onboarding";

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

vi.mock("@/services/progression", () => ({
  ProgressionService: {
    awardAchievement: vi.fn(),
    getProgressionState: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      update: vi.fn(),
    },
  },
}));

import { createClient } from "@/utils/supabase/server";
import { ProgressionService } from "@/services/progression";
import prisma from "@/lib/prisma";

describe("Onboarding Server Actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    (prisma.user.update as any).mockResolvedValue({});
  });

  describe("completeOnboardingAction", () => {
    it("should return error if not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await completeOnboardingAction();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Unauthorized");
    });

    it("should award achievement and return new state", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "test@test.com" } },
      });

      (ProgressionService.awardAchievement as any).mockResolvedValue({});
      (ProgressionService.getProgressionState as any).mockResolvedValue({
        level: 2,
        xp: 150,
        gold: 50,
      });

      // Ensure prisma mock returns a promise
      (prisma.user.update as any).mockResolvedValue({});

      const result = await completeOnboardingAction();

      expect(result.success).toBe(true);
      expect(ProgressionService.awardAchievement).toHaveBeenCalledWith(
        "user-1",
        "ONBOARDING_COMPLETED",
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { hasCompletedOnboarding: true },
      });
      expect(result.newState).toEqual({
        level: 2,
        xp: 150,
        gold: 50,
      });
    });

    it("should handle progression service errors gracefully", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (ProgressionService.awardAchievement as any).mockRejectedValue(
        new Error("DB Error"),
      );

      const result = await completeOnboardingAction();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to record completion");
    });
  });
});

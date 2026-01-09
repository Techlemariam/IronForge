import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateHevyApiKey,
  connectHevy,
  disconnectHevy,
  validateIntervalsCredentials,
  connectIntervals,
  disconnectIntervals,
} from "@/actions/integrations/core";
import * as libHevy from "@/lib/hevy";
import * as libIntervals from "@/lib/intervals";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Mock dependencies
vi.mock("@/lib/hevy", () => ({
  getHevyWorkouts: vi.fn(),
}));

vi.mock("@/lib/intervals", () => ({
  getAthleteSettings: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/actions/titan/power-rating", () => ({
  recalculatePowerRatingAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("Integration Actions", () => {
  const userId = "user-123";
  const apiKey = "test-api-key";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Hevy Integrations", () => {
    it("validateHevyApiKey should return valid true on success", async () => {
      vi.spyOn(libHevy, "getHevyWorkouts").mockResolvedValue({
        workouts: [],
        page_count: 0,
      });
      const result = await validateHevyApiKey(apiKey);
      expect(result).toEqual({ valid: true });
    });

    it("validateHevyApiKey should return error on failure", async () => {
      vi.spyOn(libHevy, "getHevyWorkouts").mockRejectedValue(
        new Error("Invalid key"),
      );
      const result = await validateHevyApiKey(apiKey);
      expect(result).toEqual({ valid: false, error: "Invalid key" });
    });

    it("connectHevy should update prisma on success", async () => {
      vi.spyOn(libHevy, "getHevyWorkouts").mockResolvedValue({
        workouts: [],
        page_count: 0,
      });
      (prisma.user.update as any).mockResolvedValue({});

      const result = await connectHevy(userId, apiKey);
      expect(result).toEqual({ success: true });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { hevyApiKey: apiKey },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("connectHevy should fail if validation fails", async () => {
      vi.spyOn(libHevy, "getHevyWorkouts").mockRejectedValue(
        new Error("Invalid key"),
      );
      const result = await connectHevy(userId, apiKey);
      expect(result).toEqual({ success: false, error: "Invalid key" });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("disconnectHevy should set key to null", async () => {
      (prisma.user.update as any).mockResolvedValue({});
      const result = await disconnectHevy(userId);
      expect(result).toEqual({ success: true });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { hevyApiKey: null },
      });
    });
  });

  describe("Intervals.icu Integrations", () => {
    const athleteId = "athlete-123";

    it("validateIntervalsCredentials should return valid on success", async () => {
      vi.spyOn(libIntervals, "getAthleteSettings").mockResolvedValue({
        name: "Test Athlete",
      } as any);
      const result = await validateIntervalsCredentials(apiKey, athleteId);
      expect(result).toEqual({
        valid: true,
        metadata: { name: "Test Athlete" },
      });
    });

    it("validateIntervalsCredentials should return error if no settings returned", async () => {
      vi.spyOn(libIntervals, "getAthleteSettings").mockResolvedValue(null);
      const result = await validateIntervalsCredentials(apiKey, athleteId);
      expect(result.valid).toBe(false);
    });

    it("connectIntervals should update prisma on success", async () => {
      vi.spyOn(libIntervals, "getAthleteSettings").mockResolvedValue({
        name: "Test Athlete",
      } as any);
      (prisma.user.update as any).mockResolvedValue({});

      const result = await connectIntervals(userId, apiKey, athleteId);
      expect(result).toEqual({ success: true });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { intervalsApiKey: apiKey, intervalsAthleteId: athleteId },
      });
    });

    it("disconnectIntervals should set fields to null", async () => {
      (prisma.user.update as any).mockResolvedValue({});
      const result = await disconnectIntervals(userId);
      expect(result).toEqual({ success: true });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { intervalsApiKey: null, intervalsAthleteId: null },
      });
    });
  });
});

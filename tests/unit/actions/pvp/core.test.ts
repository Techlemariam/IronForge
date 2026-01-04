import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSegmentBattleAction, resolveSegmentBattleAction } from "@/actions/pvp/segment";

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
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import axios from "axios";

describe("PvP Server Actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("createSegmentBattleAction", () => {
    it("should create a segment battle challenge", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      const result = await createSegmentBattleAction(
        "segment-123",
        "opponent-456",
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Challenge sent via carrier pigeon!");
    });

    it("should fail if not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await createSegmentBattleAction(
        "segment-123",
        "opponent-456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });

  describe("resolveSegmentBattleAction", () => {
    it("should resolve segment battle with activity data", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        stravaAccessToken: "valid-token",
      });

      // Mock upload check
      (axios.get as any).mockResolvedValueOnce({
        data: { status: "processed", activity_id: "activity-123" },
      });

      // Mock activity fetch with segment efforts
      (axios.get as any).mockResolvedValueOnce({
        data: {
          segment_efforts: [
            { name: "Sprint Hill", elapsed_time: 120 },
            { name: "Flat Section", elapsed_time: 60 },
          ],
        },
      });

      const result = await resolveSegmentBattleAction(12345);

      expect(result.success).toBe(true);
      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].name).toBe("Sprint Hill");
    });

    it("should fail if no Strava token", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        stravaAccessToken: null,
      });

      const result = await resolveSegmentBattleAction(12345);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No Strava Token");
    });

    it("should handle upload not yet processed", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        stravaAccessToken: "valid-token",
      });

      (axios.get as any).mockResolvedValueOnce({
        data: { status: "pending", activity_id: null },
      });

      const result = await resolveSegmentBattleAction(12345);

      expect(result.success).toBe(false);
      expect(result.status).toBe("pending");
    });

    it("should fail if not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await resolveSegmentBattleAction(12345);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });
});

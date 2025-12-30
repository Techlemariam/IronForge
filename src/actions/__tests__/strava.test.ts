import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getStravaAuthUrlAction,
  exchangeStravaTokenAction,
  syncStravaActivitiesAction,
  disconnectStravaAction,
} from "../strava";
import prisma from "@/lib/prisma";
import axios from "axios";
import { createClient } from "@/utils/supabase/server";

// Mock Dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    cardioLog: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("axios");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: (key: string) => (key === "host" ? "localhost:3000" : null),
    }),
  ),
}));

describe("Strava Server Actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });
    vi.stubEnv("STRAVA_CLIENT_ID", "mock-client-id");
    vi.stubEnv("STRAVA_CLIENT_SECRET", "mock-client-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getStravaAuthUrlAction", () => {
    it("should generate a valid auth URL", async () => {
      const url = await getStravaAuthUrlAction();
      expect(url).toContain("https://www.strava.com/oauth/authorize");
      expect(url).toContain("client_id=mock-client-id");
      expect(url).toContain(
        "redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fsettings",
      );
      expect(url).toContain("scope=read,activity:read_all");
    });
  });

  describe("exchangeStravaTokenAction", () => {
    it("should exchange code for tokens and update user", async () => {
      const mockTokenResponse = {
        data: {
          access_token: "access-123",
          refresh_token: "refresh-123",
          expires_at: 1234567890,
          athlete: { id: 99999 },
        },
      };
      (axios.post as any).mockResolvedValue(mockTokenResponse);

      const result = await exchangeStravaTokenAction("valid-code");

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        "https://www.strava.com/oauth/token",
        expect.objectContaining({
          code: "valid-code",
          grant_type: "authorization_code",
        }),
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "test-user-id" },
        data: expect.objectContaining({
          stravaAccessToken: "access-123",
          stravaAthleteId: "99999",
        }),
      });
    });

    it("should handle unauthorized user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const result = await exchangeStravaTokenAction("code");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should handle axios error", async () => {
      (axios.post as any).mockRejectedValue(new Error("Strava Down"));
      const result = await exchangeStravaTokenAction("code");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to exchange token with Strava");
    });
  });

  describe("syncStravaActivitiesAction", () => {
    it("should sync new activities", async () => {
      // Mock user connected
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "test-user-id",
        stravaAccessToken: "valid-token",
        stravaExpiresAt: Date.now() / 1000 + 3600, // Valid for 1h
      });

      // Mock Strava API
      const mockActivities = [
        {
          id: 1001,
          name: "Morning Run",
          distance: 5000,
          moving_time: 1800,
          type: "Run",
          start_date: "2023-01-01T10:00:00Z",
          average_heartrate: 150,
        },
      ];
      (axios.get as any).mockResolvedValue({ data: mockActivities });

      // Mock that activity does NOT exist in DB
      (prisma.cardioLog.findUnique as any).mockResolvedValue(null);

      const result = await syncStravaActivitiesAction();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(prisma.cardioLog.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled(); // Rewards
    });

    it("should refresh token if expired", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "test-user-id",
        stravaAccessToken: "old-token",
        stravaRefreshToken: "refresh-token",
        stravaExpiresAt: Date.now() / 1000 - 3600, // Expired 1h ago
      });

      (axios.post as any).mockResolvedValue({
        data: {
          access_token: "new-token",
          refresh_token: "new-refresh",
          expires_at: Date.now() / 1000 + 3600,
        },
      });

      (axios.get as any).mockResolvedValue({ data: [] });

      await syncStravaActivitiesAction();

      expect(axios.post).toHaveBeenCalledWith(
        "https://www.strava.com/oauth/token",
        expect.objectContaining({
          grant_type: "refresh_token",
        }),
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "test-user-id" },
        data: expect.objectContaining({ stravaAccessToken: "new-token" }),
      });
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("activities"),
        expect.objectContaining({
          headers: { Authorization: "Bearer new-token" },
        }),
      );
    });
  });

  describe("disconnectStravaAction", () => {
    it("should clear user strava fields", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "test-user-id",
        stravaAccessToken: "token",
      });

      const result = await disconnectStravaAction();

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "test-user-id" },
        data: {
          stravaAccessToken: null,
          stravaRefreshToken: null,
          stravaExpiresAt: null,
          stravaAthleteId: null,
        },
      });
    });
  });
});

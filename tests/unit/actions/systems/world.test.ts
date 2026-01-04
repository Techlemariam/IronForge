import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWorldStateAction, getBestiaryAction } from "@/actions/systems/world";

// Mocks
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
    worldRegion: {
      findMany: vi.fn(),
    },
    raidBoss: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    unlockedMonster: {
      findMany: vi.fn(),
    },
  },
}));

// Import mocks to manipulate them
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

describe("World Server Actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("getWorldStateAction", () => {
    it("should return null if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const result = await getWorldStateAction();
      expect(result).toBeNull();
    });

    it("should return null if user not found in db", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const result = await getWorldStateAction();
      expect(result).toBeNull();
    });

    it("should return regions with correct unlocked state", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      (prisma.user.findUnique as any).mockResolvedValue({
        level: 5,
        heroName: "Hero",
      });

      (prisma.worldRegion.findMany as any).mockResolvedValue([
        { id: "region-1", name: "Start", levelReq: 1, coordX: 0, coordY: 0 },
        { id: "region-2", name: "Hard", levelReq: 10, coordX: 10, coordY: 10 },
      ]);

      const result = await getWorldStateAction();

      expect(result).not.toBeNull();
      expect(result?.userLevel).toBe(5);
      expect(result?.regions).toHaveLength(2);

      // Region 1 (Lvl 1) should be UNLOCKED for Lvl 5 user
      expect(result?.regions[0].isUnlocked).toBe(true);
      expect(result?.regions[0].name).toBe("Start");

      // Region 2 (Lvl 10) should be LOCKED for Lvl 5 user
      expect(result?.regions[1].isUnlocked).toBe(false);
    });

    it("should obscure details for regions far above user level", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      // User level 1 vs Region Level 20 (Diff > 5)
      (prisma.user.findUnique as any).mockResolvedValue({
        level: 1,
        heroName: "Novice",
      });

      (prisma.worldRegion.findMany as any).mockResolvedValue([
        {
          id: "region-void",
          name: "The Void",
          description: "Scary",
          levelReq: 20,
          coordX: 100,
          coordY: 100,
        },
      ]);

      const result = await getWorldStateAction();

      expect(result?.regions[0].name).toBe("???");
      expect(result?.regions[0].description).toBe("Too dangerous to perceive.");
    });
  });

  describe("getBestiaryAction", () => {
    it("should return discovered status correctly", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      // Mock All Raid Bosses
      (prisma.raidBoss.findMany as any).mockResolvedValue([
        { id: "boss-1", name: "Goblin", levelReq: 1 },
        { id: "boss-2", name: "Dragon", levelReq: 50 },
      ]);

      // Mock User Unlocks (Only Goblin killed)
      (prisma.unlockedMonster.findMany as any).mockResolvedValue([
        { monsterId: "boss-1", kills: 5, unlockedAt: new Date() },
      ]);

      const result = await getBestiaryAction();

      expect(result.monsters).toHaveLength(2);

      // Goblin: Discovered
      expect(result.monsters[0].id).toBe("boss-1");
      expect(result.monsters[0].isDiscovered).toBe(true);
      expect(result.monsters[0].kills).toBe(5);

      // Dragon: Not Discovered
      expect(result.monsters[1].id).toBe("boss-2");
      expect(result.monsters[1].isDiscovered).toBe(false);
      expect(result.monsters[1].kills).toBe(0);
    });
  });
});

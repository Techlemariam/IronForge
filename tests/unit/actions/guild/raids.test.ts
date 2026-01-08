import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createGuildAction,
  joinGuildAction,
  getGuildAction,
  startRaidAction,
  contributeToRaidAction,
} from "@/actions/guild/raids";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    guild: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    guildRaid: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    guildRaidContribution: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return {
    default: mockPrisma,
    prisma: mockPrisma,
  };
});

vi.mock("@/actions/progression/achievements", () => ({
  checkAchievementsAction: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
    },
  }),
}));

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

describe("Guild Raids Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth mock default
    (createClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
    });
  });

  describe("createGuildAction", () => {
    it("should create a guild and assign user", async () => {
      const mockGuild = { id: "guild-1", name: "Iron Warriors" };

      (prisma.$transaction as any).mockImplementation(async (cb: (tx: any) => any) => {
        return cb(prisma);
      });
      (prisma.guild.create as any).mockResolvedValue(mockGuild);
      (prisma.user.update as any).mockResolvedValue({});

      const result = await createGuildAction({ name: "Iron Warriors" });

      expect(result.success).toBe(true);
      expect(result.guild?.name).toBe("Iron Warriors");
    });

    it("should reject invalid guild name (too short)", async () => {
      const result = await createGuildAction({ name: "AB" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to create guild");
    });

    it("should reject invalid guild name (too long)", async () => {
      const result = await createGuildAction({ name: "A".repeat(25) });

      expect(result.success).toBe(false);
    });
  });

  describe("joinGuildAction", () => {
    it("should join an existing guild", async () => {
      (prisma.user.update as any).mockResolvedValue({});

      const result = await joinGuildAction("guild-1");

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { guildId: "guild-1" },
      });
    });

    it("should handle join failure", async () => {
      (prisma.user.update as any).mockRejectedValue(new Error("DB Error"));

      const result = await joinGuildAction("invalid-guild");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to join guild");
    });
  });

  describe("getGuildAction", () => {
    it("should return guild with active raid", async () => {
      const futureDate = new Date(Date.now() + 86400000);

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        guild: {
          id: "guild-1",
          name: "Iron Warriors",
          raids: [{ id: "raid-1", bossName: "Dragon", endDate: futureDate }],
          members: [{ id: "user-1" }],
        },
      });

      const result = await getGuildAction();

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Iron Warriors");
      expect(result?.activeRaid?.bossName).toBe("Dragon");
    });

    it("should return null if user has no guild", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        guild: null,
      });

      const result = await getGuildAction();

      expect(result).toBeNull();
    });
  });

  describe("startRaidAction", () => {
    it("should reject unauthorized user", async () => {
      // Mock guild where leaderId != user-1
      (prisma.guild.findUnique as any).mockResolvedValue({ leaderId: "other-user" });

      const result = await startRaidAction(
        "guild-1",
        "Ancient Dragon",
        10000,
        7
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });

    it("should create a new raid for guild leader", async () => {
      const mockRaid = {
        id: "raid-1",
        guildId: "guild-1",
        bossName: "Ancient Dragon",
        totalHp: 10000,
        currentHp: 10000,
      };

      // Mock guild where leaderId == user-1
      (prisma.guild.findUnique as any).mockResolvedValue({ leaderId: "user-1" });
      (prisma.guildRaid.create as any).mockResolvedValue(mockRaid);

      const result = await startRaidAction(
        "guild-1",
        "Ancient Dragon",
        10000,
        7,
      );

      if (!result.success || !result.raid) {
        throw new Error(`Expected success with raid data, got error: ${result.error}`);
      }

      expect(result.success).toBe(true);
      expect(result.raid.bossName).toBe("Ancient Dragon");
      expect(result.raid.totalHp).toBe(10000);
      expect(prisma.guildRaid.create).toHaveBeenCalled();
    });
  });

  describe("contributeToRaidAction", () => {
    it("should contribute damage to raid", async () => {
      (prisma.guildRaid.findUnique as any).mockResolvedValue({
        id: "raid-1",
        currentHp: 5000,
      });

      (prisma.$transaction as any).mockResolvedValue([{}, {}]);

      const result = await contributeToRaidAction("raid-1", 100);

      expect(result.success).toBe(true);
      expect(result.damageDealt).toBe(100);
      expect(result.bossDead).toBe(false);
    });

    it("should detect boss kill and trigger achievement", async () => {
      (prisma.guildRaid.findUnique as any).mockResolvedValue({
        id: "raid-1",
        currentHp: 50,
      });

      (prisma.$transaction as any).mockResolvedValue([{}, {}]);

      const result = await contributeToRaidAction("raid-1", 100);

      expect(result.success).toBe(true);
      expect(result.bossDead).toBe(true);
    });

    it("should fail if raid already ended", async () => {
      (prisma.guildRaid.findUnique as any).mockResolvedValue({
        id: "raid-1",
        currentHp: 0,
      });

      const result = await contributeToRaidAction("raid-1", 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Raid ended or invalid");
    });

    it("should fail if raid not found", async () => {
      (prisma.guildRaid.findUnique as any).mockResolvedValue(null);

      const result = await contributeToRaidAction("invalid-raid", 100);

      expect(result.success).toBe(false);
    });
  });
});

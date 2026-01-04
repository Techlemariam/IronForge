import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendChatAction, attackBossAction, getUserStatsAction } from "@/actions/guild/core";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// Mock Supabase
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    chatMessage: {
      create: vi.fn(),
    },
    raidBoss: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Guild Actions", () => {
  const mockUser = {
    id: "user-123",
    heroName: "TestHero",
    kineticEnergy: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-123" } } }),
      },
    });
  });

  describe("sendChatAction", () => {
    it("should create a chat message", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.chatMessage.create as any).mockResolvedValue({ id: "msg-1" });

      await sendChatAction("Hello Guild!");

      expect(prisma.chatMessage.create).toHaveBeenCalledWith({
        data: {
          userName: "TestHero",
          message: "Hello Guild!",
          type: "CHAT",
        },
      });
    });

    it("should truncate long messages", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      const longMessage = "a".repeat(300);

      await sendChatAction(longMessage);

      expect(prisma.chatMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: expect.stringMatching(/^a{255}$/),
          }),
        }),
      );
    });
  });

  describe("attackBossAction", () => {
    it("should deal damage if user has energy", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.raidBoss.findUnique as any).mockResolvedValue({
        id: "boss-1",
        isActive: true,
        currentHp: BigInt(1000),
        name: "Goblin King",
      });
      (prisma.raidBoss.update as any).mockResolvedValue({});

      // Mock random damage
      const spyRandom = vi.spyOn(Math, "random").mockReturnValue(0.5); // 50 + 50 = 100 damage

      const result = await attackBossAction("boss-1");

      expect(result.damage).toBe(100);
      expect(result.newHp).toBe("900");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { kineticEnergy: { decrement: 5 } },
      });

      spyRandom.mockRestore();
    });

    it("should throw if boss is defeated", async () => {
      (prisma.raidBoss.findUnique as any).mockResolvedValue({
        id: "boss-1",
        isActive: true,
        currentHp: BigInt(0),
      });

      const result = await attackBossAction("boss-1");
      expect(result).toEqual({ message: "Boss is already defeated!" });
    });

    it("should throw if insufficient energy", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        kineticEnergy: 0,
      });
      (prisma.raidBoss.findUnique as any).mockResolvedValue({
        id: "boss-1",
        isActive: true,
        currentHp: BigInt(1000),
      });

      await expect(attackBossAction("boss-1")).rejects.toThrow(
        "Insufficient Kinetic Energy",
      );
    });
  });

  describe("getUserStatsAction", () => {
    it("should return user stats", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      const result = await getUserStatsAction();
      expect(result).toEqual(mockUser);
    });
  });
});

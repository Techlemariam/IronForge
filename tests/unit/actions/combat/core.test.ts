import { describe, it, expect, vi, beforeEach } from "vitest";
import { startBossFight, performCombatAction } from "@/actions/combat/core";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mocks
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    monster: {
      findUnique: vi.fn(),
    },
    titan: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    combatSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
  return {
    default: mockPrisma,
    prisma: mockPrisma,
  };
});

vi.mock("@/services/game/CombatEngine", () => ({
  CombatEngine: {
    processTurn: vi.fn(),
  },
}));

vi.mock("@/services/game/LootSystem", () => ({
  LootSystem: {
    rollForLoot: vi.fn(() => Promise.resolve({ item: "Rare Sword" })),
    generateLoot: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("@/utils", () => ({
  calculateTitanAttributes: vi.fn(() => ({
    strength: 10,
    endurance: 10,
    technique: 10,
    hypertrophy: 10,
    recovery: 10,
    mental: 10,
  })),
}));

// Import mocks to manipulate them
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { CombatEngine } from "@/services/game/CombatEngine";

describe("Combat Server Actions", () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    (prisma.titan.findUnique as any).mockResolvedValue({
      id: "t1",
      userId: "user-1",
      currentHp: 100,
      maxHp: 100,
      xp: 0,
      level: 1,
      energy: 100,
      mood: "NEUTRAL",
      isInjured: false,
      streak: 0,
      lastActive: new Date(),
    });
  });

  describe("startBossFight", () => {
    it("should initialize combat state for valid boss", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        level: 5,
        achievements: [],
        skills: [],
        titan: {
          currentHp: 100,
          maxHp: 100,
          isInjured: false,
        },
      });

      (prisma.monster.findUnique as any).mockResolvedValue({
        id: "boss-1",
        hp: 1000,
        name: "Boss",
        level: 5,
      });

      const result = await startBossFight("boss-1");

      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
      expect(result.state?.bossHp).toBe(1000);
      expect(result.state?.playerHp).toBeDefined();
    });

    it("should fail if boss not found", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        achievements: [],
        skills: [],
        titan: { currentHp: 100, maxHp: 100, isInjured: false },
      });
      (prisma.monster.findUnique as any).mockResolvedValue(null);

      const result = await startBossFight("missing-boss");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Boss not found");
    });
  });

  describe("performCombatAction", () => {
    it("should process turn and return new state", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      // Mock for startBossFight
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        level: 5,
        achievements: [],
        skills: [],
        titan: { currentHp: 100, maxHp: 100, isInjured: false },
      });

      (prisma.monster.findUnique as any).mockResolvedValue({
        id: "boss-1",
        name: "Boss",
        hp: 1000,
        level: 5,
      });

      (prisma.combatSession.findUnique as any).mockResolvedValue({
        id: "session-1",
        userId: "user-1",
        bossId: "boss-1",
        bossHp: 1000,
        bossMaxHp: 1000,
        playerHp: 100,
        playerMaxHp: 100,
        turnCount: 1,
        logs: [],
        isVictory: false,
        isDefeat: false,
      });

      // Call startBossFight to populate session
      await startBossFight("boss-1");

      // Mock for performCombatAction (re-fetch user)
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        level: 5,
        achievements: [],
        skills: [],
        titan: { currentHp: 100, maxHp: 100, isInjured: false },
      });

      (CombatEngine.processTurn as any).mockReturnValue({
        newState: { playerHp: 90, bossHp: 900, isVictory: false },
        logs: [],
      });

      const result = await performCombatAction({ type: "ATTACK" } as any);

      expect(result.success).toBe(true);
      expect(CombatEngine.processTurn).toHaveBeenCalled();
    });

    it("should handle victory and award loot", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      // Mock consistently
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        level: 5,
        achievements: [],
        skills: [],
        titan: { currentHp: 100, maxHp: 100, isInjured: false },
      });
      (prisma.monster.findUnique as any).mockResolvedValue({
        id: "boss-1",
        name: "Boss",
        hp: 1000,
        level: 5,
      });

      (prisma.combatSession.findUnique as any).mockResolvedValue({
        id: "session-1",
        userId: "user-1",
        bossId: "boss-1",
        bossHp: 1000,
        bossMaxHp: 1000,
        playerHp: 100,
        playerMaxHp: 100,
        turnCount: 1,
        logs: [],
        isVictory: false,
        isDefeat: false,
      });

      await startBossFight("boss-1");

      (CombatEngine.processTurn as any).mockReturnValue({
        newState: { isVictory: true, isDefeat: false },
        logs: [],
      });

      const result = await performCombatAction({ type: "ATTACK" } as any);

      expect(result.success).toBe(true);
      expect(result.loot).toBeDefined();
      expect(result.reward).toEqual({ xp: 250, gold: 125 });
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("should reduce attributes if Titan is WEAKENED", async () => {
      // Mock user with WEAKENED mood
      const userWeak = {
        id: "user-weak",
        level: 5,
        achievements: [],
        skills: [],
        titan: {
          currentHp: 50,
          maxHp: 100,
          isInjured: false,
          mood: "WEAKENED",
        },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-weak" } },
      });
      (prisma.user.findUnique as any).mockResolvedValue(userWeak);
      (prisma.monster.findUnique as any).mockResolvedValue({
        id: "boss-1",
        name: "Boss",
        hp: 1000,
        level: 5,
      });

      (prisma.combatSession.findUnique as any).mockResolvedValue({
        id: "session-1",
        userId: "user-weak",
        bossId: "boss-1",
        bossHp: 1000,
        bossMaxHp: 1000,
        playerHp: 50,
        playerMaxHp: 100,
        turnCount: 1,
        logs: [],
        isVictory: false,
        isDefeat: false,
      });

      // Initialize session
      await startBossFight("boss-1");

      // Setup capture of arguments to CombatEngine.processTurn
      (CombatEngine.processTurn as any).mockReturnValue({
        newState: { playerHp: 50, bossHp: 900, isVictory: false },
        logs: [],
      });

      await performCombatAction({ type: "ATTACK" } as any);

      expect(CombatEngine.processTurn).toHaveBeenCalled();

      const calls = (CombatEngine.processTurn as any).mock.calls;
      const lastCall = calls[calls.length - 1];
      const attributesArg = lastCall[2]; // 3rd argument

      // Expect 20% reduction (10 * 0.8 = 8)
      expect(attributesArg.strength).toBe(8);
      expect(attributesArg.endurance).toBe(8);
    });

    it("should buff attributes if Titan is HAPPY", async () => {
      // Mock user with HAPPY mood
      const userHappy = {
        id: "user-happy",
        level: 5,
        achievements: [],
        skills: [],
        titan: { currentHp: 100, maxHp: 100, isInjured: false, mood: "HAPPY" },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-happy" } },
      });
      (prisma.user.findUnique as any).mockResolvedValue(userHappy);
      (prisma.monster.findUnique as any).mockResolvedValue({
        id: "boss-1",
        name: "Boss",
        hp: 1000,
        level: 5,
      });

      (prisma.combatSession.findUnique as any).mockResolvedValue({
        id: "session-1",
        userId: "user-happy",
        bossId: "boss-1",
        bossHp: 1000,
        bossMaxHp: 1000,
        playerHp: 100,
        playerMaxHp: 100,
        turnCount: 1,
        logs: [],
        isVictory: false,
        isDefeat: false,
      });

      // Mock titan for safety
      (prisma.titan.findUnique as any).mockResolvedValue(userHappy.titan);

      await startBossFight("boss-1");

      (CombatEngine.processTurn as any).mockReturnValue({
        newState: { playerHp: 100, bossHp: 900, isVictory: false },
        logs: [],
      });

      await performCombatAction({ type: "ATTACK" } as any);

      const calls = (CombatEngine.processTurn as any).mock.calls;
      const attributesArg = calls[calls.length - 1][2];

      // Expect 10% increase (10 * 1.1 = 11)
      expect(attributesArg.strength).toBe(11);
      expect(attributesArg.endurance).toBe(11);
    });
  });
});

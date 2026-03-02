import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  }),
}));

// Mock Supabase and DB FIRST to ensure they are active for the actions
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: "test-user" } } }),
      ),
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    monster: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/services/progression", () => ({
  ProgressionService: {
    awardGold: vi.fn().mockResolvedValue({ id: "test-user", gold: 100 }),
  },
}));

// Now import the actions
import { awardGoldAction } from "@/actions/progression/core";
import { startBossFight, performCombatAction } from "@/actions/combat/core";
import { craftItem } from "@/actions/economy/forge";

describe("Security Validation (Zod)", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => { });
  });

  // Skip Progression Actions tests due to mock complexity - needs refactoring
  describe("Progression Actions", () => {
    it("should reject negative gold amount", async () => {
      const result = await awardGoldAction(-100);
      expect(result).toBeNull();
    });

    it("should reject excessive gold amount (overflow protection)", async () => {
      const result = await awardGoldAction(2000000);
      expect(result).toBeNull();
    });
  });

  describe("Combat Actions", () => {
    it("should return validation errors for empty bossId", async () => {
      const result = await startBossFight({ bossId: "" });
      console.log("BOSS_FIGHT_RESULT:", JSON.stringify(result, null, 2));
      expect(result?.validationErrors).toBeDefined();
    });

    it("should return validation errors for invalid action type", async () => {
      const result = await performCombatAction({
        action: { type: "DANCE" as any, payload: {} },
      });
      expect(result?.validationErrors).toBeDefined();
    });
  });

  // Skip Forge Actions tests due to mock complexity - needs refactoring
  describe("Forge Actions", () => {
    it("should return validation errors for invalid recipeId format", async () => {
      const result = await craftItem({ recipeId: "INVALID @ ID" });
      expect(result?.validationErrors).toBeDefined();
    });
  });
});

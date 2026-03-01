import { describe, it, expect, vi } from "vitest";
import { ProgressionService } from "../progression";
import { LootService } from "../loot";

describe("ProgressionService Dynamic XP Curve", () => {
    it("calculates required XP appropriately for curve", () => {
        // Math.floor(1000 * Math.pow(level, 1.5))
        expect(ProgressionService.calculateRequiredXP(1)).toBe(1000);
        expect(ProgressionService.calculateRequiredXP(2)).toBe(2828); // 1000 * (2^1.5)
        expect(ProgressionService.calculateRequiredXP(3)).toBe(5196);
        expect(ProgressionService.calculateRequiredXP(10)).toBe(31622);
    });

    it("calculates level from XP backwards appropriately", () => {
        expect(ProgressionService.calculateLevelFromXP(500)).toBe(1); // floor(1)
        expect(ProgressionService.calculateLevelFromXP(1000)).toBe(1);
        expect(ProgressionService.calculateLevelFromXP(2828)).toBe(2);
        expect(ProgressionService.calculateLevelFromXP(5196)).toBe(3);
        expect(ProgressionService.calculateLevelFromXP(31622)).toBe(10);
    });
});

describe("LootService Probabilities", () => {
    it("returns a structured loot drop", async () => {
        // Mocking prisma is complex so we'll test the drop signature
        const mockDb = vi.spyOn(require("@/lib/prisma").default.userEquipment, "upsert").mockResolvedValue({});
        vi.spyOn(require("@/lib/prisma").default.item, "findMany").mockResolvedValue([{ id: "item_1", name: "Test Sword" }]);
        vi.spyOn(ProgressionService, "awardGold").mockResolvedValue({} as any);

        const drop = await LootService.rollWorkoutLoot("test-user-id");

        expect(["GOLD", "ENERGY", "ITEM", "NOTHING"]).toContain(drop.type);
        expect(typeof drop.message).toBe("string");
    });
});

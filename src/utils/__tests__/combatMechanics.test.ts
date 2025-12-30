import { describe, it, expect } from "vitest";
import {
  calculateDamage,
  detectSpecialMove,
  detectJokerOpportunity,
} from "../combatMechanics";

describe("Combat Mechanics", () => {
  describe("calculateDamage", () => {
    it("calculates base damage correctly (Weight * Reps)", () => {
      const stats = calculateDamage(100, 5, 8, false);
      expect(stats.damage).toBe(500);
      expect(stats.type).toBe("standard");
    });

    it("applies bodyweight fallback", () => {
      const stats = calculateDamage(0, 10, 8, false);
      expect(stats.damage).toBe(700); // 70 * 10
    });

    it("applies Heavy Strike bonus for RPE 9", () => {
      const stats = calculateDamage(100, 5, 9, false);
      // 500 * 1.2 = 600
      expect(stats.damage).toBe(600);
      expect(stats.description).toBe("Heavy Strike");
    });

    it("applies Limit Break bonus for RPE 10", () => {
      const stats = calculateDamage(100, 5, 10, false);
      // 500 * 1.5 = 750
      expect(stats.damage).toBe(750);
      expect(stats.type).toBe("critical");
      expect(stats.description).toBe("Limit Break");
    });

    it("applies PR bonus (Double Damage)", () => {
      const stats = calculateDamage(100, 5, 10, true);
      // 500 * 1.5 (RPE 10) * 2.0 (PR) = 1500
      // Assuming math order: code says `damage *= 1.5` then `damage *= 2.0`
      expect(stats.damage).toBe(1500);
      expect(stats.description).toBe("Legendary Strike");
    });
  });

  describe("detectSpecialMove", () => {
    it("detects Berserker Rage on drop sets", () => {
      expect(detectSpecialMove(8, true, false)).toBe("Berserker Rage");
    });

    it("detects Flurry of Blows on high rep AMRAP", () => {
      expect(detectSpecialMove(15, false, true)).toBe("Flurry of Blows");
    });

    it("detects Endurance Assault on 20+ reps", () => {
      expect(detectSpecialMove(20, false, false)).toBe("Endurance Assault");
    });

    it("returns null for normal sets", () => {
      expect(detectSpecialMove(10, false, false)).toBe(null);
    });
  });

  describe("detectJokerOpportunity", () => {
    it("offers joker when RPE is low on working sets", () => {
      expect(detectJokerOpportunity(6, 1, 3)).toBe(true);
    });

    it("ignores warmups (setIndex 0)", () => {
      expect(detectJokerOpportunity(6, 0, 3)).toBe(false);
    });

    it("ignores hard sets (RPE 8)", () => {
      expect(detectJokerOpportunity(8, 1, 3)).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
    normalizeStrength,
    normalizeCardio,
    getMrvAdherenceBonus,
    calculatePowerRating,
    applyDecay,
} from "../powerRating";

describe("powerRating", () => {
    describe("normalizeStrength", () => {
        it("should return 0 for Wilks at floor (200)", () => {
            expect(normalizeStrength(200)).toBe(0);
        });

        it("should return 1000 for Wilks at ceiling (600)", () => {
            expect(normalizeStrength(600)).toBe(1000);
        });

        it("should return 500 for Wilks at midpoint (400)", () => {
            expect(normalizeStrength(400)).toBe(500);
        });

        it("should clamp below floor to 0", () => {
            expect(normalizeStrength(100)).toBe(0);
        });

        it("should clamp above ceiling to 1000", () => {
            expect(normalizeStrength(700)).toBe(1000);
        });
    });

    describe("normalizeCardio", () => {
        it("should return 0 for W/kg at floor (1.5)", () => {
            expect(normalizeCardio(1.5)).toBe(0);
        });

        it("should return 1000 for W/kg at ceiling (5.0)", () => {
            expect(normalizeCardio(5.0)).toBe(1000);
        });

        it("should return ~428 for W/kg at 3.0", () => {
            // (3.0 - 1.5) / (5.0 - 1.5) * 1000 = 1.5 / 3.5 * 1000 ≈ 428.57
            const result = normalizeCardio(3.0);
            expect(result).toBeGreaterThanOrEqual(428);
            expect(result).toBeLessThanOrEqual(429);
        });

        it("should clamp below floor to 0", () => {
            expect(normalizeCardio(1.0)).toBe(0);
        });

        it("should clamp above ceiling to 1000", () => {
            expect(normalizeCardio(6.0)).toBe(1000);
        });
    });

    describe("getMrvAdherenceBonus", () => {
        it("should return 1.0 for zero adherence", () => {
            expect(getMrvAdherenceBonus(0, 0, "WARDEN")).toBe(1.0);
        });

        it("should return 1.15 for perfect adherence", () => {
            expect(getMrvAdherenceBonus(1.0, 1.0, "WARDEN")).toBe(1.15);
        });

        it("should weight strength more for JUGGERNAUT", () => {
            // JUGGERNAUT: str=0.8, cardio=0.2
            const result = getMrvAdherenceBonus(1.0, 0, "JUGGERNAUT");
            // adherenceScore = 1.0 * 0.8 + 0 * 0.2 = 0.8
            // bonus = 1.0 + 0.8 * 0.15 = 1.12
            expect(result).toBe(1.12);
        });

        it("should weight cardio more for PATHFINDER", () => {
            // PATHFINDER: str=0.2, cardio=0.8
            const result = getMrvAdherenceBonus(0, 1.0, "PATHFINDER");
            // adherenceScore = 0 * 0.2 + 1.0 * 0.8 = 0.8
            // bonus = 1.0 + 0.8 * 0.15 = 1.12
            expect(result).toBe(1.12);
        });
    });

    describe("calculatePowerRating", () => {
        it("should return balanced rating for WARDEN path", () => {
            // Wilks 400 → strengthIndex 500
            // W/kg 3.25 → cardioIndex 500
            // WARDEN weights: 0.5/0.5
            // baseRating = 500 * 0.5 + 500 * 0.5 = 500
            const result = calculatePowerRating(400, 3.25, "WARDEN");
            expect(result.strengthIndex).toBe(500);
            expect(result.cardioIndex).toBe(500);
            expect(result.powerRating).toBe(500);
        });

        it("should weight strength for JUGGERNAUT path", () => {
            // JUGGERNAUT weights: 0.7/0.3
            // baseRating = 500 * 0.7 + 500 * 0.3 = 500
            const result = calculatePowerRating(400, 3.25, "JUGGERNAUT");
            expect(result.powerRating).toBe(500);
        });

        it("should cap at 1000", () => {
            // Max everything with perfect adherence
            const result = calculatePowerRating(600, 5.0, "WARDEN", 1.0, 1.0);
            // baseRating = 1000, adherence = 1.15, capped at 1000
            expect(result.powerRating).toBe(1000);
        });

        it("should apply adherence bonus", () => {
            const withoutAdherence = calculatePowerRating(400, 3.25, "WARDEN", 0, 0);
            const withAdherence = calculatePowerRating(400, 3.25, "WARDEN", 1.0, 1.0);

            // With adherence should be 15% higher
            expect(withAdherence.powerRating).toBeGreaterThan(withoutAdherence.powerRating);
            expect(withAdherence.powerRating).toBe(575); // 500 * 1.15 = 575
        });
    });

    describe("applyDecay", () => {
        it("should not decay if less than 7 days inactive", () => {
            expect(applyDecay(1000, 0)).toBe(1000);
            expect(applyDecay(1000, 6)).toBe(1000);
        });

        it("should decay 5% after 7 days", () => {
            // 1000 * 0.95 = 950
            expect(applyDecay(1000, 7)).toBe(950);
        });

        it("should decay 10% (cumulative) after 14 days", () => {
            // 1000 * 0.95^2 = 902.5 → 903
            expect(applyDecay(1000, 14)).toBe(903);
        });

        it("should decay ~23% after 35 days (5 weeks)", () => {
            // 1000 * 0.95^5 = 773.78 → 774
            expect(applyDecay(1000, 35)).toBe(774);
        });

        it("should handle partial weeks correctly", () => {
            // 10 days = 1 full week of decay
            expect(applyDecay(1000, 10)).toBe(950);
        });
    });
});

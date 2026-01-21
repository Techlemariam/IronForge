import { describe, it, expect } from "vitest";
import {
    calculateStrengthRating,
    calculateCardioRating,
    getConsistencyBonusMultiplier,
    calculatePowerRating,
    applyDecay,
} from "@/lib/powerRating";

describe("powerRating (Oracle 3.0)", () => {

    describe("calculateStrengthRating", () => {
        it("should calculate based on Wilks and Volume", () => {
            // Wilks * 10 + Volume / 1000
            // 300 * 10 + 5000 / 1000 = 3000 + 5 = 3005 -> Cap 2000
            expect(calculateStrengthRating(300, 5000)).toBe(2000);
        });

        it("should handle low values without going below 0", () => {
            // 10 * 10 + 0 = 100
            expect(calculateStrengthRating(10, 0)).toBe(100);
        });

        it("should cap strictly at 2000", () => {
            expect(calculateStrengthRating(500, 100000)).toBe(2000);
        });

        it("should calculate a mid-range scenario accurately", () => {
            // Wilks 150 -> 1500
            // Vol 20000 -> 20
            // Total 1520
            expect(calculateStrengthRating(150, 20000)).toBe(1520);
        });
    });

    describe("calculateCardioRating", () => {
        it("should calculate based on FTP and Duration", () => {
            // FTP * 4 + Hours * 50
            // 200 * 4 + 4 * 50 = 800 + 200 = 1000
            expect(calculateCardioRating(200, 4)).toBe(1000);
        });

        it("should cap strictly at 2000", () => {
            // 400 * 4 = 1600. Duration 20h * 50 = 1000. Total 2600. Cap 2000.
            expect(calculateCardioRating(400, 20)).toBe(2000);
        });

        it("should handle zero activity", () => {
            // 200 * 4 + 0 = 800
            expect(calculateCardioRating(200, 0)).toBe(800);
        });
    });

    describe("getConsistencyBonusMultiplier", () => {
        it("should return 1.0 for 0 streak", () => {
            expect(getConsistencyBonusMultiplier(0)).toBe(1.0);
        });

        it("should return 1.05 for 5 weeks streak", () => {
            expect(getConsistencyBonusMultiplier(5)).toBe(1.05);
        });

        it("should cap at 1.10 for >10 weeks streak", () => {
            expect(getConsistencyBonusMultiplier(12)).toBe(1.10);
        });
    });

    describe("calculatePowerRating", () => {
        it("should combine Strength and Cardio with Bonus", () => {
            // Strength: 1520 (Wilks 150, Vol 20k)
            // Cardio: 1000 (FTP 200, Dur 4h)
            // Bonus: 5 weeks (1.05)
            // Base = (1520 * 0.5) + (1000 * 0.5) = 760 + 500 = 1260
            // Final = 1260 * 1.05 = 1323

            const result = calculatePowerRating(150, 20000, 200, 4, 5);

            expect(result.strengthIndex).toBe(1520);
            expect(result.cardioIndex).toBe(1000);
            expect(result.powerRating).toBe(1323);
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

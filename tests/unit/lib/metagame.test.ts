import { describe, it, expect } from "vitest";
import { calculateMetaScore, getMetaRank, getRankProgress } from "@/lib/metagame";

describe("metagame", () => {
    describe("calculateMetaScore", () => {
        it("should calculate base score correctly", () => {
            const stats = { level: 10, powerRating: 100, pvpRating: 500 };
            // (10 * 100) + (100 * 5) + (500 * 2) = 1000 + 500 + 1000 = 2500
            expect(calculateMetaScore(stats)).toBe(2500);
        });

        it("should handle missing powerRating or pvpRating", () => {
            // @ts-ignore - testing runtime robustness
            expect(calculateMetaScore({ level: 10 })).toBe(1000);
            // @ts-ignore
            expect(calculateMetaScore({ level: 10, powerRating: 100 })).toBe(1500);
        });

        it("should round the result", () => {
            const stats = { level: 10, powerRating: 10.1, pvpRating: 10.2 };
            // (10 * 100) + (10.1 * 5) + (10.2 * 2) = 1000 + 50.5 + 20.4 = 1070.9 -> 1071
            expect(calculateMetaScore(stats)).toBe(1071);
        });
    });

    describe("getMetaRank", () => {
        it("should return IRON for low scores", () => {
            expect(getMetaRank(0).name).toBe("IRON");
            expect(getMetaRank(1999).name).toBe("IRON");
        });

        it("should return STEEL for scores >= 2000", () => {
            expect(getMetaRank(2000).name).toBe("STEEL");
            expect(getMetaRank(4999).name).toBe("STEEL");
        });

        it("should return TITANIUM for scores >= 5000", () => {
            expect(getMetaRank(5000).name).toBe("TITANIUM");
            expect(getMetaRank(7999).name).toBe("TITANIUM");
        });

        it("should return NEUTRONIUM for scores >= 8000", () => {
            expect(getMetaRank(8000).name).toBe("NEUTRONIUM");
            expect(getMetaRank(9499).name).toBe("NEUTRONIUM");
        });

        it("should return SINGULARITY for scores >= 9500", () => {
            expect(getMetaRank(9500).name).toBe("SINGULARITY");
            expect(getMetaRank(100000).name).toBe("SINGULARITY");
        });
    });

    describe("getRankProgress", () => {
        it("should calculate progress from IRON to STEEL", () => {
            const result = getRankProgress(1000);
            expect(result.current.name).toBe("IRON");
            expect(result.next?.name).toBe("STEEL");
            // range = 2000 - 0 = 2000. progress = 1000. 1000/2000 = 50%
            expect(result.percent).toBe(50);
        });

        it("should handle rounding in progress", () => {
            const result = getRankProgress(500);
            expect(result.percent).toBe(25);
        });

        it("should return 100% and no next rank for SINGULARITY", () => {
            const result = getRankProgress(9500);
            expect(result.current.name).toBe("SINGULARITY");
            expect(result.next).toBeUndefined();
            expect(result.percent).toBe(100);
        });

        it("should cap percent at 100", () => {
            const result = getRankProgress(10000);
            expect(result.current.name).toBe("SINGULARITY");
            expect(result.percent).toBe(100);
        });
    });
});

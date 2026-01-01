import { describe, it, expect } from "vitest";
import { calculateEffortScore } from "../EffortCalculator";

describe("EffortCalculator", () => {
    it("should prioritize power over HR and pace", () => {
        const input = {
            avgPower: 250,
            ftp: 250, // 100% effort
            avgHr: 100,
            maxHr: 200, // 50% effort
        };

        const result = calculateEffortScore(input);
        expect(result.source).toBe("power");
        expect(result.score).toBe(80); // 100% power is 80-100 zone (Threshold)
        expect(result.controlBonus).toBe(10);
    });

    it("should use HR as fallback when power is missing", () => {
        const input = {
            avgHr: 180,
            maxHr: 200, // 90% effort
        };

        const result = calculateEffortScore(input);
        expect(result.source).toBe("hr");
        expect(result.score).toBe(100); // 90+% HR is 100
        expect(result.controlBonus).toBe(8); // VO2max/Anaerobic has slight drop in bonus vs Threshold in my design
    });

    it("should fallback to pace if both power and HR are missing", () => {
        const input = {
            avgPaceSecondsPerKm: 300, // 5:00/km
            thresholdPaceSecondsPerKm: 300, // 100% effort
        };

        const result = calculateEffortScore(input);
        expect(result.source).toBe("pace");
        expect(result.score).toBe(80); // Threshold pace
        expect(result.controlBonus).toBe(10);
    });

    it("should award zero bonus for recovery effort", () => {
        const input = {
            avgHr: 100,
            maxHr: 200, // 50% effort
        };

        const result = calculateEffortScore(input);
        expect(result.score).toBe(20);
        expect(result.zoneName).toBe("Recovery");
        expect(result.controlBonus).toBe(0);
    });
});

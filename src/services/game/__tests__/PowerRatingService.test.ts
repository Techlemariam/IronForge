import { describe, it, expect, vi } from "vitest";
import { PowerRatingService } from "../PowerRatingService";
import * as powerRatingLib from "@/lib/powerRating";

// Mock the lib functions
vi.mock("@/lib/powerRating", () => ({
    calculatePowerRating: vi.fn(),
    applyDecay: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
        titan: {
            update: vi.fn(),
        },
        exerciseLog: {
            findMany: vi.fn(),
        },
        cardioLog: {
            findMany: vi.fn(),
        },
    },
}));

describe("PowerRatingService", () => {
    describe("getTierDetails", () => {
        it("should return Titan for score 2000+", () => {
            const details = PowerRatingService.getTierDetails(2500);
            expect(details.name).toBe("Titan");
            expect(details.color).toBe("gold");
        });

        it("should return Adept for score 1200", () => {
            const details = PowerRatingService.getTierDetails(1200);
            expect(details.name).toBe("Adept");
            expect(details.color).toBe("warp");
        });

        it("should return Novice for score 100", () => {
            const details = PowerRatingService.getTierDetails(100);
            expect(details.name).toBe("Novice");
            expect(details.color).toBe("steel");
        });
    });

    // Additional tests for syncPowerRating could be added here with more extensive mocking
});

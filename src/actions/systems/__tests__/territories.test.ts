import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGuildTerritoryBonusesAction, processWeeklyTerritoryClaimsAction } from "../territories";
import { prisma } from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    prisma: {
        territory: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        territoryHistory: {
            updateMany: vi.fn(),
            create: vi.fn(),
        },
        user: {
            findMany: vi.fn(),
        },
        notification: {
            create: vi.fn(),
        },
    },
}));

// Mock NotificationService
vi.mock("@/services/notifications", () => ({
    NotificationService: {
        create: vi.fn(),
    },
}));

describe("Territory Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getGuildTerritoryBonusesAction", () => {
        it("should cap bonuses at 3 territories", async () => {
            const mockTerritories = [
                { bonuses: { xpBonus: 0.1, goldBonus: 0.1 }, region: "Region1" },
                { bonuses: { xpBonus: 0.1, goldBonus: 0.1 }, region: "Region2" },
                { bonuses: { xpBonus: 0.1, goldBonus: 0.1 }, region: "Region3" },
                { bonuses: { xpBonus: 0.1, goldBonus: 0.1 }, region: "Region4" }, // Should be ignored
            ];

            (prisma.territory.findMany as any).mockResolvedValue(mockTerritories);

            const bonuses = await getGuildTerritoryBonusesAction("guild-1");

            // 0.1 * 3 = 0.3
            expect(bonuses.xpBonus).toBeCloseTo(0.3);
            expect(bonuses.goldBonus).toBeCloseTo(0.3);
            expect(bonuses.territoriesControlled).toBe(4); // count is total, but bonuses are capped
        });
    });

    // More tests for processWeeklyTerritoryClaimsAction could be added here
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TerritoryService } from "../TerritoryService";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    default: {
        user: { findUnique: vi.fn() },
        territory: { findMany: vi.fn(), update: vi.fn() },
        guild: { findMany: vi.fn(), update: vi.fn() },
        $transaction: vi.fn((cb) => cb(prisma)),
    },
}));

describe("TerritoryService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getUserTerritoryStats", () => {
        it("should cap daily gold and XP at 3 territories", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ guildId: "guild-1" } as any);
            vi.mocked(prisma.territory.findMany).mockResolvedValue([
                { id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }
            ] as any);

            const stats = await TerritoryService.getUserTerritoryStats("user-1");

            expect(stats?.dailyGold).toBe(300); // 3 * 100
            expect(stats?.dailyXP).toBe(150);   // 3 * 50
            expect(stats?.ownedTiles).toBe(4);  // Total owned is still 4
        });

        it("should return correct bonuses for fewer than 3 territories", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ guildId: "guild-1" } as any);
            vi.mocked(prisma.territory.findMany).mockResolvedValue([
                { id: "1" }
            ] as any);

            const stats = await TerritoryService.getUserTerritoryStats("user-1");

            expect(stats?.dailyGold).toBe(100);
            expect(stats?.dailyXP).toBe(50);
        });
    });

    describe("distributeDailyIncome", () => {
        it("should group by guild and apply 3-territory cap", async () => {
            vi.mocked(prisma.guild.findMany).mockResolvedValue([
                {
                    id: "guild-1",
                    territories: [{ id: "t1" }, { id: "t2" }, { id: "t3" }, { id: "t4" }]
                }
            ] as any);

            await TerritoryService.distributeDailyIncome();

            expect(prisma.guild.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: "guild-1" },
                data: {
                    gold: { increment: 300 },
                    xp: { increment: 150 }
                }
            }));
        });
    });
});

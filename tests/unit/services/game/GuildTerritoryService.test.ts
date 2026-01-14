import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuildTerritoryService, CONTEST_COST_GOLD } from "@/services/game/GuildTerritoryService";
import prisma from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    default: {
        territory: {
            findUnique: vi.fn(),
        },
        territoryContestEntry: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        guild: {
            findMany: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback({
            user: {
                findUnique: vi.fn(),
                update: vi.fn(),
            },
            territoryContestEntry: {
                create: vi.fn(),
            },
        })),
    },
}));

describe("GuildTerritoryService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("contestTerritory", () => {
        it("should allow contest if user has enough gold", async () => {
            // Setup Mocks
            (prisma.territory.findUnique as any).mockResolvedValue({ id: "t1" });
            (prisma.territoryContestEntry.findUnique as any).mockResolvedValue(null);

            // Transaction User Mock
            const mockTxUser = { id: "u1", gold: 2000 };
            const mockTx = {
                user: {
                    findUnique: vi.fn().mockResolvedValue(mockTxUser),
                    update: vi.fn(),
                },
                territoryContestEntry: {
                    create: vi.fn().mockResolvedValue({ id: "e1" }),
                },
            };
            (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx));

            const result = await GuildTerritoryService.contestTerritory("g1", "t1", "u1");

            expect(mockTx.user.update).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: "u1" }, data: { gold: { decrement: CONTEST_COST_GOLD } } })
            );
            expect(result).toBeDefined();
        });

        it("should throw if not enough gold", async () => {
            // Setup Mocks
            (prisma.territory.findUnique as any).mockResolvedValue({ id: "t1" });
            (prisma.territoryContestEntry.findUnique as any).mockResolvedValue(null);

            // Transaction User Mock (Low Gold)
            const mockTxUser = { id: "u2", gold: 100 };
            const mockTx = {
                user: {
                    findUnique: vi.fn().mockResolvedValue(mockTxUser),
                },
            };
            (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx));

            await expect(GuildTerritoryService.contestTerritory("g1", "t1", "u2"))
                .rejects.toThrow(/Insufficient gold/);
        });
    });

    describe("recordActivity", () => {
        it("should update entry if exists", async () => {
            (prisma.territoryContestEntry.findUnique as any).mockResolvedValue({ id: "e1" });

            await GuildTerritoryService.recordActivity("g1", "t1", { volume: 1000, xp: 50 });

            expect(prisma.territoryContestEntry.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: "e1" },
                data: {
                    workoutCount: { increment: 1 },
                    totalVolume: { increment: 1000 },
                    xpEarned: { increment: 50 }
                }
            }));
        });
    });
});

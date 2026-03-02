import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TitanService } from "@/services/game/TitanService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => {
    const mockPrisma = {
        titan: {
            findUnique: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    };
    return {
        default: mockPrisma,
        prisma: mockPrisma,
    };
});

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("TitanService", () => {
    const baseTitan = {
        id: "t1",
        userId: "u1",
        name: "Iron Initiate",
        level: 1,
        xp: 0,
        currentHp: 100,
        maxHp: 100,
        currentEnergy: 100,
        maxEnergy: 100,
        mood: "NEUTRAL",
        isInjured: false,
        isResting: false,
        streak: 0,
        lastActive: new Date("2024-01-01T10:00:00Z"),
        dailyDecree: null,
        memories: [],
        scars: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (prisma.user.findUnique as any).mockResolvedValue({
            id: "u1",
            subscriptionTier: "FREE",
        });
    });

    // ── getTitan ──────────────────────────────────────────────
    describe("getTitan", () => {
        it("should return titan with memories and scars", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);

            const result = await TitanService.getTitan("u1");

            expect(prisma.titan.findUnique).toHaveBeenCalledWith({
                where: { userId: "u1" },
                include: { memories: true, scars: true },
            });
            expect(result).toEqual(baseTitan);
        });

        it("should return null for non-existent titan", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(null);

            const result = await TitanService.getTitan("nonexistent");

            expect(result).toBeNull();
        });
    });

    // ── ensureTitan ───────────────────────────────────────────
    describe("ensureTitan", () => {
        it("should upsert with correct defaults", async () => {
            (prisma.titan.upsert as any).mockResolvedValue(baseTitan);

            await TitanService.ensureTitan("u1");

            expect(prisma.titan.upsert).toHaveBeenCalledWith({
                where: { userId: "u1" },
                update: {},
                create: expect.objectContaining({
                    userId: "u1",
                    name: "Iron Initiate",
                    level: 1,
                    xp: 0,
                    currentHp: 100,
                    maxHp: 100,
                    currentEnergy: 100,
                    maxEnergy: 100,
                    mood: "NEUTRAL",
                }),
            });
        });
    });

    // ── modifyHealth ──────────────────────────────────────────
    describe("modifyHealth", () => {
        it("should reduce HP correctly", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);
            (prisma.titan.update as any).mockResolvedValue({ ...baseTitan, currentHp: 70 });

            const result = await TitanService.modifyHealth("u1", -30, "combat");

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({
                    currentHp: 70,
                    isInjured: false,
                }),
            });
            expect(result.currentHp).toBe(70);
        });

        it("should clamp HP to 0 and mark injured", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);
            (prisma.titan.update as any).mockResolvedValue({
                ...baseTitan,
                currentHp: 0,
                isInjured: true,
                mood: "WEAKENED",
            });

            const result = await TitanService.modifyHealth("u1", -200, "fatal");

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({
                    currentHp: 0,
                    isInjured: true,
                    mood: "WEAKENED",
                }),
            });
            expect(result.currentHp).toBe(0);
        });

        it("should cap HP at maxHp when healing", async () => {
            const damagedTitan = { ...baseTitan, currentHp: 50 };
            (prisma.titan.findUnique as any).mockResolvedValue(damagedTitan);
            (prisma.titan.update as any).mockResolvedValue({ ...baseTitan, currentHp: 100 });

            await TitanService.modifyHealth("u1", 999, "full heal");

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({ currentHp: 100 }),
            });
        });

        it("should throw if titan not found", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(null);

            await expect(TitanService.modifyHealth("u1", -10, "test")).rejects.toThrow(
                "Titan not found"
            );
        });
    });

    // ── consumeEnergy ─────────────────────────────────────────
    describe("consumeEnergy", () => {
        it("should decrement energy", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);
            (prisma.titan.update as any).mockResolvedValue({ ...baseTitan, currentEnergy: 80 });

            const result = await TitanService.consumeEnergy("u1", 20);

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({
                    currentEnergy: { decrement: 20 },
                }),
            });
            expect(result.currentEnergy).toBe(80);
        });

        it("should throw if not enough energy", async () => {
            const lowEnergy = { ...baseTitan, currentEnergy: 5 };
            (prisma.titan.findUnique as any).mockResolvedValue(lowEnergy);

            await expect(TitanService.consumeEnergy("u1", 20)).rejects.toThrow(
                "Not enough energy"
            );
        });

        it("should throw if titan not found", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(null);

            await expect(TitanService.consumeEnergy("u1", 10)).rejects.toThrow(
                "Titan not found"
            );
        });
    });

    // ── syncWellness ──────────────────────────────────────────
    describe("syncWellness", () => {
        it("should set WEAKENED mood when bodyBattery is critically low", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);
            (prisma.titan.update as any).mockResolvedValue({
                ...baseTitan,
                currentEnergy: 20,
                mood: "WEAKENED",
                isResting: true,
            });

            await TitanService.syncWellness("u1", {
                bodyBattery: 20,
                sleepScore: 40,
                hrv: 25,
            });

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({
                    currentEnergy: 20,
                    mood: "WEAKENED",
                    isResting: false,
                }),
            });
        });

        it("should set FOCUSED mood when all metrics are excellent", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);
            (prisma.titan.update as any).mockResolvedValue({
                ...baseTitan,
                currentEnergy: 95,
                mood: "FOCUSED",
            });

            await TitanService.syncWellness("u1", {
                bodyBattery: 95,
                sleepScore: 90,
                hrv: 65,
            });

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({
                    currentEnergy: 95,
                    mood: "FOCUSED",
                }),
            });
        });

        it("should set isResting when bodyBattery is below 20", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(baseTitan);
            (prisma.titan.update as any).mockResolvedValue({
                ...baseTitan,
                isResting: true,
            });

            await TitanService.syncWellness("u1", {
                bodyBattery: 15,
                sleepScore: 30,
            });

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: "u1" },
                data: expect.objectContaining({ isResting: true }),
            });
        });

        it("should throw if titan not found", async () => {
            (prisma.titan.findUnique as any).mockResolvedValue(null);

            await expect(
                TitanService.syncWellness("u1", { bodyBattery: 50 })
            ).rejects.toThrow("Titan not found");
        });
    });

    // ── updateStreak ──────────────────────────────────────────
    describe("updateStreak", () => {
        beforeEach(() => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should increment streak if last active was yesterday", async () => {
            vi.setSystemTime(new Date("2024-01-02T12:00:00Z"));
            (prisma.titan.findUnique as any).mockResolvedValue({
                ...baseTitan,
                streak: 5,
                lastActive: new Date("2024-01-01T10:00:00Z"),
            });
            (prisma.titan.update as any).mockResolvedValue({
                ...baseTitan,
                streak: 6,
            });

            const result = await TitanService.updateStreak("u1", "UTC");

            expect(result.streak).toBe(6);
            expect(result.status).toBe("UPDATED");
        });

        it("should reset streak to 1 if missed a day", async () => {
            vi.setSystemTime(new Date("2024-01-05T12:00:00Z"));
            (prisma.titan.findUnique as any).mockResolvedValue({
                ...baseTitan,
                streak: 10,
                lastActive: new Date("2024-01-03T10:00:00Z"),
            });
            (prisma.titan.update as any).mockResolvedValue({
                ...baseTitan,
                streak: 1,
            });

            const result = await TitanService.updateStreak("u1", "UTC");

            expect(result.streak).toBe(1);
            expect(result.status).toBe("UPDATED");
        });

        it("should return SAME_DAY if already active today", async () => {
            vi.setSystemTime(new Date("2024-01-02T18:00:00Z"));
            (prisma.titan.findUnique as any).mockResolvedValue({
                ...baseTitan,
                streak: 5,
                lastActive: new Date("2024-01-02T10:00:00Z"),
            });

            const result = await TitanService.updateStreak("u1", "UTC");

            expect(result.streak).toBe(5);
            expect(result.status).toBe("SAME_DAY");
            expect(prisma.titan.update).not.toHaveBeenCalled();
        });

        it("should throw if titan not found", async () => {
            vi.setSystemTime(new Date("2024-01-02T12:00:00Z"));
            (prisma.titan.findUnique as any).mockResolvedValue(null);

            await expect(TitanService.updateStreak("u1")).rejects.toThrow(
                "Titan not found"
            );
        });
    });
});

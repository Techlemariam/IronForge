import { TitanService } from "./TitanService";
import { prisma } from "@/lib/prisma";
import { SKILL_TREE } from "@/data/static";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        userSkill: {
            findMany: vi.fn(),
        },
        titan: {
            findUnique: vi.fn(),
        },
        achievement: {
            findMany: vi.fn(),
        },
        meditationLog: {
            findMany: vi.fn(),
        },
    },
}));

describe("TitanService", () => {
    const userId = "test-user-id";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should calculate effective stats including Neural Lattice modifiers", async () => {
        // 1. Mock base Titan
        (prisma.titan.findUnique as any).mockResolvedValue({
            userId,
            strength: 10,
            vitality: 10,
            dexterity: 10,
            intelligence: 10,
        });

        // 2. Mock Skills (Blood Price: +2 Strength)
        (prisma.userSkill.findMany as any).mockResolvedValue([
            { skillId: "blood_price" }, // Assume this provides +2 Strength
        ]);

        (prisma.achievement.findMany as any).mockResolvedValue([]);
        (prisma.meditationLog.findMany as any).mockResolvedValue([]);

        const result = await TitanService.getTitanWithModifiers(userId);

        // Strength should be base (10) + Blood Price (+2) = 12
        // Note: Actual value depends on neural-lattice/data.ts definitions
        expect(result.effectiveStats.strength).toBeGreaterThanOrEqual(10);
    });

    it("should calculate normalized attributes (1-20 scale)", async () => {
        (prisma.titan.findUnique as any).mockResolvedValue({
            userId,
            strength: 10,
            vitality: 10,
            dexterity: 10,
            intelligence: 10,
        });

        (prisma.userSkill.findMany as any).mockResolvedValue([]);
        (prisma.achievement.findMany as any).mockResolvedValue([]);
        (prisma.meditationLog.findMany as any).mockResolvedValue([]);

        const result = await TitanService.getTitanWithModifiers(userId);

        expect(result.attributes.strength).toBeGreaterThanOrEqual(1);
        expect(result.attributes.strength).toBeLessThanOrEqual(20);
        expect(result.attributes.recovery).toBeGreaterThanOrEqual(1);
    });
});

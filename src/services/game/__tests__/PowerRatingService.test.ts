import { describe, it, expect, vi, beforeEach } from "vitest";
import { PowerRatingService } from "../PowerRatingService";
import prisma from "@/lib/prisma";
import { subDays, subWeeks, startOfWeek } from "date-fns";

vi.mock("@/lib/prisma", () => ({
    default: {
        exerciseLog: { findMany: vi.fn() },
        cardioLog: { findMany: vi.fn() },
    },
}));

describe("PowerRatingService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getConsecutiveWeeks", () => {
        it("should return 0 if no logs exist", async () => {
            vi.mocked(prisma.exerciseLog.findMany).mockResolvedValue([]);
            vi.mocked(prisma.cardioLog.findMany).mockResolvedValue([]);

            const weeks = await PowerRatingService.getConsecutiveWeeks("user-1");
            expect(weeks).toBe(0);
        });

        it("should count consecutive weeks from logs", async () => {
            const now = new Date();
            const lastWeek = subWeeks(now, 1);
            const twoWeeksAgo = subWeeks(now, 2);

            vi.mocked(prisma.exerciseLog.findMany).mockResolvedValue([
                { date: now },
                { date: lastWeek },
                { date: twoWeeksAgo }
            ] as any);
            vi.mocked(prisma.cardioLog.findMany).mockResolvedValue([]);

            const weeks = await PowerRatingService.getConsecutiveWeeks("user-1");
            expect(weeks).toBe(3);
        });

        it("should handle current week gap (still counting previous consecutive weeks)", async () => {
            const lastWeek = subWeeks(new Date(), 1);
            const twoWeeksAgo = subWeeks(new Date(), 2);

            vi.mocked(prisma.exerciseLog.findMany).mockResolvedValue([
                { date: lastWeek },
                { date: twoWeeksAgo }
            ] as any);
            vi.mocked(prisma.cardioLog.findMany).mockResolvedValue([]);

            const weeks = await PowerRatingService.getConsecutiveWeeks("user-1");
            expect(weeks).toBe(2);
        });

        it("should break streak on missing mid-week", async () => {
            const now = new Date();
            const threeWeeksAgo = subWeeks(now, 3);

            vi.mocked(prisma.exerciseLog.findMany).mockResolvedValue([
                { date: now },
                { date: threeWeeksAgo }
            ] as any);
            vi.mocked(prisma.cardioLog.findMany).mockResolvedValue([]);

            const weeks = await PowerRatingService.getConsecutiveWeeks("user-1");
            expect(weeks).toBe(1); // Only current week
        });
    });
});

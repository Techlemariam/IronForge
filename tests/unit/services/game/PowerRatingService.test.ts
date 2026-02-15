import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PowerRatingService } from '@/services/game/PowerRatingService';
import prisma from '@/lib/prisma';

describe('PowerRatingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (prisma.exerciseLog.findMany as any).mockClear();
        (prisma.cardioLog.findMany as any).mockClear();
        (prisma.user.findUnique as any).mockClear();
        (prisma.titan.update as any).mockClear();
    });

    describe('getWeeklyVolume', () => {
        it('calculates total volume correctly', async () => {
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }] }, // 1000kg
                { sets: [{ weight: 50, reps: 10 }] } // 500kg
            ]);

            const volume = await PowerRatingService.getWeeklyVolume('user1');
            expect(volume).toBe(1500);
        });

        it('handles missing or invalid sets gracefully', async () => {
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { sets: [] },
                { sets: "invalid_json" },
                { sets: [{ weight: null, reps: 5 }] }
            ]);

            const volume = await PowerRatingService.getWeeklyVolume('user1');
            expect(volume).toBe(0);
        });
    });

    describe('getWeeklyCardioDuration', () => {
        it('calculates duration in hours', async () => {
            (prisma.cardioLog.findMany as any).mockResolvedValue([
                { duration: 3600 }, // 1 hour
                { duration: 1800 }  // 0.5 hour
            ]);

            const hours = await PowerRatingService.getWeeklyCardioDuration('user1');
            expect(hours).toBe(1.5);
        });
    });

    describe('getConsecutiveWeeks', () => {
        it('calculates streak correctly for active users', async () => {
            // Mock dates for 3 consecutive weeks
            // Use a fixed Monday to perfectly align with ISO week logic (weekStartsOn: 1)
            const { subWeeks, startOfWeek } = await import('date-fns');
            const now = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

            const w1 = now;
            const w2 = subWeeks(now, 1);
            const w3 = subWeeks(now, 2);

            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { date: w1 },
                { date: w2 }
            ]);
            (prisma.cardioLog.findMany as any).mockResolvedValue([
                { date: w3 }
            ]);

            const streak = await PowerRatingService.getConsecutiveWeeks('user1');
            expect(streak).toBe(3);
        });

        it('maintains streak if current week has no data but last week does (grace period)', async () => {
            const { subWeeks, startOfWeek } = await import('date-fns');
            const now = startOfWeek(new Date(), { weekStartsOn: 1 });
            const lastWeek = subWeeks(now, 1);
            const twoWeeksAgo = subWeeks(now, 2);

            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { date: lastWeek },
                { date: twoWeeksAgo }
            ]);
            (prisma.cardioLog.findMany as any).mockResolvedValue([]);

            const streak = await PowerRatingService.getConsecutiveWeeks('user1');
            expect(streak).toBe(2); // Last week + week before
        });

        it('resets streak if there is a gap', async () => {
            const { subWeeks } = await import('date-fns');
            const threeWeeksAgo = subWeeks(new Date(), 3);

            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { date: threeWeeksAgo }
            ]);
            (prisma.cardioLog.findMany as any).mockResolvedValue([]);

            const streak = await PowerRatingService.getConsecutiveWeeks('user1');
            expect(streak).toBe(0);
        });
    });

    describe('syncPowerRating', () => {
        it('calculates full power rating and updates titan', async () => {
            // 1. Mock User & Titan
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user1',
                loginStreak: 21, // 3 weeks
                ftpCycle: 300,
                pvpProfile: { highestWilksScore: 400 },
                titan: { id: 'titan1' }
            });

            // Reset Mock to match test scenario
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user1',
                loginStreak: 21,
                ftpCycle: 200, // FTP for Cardio
                pvpProfile: { highestWilksScore: 150 }, // Wilks for Strength
                titan: { id: 'titan1' }
            });

            // Mock Volume (100,000 total)
            const threeWeeksAgo = new Date();
            threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { date: oneWeekAgo, sets: [{ weight: 100, reps: 500 }] }, // 50,000 kg
                { date: twoWeeksAgo, sets: [{ weight: 100, reps: 500 }] }  // 50,000 kg
            ]);

            // Mock Cardio (4 hours)
            (prisma.cardioLog.findMany as any).mockResolvedValue([
                { date: threeWeeksAgo, duration: 4 * 3600 }
            ]);

            const result = await PowerRatingService.syncPowerRating('user1');

            // Assertions
            expect(result.weeklyVolume).toBe(100000);
            expect(result.weeklyDuration).toBe(4);
            expect(result.strengthIndex).toBe(1600);
            expect(result.cardioIndex).toBe(1000);

            // 1300 * 1.03 = 1339
            expect(result.powerRating).toBe(1339);

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                data: expect.objectContaining({
                    powerRating: 1339,
                    strengthIndex: 1600,
                    cardioIndex: 1000
                })
            });
        });
    });
});

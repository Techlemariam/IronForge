import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PowerRatingService } from '@/services/game/PowerRatingService';
import prisma from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        exerciseLog: { findMany: vi.fn() },
        cardioLog: { findMany: vi.fn() },
        user: { findUnique: vi.fn() },
        titan: { update: vi.fn() },
    }
}));

describe('PowerRatingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { sets: [{ weight: 100, reps: 1000 }] } // 100,000 kg
            ]);

            // Mock Cardio (4 hours)
            (prisma.cardioLog.findMany as any).mockResolvedValue([
                { duration: 4 * 3600 }
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

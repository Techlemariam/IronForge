
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GrowthMetricsService } from '@/services/analytics/GrowthMetricsService';
import prisma from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe('GrowthMetricsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getRecurringUserCount', () => {
        it('should count users active in last 7 days', async () => {
            (prisma.user.count as any).mockResolvedValue(55);
            const count = await GrowthMetricsService.getRecurringUserCount();
            expect(count).toBe(55);
            expect(prisma.user.count).toHaveBeenCalledWith(expect.objectContaining({
                where: { lastLoginDate: { gte: expect.any(Date) } }
            }));
        });
    });

    describe('getRetentionRate', () => {
        it('should calculate retention correctly', async () => {
            // Mock last week users (Current Active)
            (prisma.user.findMany as any)
                .mockResolvedValueOnce([{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]) // Last Week
                .mockResolvedValueOnce([{ id: 'u1' }, { id: 'u2' }, { id: 'u4' }, { id: 'u5' }]); // Previous Week

            // u1, u2 are retained. u4, u5 churned. u3 is new.
            // Previous week total: 4. Retained: 2. Rate: 50%.

            const rate = await GrowthMetricsService.getRetentionRate();
            expect(rate).toBe(50);
        });

        it('should return 0 if no users in previous week', async () => {
            (prisma.user.findMany as any)
                .mockResolvedValueOnce([{ id: 'u1' }])
                .mockResolvedValueOnce([]);

            const rate = await GrowthMetricsService.getRetentionRate();
            expect(rate).toBe(0);
        });
    });

    describe('getSocialEngagement', () => {
        it('should count users with accepted friendships', async () => {
            (prisma.user.count as any)
                .mockResolvedValueOnce(100) // Total users
                .mockResolvedValueOnce(25); // Users with friends

            const result = await GrowthMetricsService.getSocialEngagement();
            expect(result).toEqual({
                usersWithFriends: 25,
                totalUsers: 100,
                rate: 25
            });

            // Verify query structure check for friendshipsA OR friendshipsB
            expect(prisma.user.count).toHaveBeenCalledWith(expect.objectContaining({
                where: { OR: expect.any(Array) }
            }));
        });

        it('should return 0s if no users exist', async () => {
            (prisma.user.count as any).mockResolvedValue(0);
            const result = await GrowthMetricsService.getSocialEngagement();
            expect(result).toEqual({ usersWithFriends: 0, totalUsers: 0, rate: 0 });
        });
    });

    describe('getActivationRate', () => {
        it('should calculate activation rate based on 24h log window', async () => {
            (prisma.user.count as any).mockResolvedValue(4); // Total users

            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Mock users with logs
            (prisma.user.findMany as any).mockResolvedValue([
                // ACTIVATED: Logged 1 hour after creation
                {
                    id: 'u1',
                    createdAt: yesterday,
                    exerciseLogs: [{ date: new Date(yesterday.getTime() + 1000 * 60 * 60) }]
                },
                // NOT ACTIVATED: Logged 25 hours after creation
                {
                    id: 'u2',
                    createdAt: yesterday,
                    exerciseLogs: [{ date: new Date(yesterday.getTime() + 25 * 60 * 60 * 1000) }]
                },
                // NOT ACTIVATED: No logs
                {
                    id: 'u3',
                    createdAt: yesterday,
                    exerciseLogs: []
                },
                // ACTIVATED: Logged instantly
                {
                    id: 'u4',
                    createdAt: now,
                    exerciseLogs: [{ date: now }]
                },
            ]);

            // 2 activated out of 4 total users = 50%
            const rate = await GrowthMetricsService.getActivationRate();
            expect(rate).toBe(50);
        });
    });
});

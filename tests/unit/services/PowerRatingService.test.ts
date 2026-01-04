import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PowerRatingService } from '@/services/game/PowerRatingService';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    default: {
        exerciseLog: { findMany: vi.fn() },
        cardioLog: { findMany: vi.fn() },
        user: { findUnique: vi.fn() },
        titan: { update: vi.fn() },
        weeklyPlan: { findFirst: vi.fn() }
    }
}));

describe('PowerRatingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default: No Plan found -> Fallback MVP logic
        (prisma.weeklyPlan.findFirst as any).mockResolvedValue(null);
    });

    describe('Adherence', () => {
        it('calculates strength adherence correctly (Fallback)', async () => {
            // Mock logs for 3 distinct days
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { date: new Date('2024-01-01') },
                { date: new Date('2024-01-01') }, // Same day
                { date: new Date('2024-01-03') },
                { date: new Date('2024-01-05') },
            ]);

            const adhe = await PowerRatingService.calculateStrengthAdherence('user1');
            // Fallback Target: 3 sessions/week * 2 weeks = 6 sessions
            // Actual: 3 sessions
            // 3 / 6 = 0.5
            expect(adhe).toBe(0.5);
        });

        it('calculates strength adherence correctly (With Plan)', async () => {
            // Mock Weekly Plan: 5 training days defined
            (prisma.weeklyPlan.findFirst as any).mockResolvedValue({
                plan: [
                    { isRestDay: false }, { isRestDay: false }, { isRestDay: true },
                    { isRestDay: false }, { isRestDay: false }, { isRestDay: false }, { isRestDay: true }
                ] // 5 days planned
            });

            // Mock logs for 5 distinct days
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                { date: new Date('2024-01-01') },
                { date: new Date('2024-01-02') },
                { date: new Date('2024-01-03') },
                { date: new Date('2024-01-04') },
                { date: new Date('2024-01-05') },
            ]);

            const adhe = await PowerRatingService.calculateStrengthAdherence('user1');

            // Logic: 5 planned days. Strength Target (60%) = ceil(5*0.6) = 3 sessions/week
            // 2 weeks * 3 = 6 target sessions
            // Actual: 5 sessions
            // 5 / 6 = 0.833
            expect(adhe).toBeCloseTo(0.833, 2);
        });

        it('caps adherence at 1.1', async () => {
            // Mock logs for 7 distinct days
            const logs = Array(7).fill(0).map((_, i) => ({
                date: new Date(new Date().setDate(new Date().getDate() - i))
            }));
            (prisma.exerciseLog.findMany as any).mockResolvedValue(logs);

            // Fallback target: 6 sessions (2 weeks * 3)
            // Actual: 7 sessions
            // 7 / 6 = 1.166 -> Cap at 1.1
            const adhe = await PowerRatingService.calculateStrengthAdherence('user1');
            expect(adhe).toBe(1.1);
        });
    });

    describe('syncPowerRating', () => {
        it('calculates and updates titan', async () => {
            // Mock User
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user1',
                bodyWeight: 80,
                ftpCycle: 240, // 3.0 W/kg
                activePath: 'WARDEN',
                pvpProfile: { highestWilksScore: 300 },
                titan: { id: 'titan1' }
            });

            // Mock Adherence Logs (100% adherence)
            // Strength: 6 days (matches fallback target 6)
            (prisma.exerciseLog.findMany as any).mockResolvedValue(
                Array(6).fill(0).map((_, i) => ({ date: new Date(2024, 0, i + 1) }))
            );
            // Cardio: 4 days (matches fallback target 4)
            (prisma.cardioLog.findMany as any).mockResolvedValue(
                Array(4).fill(0).map((_, i) => ({ date: new Date(2024, 0, i + 1) }))
            );

            // Mock Update
            (prisma.titan.update as any).mockResolvedValue({ powerRating: 123 });

            const result = await PowerRatingService.syncPowerRating('user1');

            expect(prisma.titan.update).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                data: expect.objectContaining({
                    mrvAdherence: 1.15, // 1.0 + 0.15 bonus
                    lastPowerCalcAt: expect.any(Date)
                })
            });

            // Wilks 300 -> Norm 250 (Midpoint 200-600 is 400 range. 300-200=100. 100/400=0.25 -> 250)
            // W/kg 3.0 -> Norm 428 (1.5-5.0 range=3.5. 3.0-1.5=1.5. 1.5/3.5 = 0.428 -> 428)
            // Warden 50/50 -> (250*0.5 + 428*0.5) = 125 + 214 = 339
            // Bonus 1.15 -> 339 * 1.15 = 390
            expect(result.powerRating).toBeCloseTo(390, -1);
        });
    });
});

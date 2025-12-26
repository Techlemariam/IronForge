
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressionService } from '../progression';
import prisma from '@/lib/prisma';
import { calculateWilks } from '@/utils/wilks';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
        exerciseLog: {
            findFirst: vi.fn(),
        },
        pvpProfile: {
            upsert: vi.fn(),
        },
    },
}));

describe('ProgressionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateWilksScore', () => {
        it('should calculate and update Wilks score correctly', async () => {
            // 1. Mock User (75kg Male)
            (prisma.user.findUnique as any).mockResolvedValue({ bodyWeight: 75.0 });

            // 2. Mock Lifts
            // Best Lifts: Squat 100, Bench 80, Deadlift 140 = 320 Total
            const mockLifts = {
                'Squat': 100,
                'Bench': 80,
                'Deadlift': 140
            };

            (prisma.exerciseLog.findFirst as any).mockImplementation((args: any) => {
                const orClauses = args.where.OR || [];
                const isSquat = orClauses.some((c: any) => c.exerciseId?.contains?.includes('Squat'));
                const isBench = orClauses.some((c: any) => c.exerciseId?.contains?.includes('Bench'));
                const isDeadlift = orClauses.some((c: any) => c.exerciseId?.contains?.includes('Deadlift'));

                if (isSquat) return { e1rm: 100 };
                if (isBench) return { e1rm: 80 };
                if (isDeadlift) return { e1rm: 140 };
                return null;
            });

            // 3. Run
            const wilks = await ProgressionService.updateWilksScore('user-123');

            // 4. Verify Calculation
            // 320kg @ 75kg bw male ~ 228.57
            const expected = calculateWilks({ weightLifted: 320, bodyWeight: 75.0, sex: 'male' });
            expect(wilks).toBeCloseTo(expected, 1);

            // 5. Verify DB Update
            expect(prisma.pvpProfile.upsert).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                create: expect.objectContaining({ highestWilksScore: wilks }),
                update: expect.objectContaining({ highestWilksScore: wilks })
            });
        });

        it('should handle zero lifts', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ bodyWeight: 75.0 });
            (prisma.exerciseLog.findFirst as any).mockResolvedValue(null);

            const wilks = await ProgressionService.updateWilksScore('user-123');
            expect(wilks).toBe(0);
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as periodizationActions from '@/actions/training/periodization';
import { prisma } from '@/lib/prisma';
import {
    calculateVolumeL3,
    wellnessToRecoveryFactor
} from '@/utils/volumeCalculatorEnhanced';

// Mock DB
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: { findUnique: vi.fn() }
    }
}));

// Mock Utils
vi.mock('@/utils/volumeCalculatorEnhanced', () => ({
    calculateVolumeL3: vi.fn(),
    wellnessToRecoveryFactor: vi.fn()
}));

describe('Periodization Actions', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generatePeriodizationPlanAction', () => {
        it('should generate plan for HYPERTROPHY week 1', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ titan: { level: 5 } }); // Beginner
            (calculateVolumeL3 as any).mockReturnValue({ optimal: 10 });

            const result = await periodizationActions.generatePeriodizationPlanAction('u1', 'HYPERTROPHY', 1);

            expect(result.currentPhase).toBe('ACCUMULATION');
            expect(result.weekInPhase).toBe(1);
            // Hypertrophy AccMultiplier is 1.2. 10 * 1.2 = 12
            expect(result.recommendations.targetVolume['chest']).toBe(12);
        });

        it('should resolve correct phase for later weeks', async () => {
            // Hypertrophy: Acc (4w), Int (3w). Week 5 should be Intensification Week 1.
            (prisma.user.findUnique as any).mockResolvedValue({ titan: { level: 20 } });
            (calculateVolumeL3 as any).mockReturnValue({ optimal: 10 });

            const result = await periodizationActions.generatePeriodizationPlanAction('u1', 'HYPERTROPHY', 5);

            expect(result.currentPhase).toBe('INTENSIFICATION');
            expect(result.weekInPhase).toBe(1);
            // IntMultiplier is 1.0. 10 * 1.0 = 10
            expect(result.recommendations.targetVolume['chest']).toBe(10);
        });
    });

    describe('adaptPlanToWellnessAction', () => {
        it('should reduce volume on low recovery', async () => {
            (wellnessToRecoveryFactor as any).mockReturnValue(0.7);

            const startPlan: any = {
                recommendations: {
                    targetVolume: { chest: 10 },
                    targetRpe: 8,
                    notes: []
                }
            };

            const result = await periodizationActions.adaptPlanToWellnessAction('u1', startPlan, 50, 80);

            // 10 * 0.7 = 7
            expect(result.recommendations.targetVolume['chest']).toBe(7);
            expect(result.recommendations.targetRpe).toBe(7); // 8 - 1
            expect(result.recommendations.notes[0]).toContain('Low wellness');
        });

        it('should keep plan on neutral recovery', async () => {
            (wellnessToRecoveryFactor as any).mockReturnValue(1.0);

            const startPlan: any = {
                recommendations: {
                    targetVolume: { chest: 10 },
                    targetRpe: 8,
                    notes: []
                }
            };

            const result = await periodizationActions.adaptPlanToWellnessAction('u1', startPlan, 80, 50);

            expect(result.recommendations.targetVolume['chest']).toBe(10);
            expect(result.recommendations.targetRpe).toBe(8);
            expect(result.recommendations.notes).toHaveLength(0);
        });
    });

    describe('getRecommendedGoalAction', () => {
        it('should return HYPERTROPHY for beginners', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ titan: { level: 10 } });
            const result = await periodizationActions.getRecommendedGoalAction('u1');
            expect(result).toBe('HYPERTROPHY');
        });

        it('should return STRENGTH for intermediates', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ titan: { level: 25 } });
            const result = await periodizationActions.getRecommendedGoalAction('u1');
            expect(result).toBe('STRENGTH');
        });
    });
});

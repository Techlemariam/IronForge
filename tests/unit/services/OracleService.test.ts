import { describe, it, expect } from 'vitest';
import { OracleService } from '@/services/oracle';
import { WardensManifest, SystemMetrics } from '@/types/goals';

describe('OracleService', () => {
    describe('generateTrainingStrategy', () => {
        it('should generate strategy with DELOAD phase when metrics indicate fatigue', () => {
            const manifest: WardensManifest = {
                userId: 'test-user',
                goals: [{ goal: 'FITNESS', weight: 1.0 }],
                phase: 'BALANCED',
                phaseStartDate: new Date(),
                phaseWeek: 1,
                autoRotate: true,
                consents: { healthData: true, leaderboard: true }
            };

            const metrics: SystemMetrics = {
                hrv: 30, // Low HRV
                hrvBaseline: 50,
                tsb: -50, // Very fatigued
                atl: 100,
                ctl: 80,
                acwr: 1.6, // High ratio
                sleepScore: 40,
                soreness: 8,
                mood: 'EXHAUSTED',
                consecutiveStalls: 0
            };

            const strategy = OracleService.generateTrainingStrategy(manifest, metrics);

            expect(strategy.phase).toBe('DELOAD');
            expect(strategy.contextSummary).toContain('DELOAD');
        });

        it('should recommend workouts based on phase', () => {
            const manifest: WardensManifest = {
                userId: 'test-user',
                goals: [{ goal: 'STRENGTH', weight: 1.0 }],
                phase: 'STRENGTH_BUILD',
                phaseStartDate: new Date(),
                phaseWeek: 2,
                autoRotate: true,
                consents: { healthData: true, leaderboard: true }
            };

            const metrics: SystemMetrics = {
                hrv: 55,
                hrvBaseline: 50,
                tsb: 5,
                atl: 50,
                ctl: 60,
                acwr: 1.0,
                sleepScore: 80,
                soreness: 3,
                mood: 'NORMAL',
                consecutiveStalls: 0
            };

            const strategy = OracleService.generateTrainingStrategy(manifest, metrics);

            expect(strategy.phase).toBe('STRENGTH_BUILD');
            expect(strategy.recommendedWorkouts).toBeDefined();
            expect(Array.isArray(strategy.recommendedWorkouts)).toBe(true);
        });
    });
});

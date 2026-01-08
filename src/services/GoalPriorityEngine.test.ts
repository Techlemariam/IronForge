import { describe, it, expect } from 'vitest';
import { GoalPriorityEngine } from './GoalPriorityEngine';
import { WardensManifest, SystemMetrics, MacroPhase } from '@/types/goals';

describe('GoalPriorityEngine', () => {
    const mockManifest: WardensManifest = {
        userId: 'user-1',
        goals: [{ goal: 'VO2MAX', weight: 1.0 }],
        phase: 'BALANCED',
        phaseStartDate: new Date(),
        phaseWeek: 1,
        autoRotate: true,
        consents: { healthData: true, leaderboard: true }
    };

    const mockMetrics: SystemMetrics = {
        hrv: 50,
        hrvBaseline: 50,
        tsb: 0,
        atl: 50,
        ctl: 50,
        acwr: 1.0,
        sleepScore: 80,
        soreness: 3,
        mood: 'NORMAL',
        consecutiveStalls: 0
    };

    describe('selectPhase', () => {
        it('should trigger DELOAD if metrics indicate crash', () => {
            const crashedMetrics = { ...mockMetrics, hrv: 30, hrvBaseline: 50 }; // 30 < 37.5 (75%)
            const phase = GoalPriorityEngine.selectPhase(mockManifest, crashedMetrics);
            expect(phase).toBe('DELOAD');
        });

        it('should respect upcoming deadline', () => {
            const deadlineManifest = {
                ...mockManifest,
                goals: [{ goal: 'VO2MAX' as const, weight: 1.0, deadline: new Date(Date.now() + 86400000 * 10) }] // 10 days
            };
            const phase = GoalPriorityEngine.selectPhase(deadlineManifest, mockMetrics);
            expect(phase).toBe('PEAK');
        });

        it('should return to CARDIO_BUILD after DELOAD if fresh', () => {
            const deloadManifest = { ...mockManifest, phase: 'DELOAD' as MacroPhase };
            const freshMetrics = { ...mockMetrics, tsb: 10 };
            const phase = GoalPriorityEngine.selectPhase(deloadManifest, freshMetrics);
            expect(phase).toBe('CARDIO_BUILD');
        });

        it('should rotate to STRENGTH_BUILD if Cardio Goal stalls', () => {
            const stalledManifest = { ...mockManifest, phaseWeek: 5 };
            const stalledMetrics = { ...mockMetrics, consecutiveStalls: 3 };
            const phase = GoalPriorityEngine.selectPhase(stalledManifest, stalledMetrics);
            expect(phase).toBe('STRENGTH_BUILD');
        });
    });

    describe('calculateWeeklyTargets', () => {
        it('should provide correct balanced targets for base fitness', () => {
            const result = GoalPriorityEngine.calculateWeeklyTargets(mockManifest, 'BALANCED', mockMetrics);
            // CTL 50 -> Base 6h
            // BALANCED: 45% Strength, 45% Cardio
            // BioModifier: 1.0
            // Strength: 6 * 0.45 = 2.7
            expect(result.strengthHours).toBe(2.7);
            expect(result.cardioHours).toBe(2.7);
        });

        it('should taper volume during PEAK phase', () => {
            const result = GoalPriorityEngine.calculateWeeklyTargets(
                { ...mockManifest, phaseWeek: 2 },
                'PEAK',
                mockMetrics
            );
            // CTL 50 -> Base 6h
            // PEAK: 30% Strength (1.8h), 50% Cardio (3.0h)
            // Taper: 1.0 - (2 * 0.1) = 0.8 modifier
            // Strength: 1.8 * 0.8 = 1.44 -> toFixed(1) -> 1.4
            // Cardio: 3.0 * 0.8 = 2.40 -> toFixed(1) -> 2.4
            expect(result.strengthHours).toBe(1.4);
            expect(result.cardioHours).toBe(2.4);
        });
    });
});

import { describe, it, expect } from 'vitest';
import { TrainingMemoryManager } from '../trainingMemoryManager';
import { TrainingActivity, SystemMetrics } from '../../types/training';
import { MACRO_CYCLE_THRESHOLDS } from '../../data/builds';

describe('TrainingMemoryManager', () => {

    describe('getSystemLoad', () => {
        it('should calculate load correctly for mixed activities', () => {
            const activities: TrainingActivity[] = [
                { name: 'Heavy Squats', type: 'STRENGTH', intensity: 'HIGH', currentVolume: 10, targets: { mrv: 20, mev: 5, mav: 15, mv: 5 }, resourceCost: { CNS: 10, MUSCULAR: 10, METABOLIC: 5 } },
                { name: 'Recovery Ride', type: 'CARDIO_ZONE2', intensity: 'LOW', currentVolume: 30, targets: { mrv: 60, mev: 10, mav: 40, mv: 10 }, resourceCost: { CNS: 2, MUSCULAR: 2, METABOLIC: 5 } }
            ];

            // Activity 1: (10/20) * 1.5 = 0.5 * 1.5 = 0.75
            // Activity 2: (30/60) * 0.5 = 0.5 * 0.5 = 0.25
            // Total = 1.0 (100%)
            const load = TrainingMemoryManager.getSystemLoad(activities);
            expect(load).toBe(100);
        });
    });

    describe('evaluateTransition', () => {
        const baseMetrics: SystemMetrics = {
            ctl: 30, atl: 30, tsb: 0, hrv: 50, sleepScore: 80, bodyBattery: 80,
            strengthDelta: 5 // Positive strength gain
        };

        it('should trigger GAMMA transition on critically low TSB', () => {
            const metrics = { ...baseMetrics, tsb: MACRO_CYCLE_THRESHOLDS.GAMMA_TSB_THRESHOLD - 5 };
            const result = TrainingMemoryManager.evaluateTransition(metrics, 'ALPHA');

            expect(result.shouldTransition).toBe(true);
            expect(result.recommendedCycle).toBe('GAMMA');
        });

        it('should trigger BETA transition from ALPHA if base is built', () => {
            const metrics = {
                ...baseMetrics,
                ctl: MACRO_CYCLE_THRESHOLDS.BETA_CTL_THRESHOLD + 5,
                tsb: MACRO_CYCLE_THRESHOLDS.BETA_TSB_THRESHOLD + 5
            };
            const result = TrainingMemoryManager.evaluateTransition(metrics, 'ALPHA');

            expect(result.shouldTransition).toBe(true);
            expect(result.recommendedCycle).toBe('BETA');
        });

        it('should trigger ALPHA transition from BETA if strength plateaus', () => {
            const metrics = {
                ...baseMetrics,
                strengthDelta: 0, // Plateau
                atl: 50, ctl: 40 // Fatigue high
            };
            const result = TrainingMemoryManager.evaluateTransition(metrics, 'BETA');

            expect(result.shouldTransition).toBe(true);
            expect(result.recommendedCycle).toBe('ALPHA');
        });
    });

    describe('shouldEnterSurvivalMode', () => {
        const healthyMetrics: SystemMetrics = { ctl: 40, atl: 40, tsb: 0, hrv: 50, sleepScore: 80, bodyBattery: 80, strengthDelta: 0 };

        it('should return false for healthy metrics', () => {
            expect(TrainingMemoryManager.shouldEnterSurvivalMode(healthyMetrics)).toBe(false);
        });

        it('should return true if multiple debuffs are active (Poor Sleep + Low HRV)', () => {
            const sickMetrics = {
                ...healthyMetrics,
                sleepScore: MACRO_CYCLE_THRESHOLDS.SLEEP_DEBUFF_THRESHOLD - 1,
                hrv: MACRO_CYCLE_THRESHOLDS.HRV_DEBUFF_THRESHOLD - 1
            };
            expect(TrainingMemoryManager.shouldEnterSurvivalMode(sickMetrics)).toBe(true);
        });

        it('should return true if TSB is critical', () => {
            const tiredMetrics = {
                ...healthyMetrics,
                tsb: MACRO_CYCLE_THRESHOLDS.GAMMA_TSB_THRESHOLD - 10
            };
            expect(TrainingMemoryManager.shouldEnterSurvivalMode(tiredMetrics)).toBe(true);
        });
    });

    describe('getRewardMultiplier', () => {
        it('should return bonus for matching path', () => {
            const mult = TrainingMemoryManager.getRewardMultiplier('IRON_JUGGERNAUT', 'IRON_JUGGERNAUT');
            expect(mult).toBeGreaterThan(1.0);
        });

        it('should return 1.0 for mismatched path', () => {
            const mult = TrainingMemoryManager.getRewardMultiplier('ENGINE', 'IRON_JUGGERNAUT');
            expect(mult).toBe(1.0);
        });

        it('should return 1.0 for null quest path', () => {
            const mult = TrainingMemoryManager.getRewardMultiplier(null, 'IRON_JUGGERNAUT');
            expect(mult).toBe(1.0);
        });
    });

    describe('calculateDebuffs', () => {
        it('should return empty list for good metrics', () => {
            const debuffs = TrainingMemoryManager.calculateDebuffs(100, 100);
            expect(debuffs).toHaveLength(0);
        });

        it('should return sleep debuff for poor sleep', () => {
            const debuffs = TrainingMemoryManager.calculateDebuffs(MACRO_CYCLE_THRESHOLDS.SLEEP_DEBUFF_THRESHOLD - 10, 100);
            expect(debuffs).toHaveLength(1);
            expect(debuffs[0].source).toBe('SLEEP');
        });

        it('should return multiple debuffs for combined issues', () => {
            const debuffs = TrainingMemoryManager.calculateDebuffs(
                MACRO_CYCLE_THRESHOLDS.SLEEP_DEBUFF_THRESHOLD - 10,
                MACRO_CYCLE_THRESHOLDS.HRV_DEBUFF_THRESHOLD - 10
            );
            expect(debuffs).toHaveLength(2);
        });
    });

    describe('canAllocateHighIntensity', () => {
        const lightActivity: TrainingActivity = {
            name: 'Walk', type: 'CARDIO_ZONE2', intensity: 'LOW',
            currentVolume: 10, targets: { mrv: 100, mev: 0, mav: 0, mv: 0 },
            resourceCost: { CNS: 1, MUSCULAR: 1, METABOLIC: 1 }
        };

        it('should allow high intensity when load is low and capacity is full', () => {
            // Load = (10/100)*0.5 * 100 = 5%
            expect(TrainingMemoryManager.canAllocateHighIntensity([lightActivity], [])).toBe(true);
        });

        it('should deny high intensity when capacity is heavily debuffed', () => {
            const heavyActivity: TrainingActivity = {
                name: 'Run', type: 'CARDIO_ZONE5', intensity: 'HIGH',
                currentVolume: 60, targets: { mrv: 100, mev: 0, mav: 0, mv: 0 },
                resourceCost: { CNS: 20, MUSCULAR: 20, METABOLIC: 20 }
            };

            const debuffs = [{ multiplier: 0.5, reason: 'Severe Sleep Deprivation', source: 'SLEEP' as const }];

            expect(TrainingMemoryManager.canAllocateHighIntensity([heavyActivity], debuffs)).toBe(false);
        });
    });

});

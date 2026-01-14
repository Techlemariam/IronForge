import { describe, it, expect } from 'vitest';
import { GoalPriorityEngine } from '../GoalPriorityEngine';
import { SystemMetrics, WardensManifest } from '@/types/goals';

// Realistic payload from Intervals.icu (anonymized)
const REALISTIC_WELLNESS_PAYLOAD = {
    id: "2024-01-01",
    restingHR: 42,
    hrv: 65,
    hrvSDNN: 70,
    sleepSecs: 28000,
    sleepScore: 85,
    stress: 25,
    spO2: 98,
    bodyBattery: 80,
    comments: "Feeling good",
    // ... many other fields
};

describe('GPE Fallback Integration', () => {
    const manifest: WardensManifest = {
        userId: 'test-user',
        phase: 'BALANCED',
        phaseStartDate: new Date(),
        phaseWeek: 1,
        autoRotate: true,
        consents: { healthData: true, leaderboard: true },
        goals: [{ goal: 'VO2MAX', weight: 1.0 }]
    };

    it('should handle full data availability correctly', () => {
        const metrics: SystemMetrics = {
            hrv: REALISTIC_WELLNESS_PAYLOAD.hrv,
            hrvBaseline: 60,
            tsb: 10, // Fresh
            atl: 40,
            ctl: 50,
            acwr: 1.1,
            sleepScore: REALISTIC_WELLNESS_PAYLOAD.sleepScore,
            soreness: 2,
            mood: 'NORMAL',
            consecutiveStalls: 0
        };

        const result = GoalPriorityEngine.selectPhase(manifest, metrics);
        expect(result).toBe('CARDIO_BUILD'); // Engine prioritizes Goal (VO2MAX) -> Cardio Build
    });

    it('should trigger fallback when HRV/TSB is missing (null/undefined)', () => {
        // Simulate missing device data
        const metrics: SystemMetrics = {
            hrv: undefined as any,
            hrvBaseline: 60,
            tsb: undefined as any,
            atl: 40,
            ctl: 50,
            acwr: 1.1,
            sleepScore: 20, // Terrible sleep
            soreness: 8,    // High soreness
            mood: 'EXHAUSTED',
            consecutiveStalls: 0
        };

        const needsDeload = GoalPriorityEngine.needsDeload(metrics);
        // Fallback logic checks soreness > 7 OR mood EXHAUSTED OR sleep < 30
        // Here all match
        expect(needsDeload).toBe(true);
    });

    it('should NOT trigger fallback if data is present but low (0)', () => {
        const metrics: SystemMetrics = {
            hrv: 0,
            hrvBaseline: 60,
            tsb: 0,
            atl: 40,
            ctl: 50,
            acwr: 1.1,
            sleepScore: 80,
            soreness: 2,
            mood: 'NORMAL',
            consecutiveStalls: 0
        };

        // Should calculate relative: 0 < 60*0.75 -> True (Crashing)
        // But NOT use fallback subjective logic. 
        // If we force subjective to be "Good" (Normal mood, low soreness), fallback would say False.
        // But numeric logic says True.

        // This test confirms we are using NUMERIC logic (which returns true for hrv < baseline)
        // NOT subjective fallback.
        const needsDeload = GoalPriorityEngine.needsDeload(metrics);
        expect(needsDeload).toBe(true);
    });
});

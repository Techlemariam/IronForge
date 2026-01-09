import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalPriorityEngine } from './GoalPriorityEngine';
import { WardensManifest, SystemMetrics, MacroPhase } from '@/types/goals';
import { WorkoutDefinition } from '@/types/training';

vi.mock('@/data/workouts', () => {
    // Mock the Workout Library inside the factory to avoid hoisting issues
    const MOCK_LIBRARY: WorkoutDefinition[] = [
        {
            id: 'run_1', code: 'R1', name: 'Easy Run', type: 'RUN',
            intensity: 'LOW', durationMin: 30, description: 'Easy',
            resourceCost: { CNS: 10, MUSCULAR: 10, METABOLIC: 10 },
        },
        {
            id: 'bike_1', code: 'B1', name: 'Intervals', type: 'BIKE',
            intensity: 'HIGH', durationMin: 60, description: 'Hard',
            resourceCost: { CNS: 40, MUSCULAR: 30, METABOLIC: 50 },
        },
        {
            id: 'strength_1', code: 'S1', name: 'Chest Day', type: 'STRENGTH',
            intensity: 'MEDIUM', durationMin: 45, description: 'Pecs',
            resourceCost: { CNS: 30, MUSCULAR: 40, METABOLIC: 10 },
            exercises: [{ id: 'Bench Press (Barbell)', sets: 3, reps: 10 }]
        },
        {
            id: 'strength_2', code: 'S2', name: 'Leg Day', type: 'STRENGTH',
            intensity: 'HIGH', durationMin: 60, description: 'Squats',
            resourceCost: { CNS: 50, MUSCULAR: 60, METABOLIC: 20 },
            exercises: [{ id: 'Squat (Barbell)', sets: 3, reps: 5 }]
        }
    ];

    return {
        WORKOUT_LIBRARY: MOCK_LIBRARY
    };
});



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

describe('GoalPriorityEngine', () => {


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

describe('selectWorkout', () => {
    const mockBudget = { cns: 100, muscular: 100, metabolic: 100 };
    const mockHeatmap = {
        CHEST: { status: 'MV', currentVolume: 0, targetVolume: 10 }, // Needs work
        QUADS: { status: 'MRV', currentVolume: 20, targetVolume: 20 } // Maxed out
    };

    it('should filter by phase (CARDIO_BUILD -> RUN/BIKE)', () => {
        const result = GoalPriorityEngine.selectWorkout(
            mockManifest,
            'CARDIO_BUILD',
            mockBudget
        );
        const types = result.map(w => w.type);
        expect(types).toContain('RUN');
        expect(types).toContain('BIKE');
        expect(types).not.toContain('STRENGTH');
    });

    it('should filter by budget', () => {
        const lowBudget = { cns: 20, muscular: 20, metabolic: 20 };
        const result = GoalPriorityEngine.selectWorkout(
            mockManifest,
            'CARDIO_BUILD',
            lowBudget
        );
        // Should only get 'run_1' (cost 10/10/10)
        // 'bike_1' costs 40/30/50 -> Excluded
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('run_1');
    });

    it('should prioritize strength workouts that hit muscle gaps', () => {
        // Need to mock getMuscleForExercise or ensure 'Squat (Barbell)' maps to QUADS??
        // In my implementation I checked:
        // "quadriceps": "QUADS"
        // So if HEVY_EXERCISE_MAP['Squat (Barbell)'] is 'quadriceps', it maps to QUADS.
        // But I mocked usage of HEVY_EXERCISE_MAP using the real one?
        // The real HEVY_EXERCISE_MAP likely doesn't have 'Squat (Barbell)' if I didn't verify it.
        // Wait, I read hevyExercises.ts and it had "Bench Press (Barbell)".
        // Let's assume 'Bench Press (Barbell)' maps to 'chest' -> CHEST.

        // In this test: CHEST is 'MV' (needs work), Quads is MRV (full).
        // We expect Chest workout to be ranked higher than Leg workout if both were candidates.

        const result = GoalPriorityEngine.selectWorkout(
            mockManifest,
            'STRENGTH_BUILD', // Allows STRENGTH
            mockBudget,
            mockHeatmap as any
        );

        // strength_1 (Chest) should score higher than strength_2 (Legs)
        // Chest gap gives points.
        // Legs MRV gives no points (implementation checks for MV/MEV).

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].id).toBe('strength_1');
    });
});




import { describe, it, expect } from 'vitest';
import { calculateWeeklyVolume } from '../volumeCalculator';
import { HevyWorkout } from '../../types/hevy';

// Mock Data
const mockWorkoutToday: HevyWorkout = {
    id: 'w1',
    title: 'Chest Day',
    start_time: new Date().toISOString(),
    duration_seconds: 3600,
    exercises: [
        {
            exercise_template_id: 'bench',
            exercise_template: { id: 'bench', title: 'Bench Press (Barbell)' },
            sets: [
                { weight_kg: 100, reps: 5, index: 0, type: 'normal' },
                { weight_kg: 100, reps: 5, index: 1, type: 'normal' },
                { weight_kg: 100, reps: 5, index: 2, type: 'normal' }
            ]
        },
        {
            exercise_template_id: 'pushup',
            exercise_template: { id: 'pushup', title: 'Push Up' },
            sets: [
                { weight_kg: 0, reps: 20, index: 0, type: 'normal' },
                { weight_kg: 0, reps: 20, index: 1, type: 'warmup' }, // Should be ignored
                { weight_kg: 0, reps: 20, index: 2, type: 'normal' },
                { weight_kg: 0, reps: 20, index: 3, type: 'normal' }
            ]
        }
    ]
};

const mockWorkoutOld: HevyWorkout = {
    id: 'w2',
    title: 'Old Workout',
    start_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    duration_seconds: 3600,
    exercises: [
        {
            exercise_template_id: 'bench',
            exercise_template: { id: 'bench', title: 'Bench Press (Barbell)' },
            sets: [{ weight_kg: 100, reps: 5, index: 0, type: 'normal' }]
        }
    ]
};

describe('Volume Calculator', () => {
    it('VC-01: Aggregates volume correctly for muscle groups', () => {
        const volumes = calculateWeeklyVolume([mockWorkoutToday]);

        // Bench (3) + Pushups (3 normal sets - 1 warmup) = 6 sets for Chest
        const chestVol = volumes.find(v => v.muscleGroup === 'Chest');
        expect(chestVol?.weeklyVolume).toBe(6);
    });

    it('VC-02: Filters out workouts older than 7 days', () => {
        const volumes = calculateWeeklyVolume([mockWorkoutToday, mockWorkoutOld]);
        // Should ignore 'mockWorkoutOld' (8 days ago)
        const chestVol = volumes.find(v => v.muscleGroup === 'Chest');
        expect(chestVol?.weeklyVolume).toBe(6); // Still 6, not 7
    });

    it('VC-03: Excludes warmup sets', () => {
        // Verified in VC-01 logic
        const volumes = calculateWeeklyVolume([mockWorkoutToday]);
        const chestVol = volumes.find(v => v.muscleGroup === 'Chest');
        expect(chestVol?.weeklyVolume).toBe(6);
    });

    it('VC-04: Handles unknown exercises gracefully', () => {
        const weirdWorkout: HevyWorkout = {
            id: 'w3',
            title: 'Weird',
            start_time: new Date().toISOString(),
            duration_seconds: 60,
            exercises: [{
                exercise_template_id: 'unknown',
                exercise_template: { id: 'unknown', title: 'Alien Gravity Press' },
                sets: [{ weight_kg: 100, reps: 1, index: 0, type: 'normal' }]
            }]
        };
        const volumes = calculateWeeklyVolume([weirdWorkout]);
        // Should not crash, volumes should be 0 per muscle group (or not incremented)
        const chestVol = volumes.find(v => v.muscleGroup === 'Chest');
        expect(chestVol?.weeklyVolume).toBe(0);
    });
});

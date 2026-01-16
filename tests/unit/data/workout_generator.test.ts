import { describe, it, expect } from 'vitest';
import { generateStrengthWorkouts } from '@/data/workouts/generator';
import { EXERCISE_DB } from '@/data/exerciseDb';

describe('Workout Generator', () => {
    it('should generate valid strength workouts', () => {
        const workouts = generateStrengthWorkouts();
        expect(workouts.length).toBeGreaterThan(0);

        workouts.forEach(workout => {
            expect(workout.type).toBe('STRENGTH');
            expect(workout.exercises).toBeDefined();
            expect(workout.exercises!.length).toBeGreaterThan(0);
        });
    });

    it('should only use valid exercise IDs from EXERCISE_DB', () => {
        const workouts = generateStrengthWorkouts();

        workouts.forEach(workout => {
            workout.exercises?.forEach(ex => {
                expect(EXERCISE_DB[ex.id]).toBeDefined();
            });
        });
    });

    it('should provide default sets and reps', () => {
        const workouts = generateStrengthWorkouts();

        workouts.forEach(workout => {
            workout.exercises?.forEach(ex => {
                expect(ex.sets).toBeGreaterThan(0);
                expect(ex.reps).toBeDefined();
            });
        });
    });
});

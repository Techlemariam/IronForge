import { EXERCISE_DB } from '../exerciseDb';
import { WorkoutDefinition } from '../../types/training';

/**
 * Generates dynamic strength workouts based on templates and the Exercise DB.
 */
export const generateStrengthWorkouts = (): WorkoutDefinition[] => {
    const workouts: WorkoutDefinition[] = [];

    // --- TEMPLATE 1: FULL BODY POWER (Alpha) ---
    workouts.push({
        id: 'str_full_alpha_a',
        code: 'FBa',
        name: 'Full Body Power A',
        description: 'Heavy compound movements focusing on maximum force production.',
        type: 'STRENGTH',
        durationMin: 60,
        durationLabel: '60 min',
        intensity: 'HIGH',
        resourceCost: {
            CNS: 25,
            MUSCULAR: 20,
            METABOLIC: 15,
        },
        recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
        exercises: [
            { id: 'Squat (Barbell)', sets: 3, reps: 5, rpe: 8, restMin: 3 },
            { id: 'Bench Press (Barbell)', sets: 3, reps: 5, rpe: 8, restMin: 3 },
            { id: 'Bent Over Row (Barbell)', sets: 3, reps: 8, rpe: 8, restMin: 2 },
            { id: 'Overhead Press (Barbell)', sets: 2, reps: 8, rpe: 7, restMin: 2 },
        ]
    });

    // --- TEMPLATE 2: UPPER HYPERTROPHY (Beta) ---
    workouts.push({
        id: 'str_upper_beta_a',
        code: 'UPa',
        name: 'Upper Hypertrophy A',
        description: 'Volume-focused upper body session for muscle growth.',
        type: 'STRENGTH',
        durationMin: 45,
        durationLabel: '45 min',
        intensity: 'MEDIUM',
        resourceCost: {
            CNS: 15,
            MUSCULAR: 35,
            METABOLIC: 20,
        },
        recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
        exercises: [
            { id: 'Incline Bench Press (Dumbbell)', sets: 3, reps: 10, rpe: 8, restMin: 2 },
            { id: 'Lat Pulldown (Cable)', sets: 3, reps: 12, rpe: 8, restMin: 2 },
            { id: 'Lateral Raise (Dumbbell)', sets: 3, reps: 15, rpe: 9, restMin: 1.5 },
            { id: 'Bicep Curl (Dumbbell)', sets: 3, reps: 12, rpe: 9, restMin: 1.5 },
            { id: 'Triceps Pushdown', sets: 3, reps: 12, rpe: 9, restMin: 1.5 },
        ]
    });

    // --- TEMPLATE 3: LOWER HYPERTROPHY (Beta) ---
    workouts.push({
        id: 'str_lower_beta_a',
        code: 'LWa',
        name: 'Lower Hypertrophy A',
        description: 'Leg day focus on quads and hams.',
        type: 'STRENGTH',
        durationMin: 50,
        durationLabel: '50 min',
        intensity: 'HIGH',
        resourceCost: {
            CNS: 20,
            MUSCULAR: 40,
            METABOLIC: 25,
        },
        recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
        exercises: [
            { id: 'Deadlift (Barbell)', sets: 1, reps: 5, rpe: 8, restMin: 3 },
            { id: 'Leg Press (Machine)', sets: 3, reps: 10, rpe: 8, restMin: 2 },
            { id: 'Bulgarian Split Squat', sets: 2, reps: 12, rpe: 8, restMin: 2 },
            { id: 'Seated Leg Curl (Machine)', sets: 3, reps: 15, rpe: 9, restMin: 1.5 },
            { id: 'Seated Calf Raise', sets: 3, reps: 15, rpe: 9, restMin: 1.5 },
        ]
    });

    // Validate exercises exist in DB
    const validatedWorkouts = workouts.map(w => {
        if (w.exercises) {
            w.exercises = w.exercises.filter(ex => {
                if (!EXERCISE_DB[ex.id]) {
                    console.warn(`Warning: Exercise '${ex.id}' not found in EXERCISE_DB. Removing from workout '${w.id}'.`);
                    return false;
                }
                return true;
            });
        }
        return w;
    });

    return validatedWorkouts;
};

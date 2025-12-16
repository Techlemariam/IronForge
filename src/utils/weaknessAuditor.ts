
import { HevyWorkout } from '../types/hevy';
import { muscleMap } from '../data/muscleMap';

export const analyzeWeaknesses = (workouts: HevyWorkout[]) => {
    const weeklyVolume: { [key: string]: number } = {};

    workouts.forEach(workout => {
        if (!workout.exercises) return;

        workout.exercises.forEach(exercise => {
            // Guard against missing exercise templates or titles
            if (exercise.exercise_template && exercise.exercise_template.title) {
                const mapping = muscleMap[exercise.exercise_template.title];
                if (mapping) {
                    const primaryMuscle = mapping.primary;
                    if (!weeklyVolume[primaryMuscle]) {
                        weeklyVolume[primaryMuscle] = 0;
                    }
                    // Ensure sets is not null/undefined and is an array
                    weeklyVolume[primaryMuscle] += Array.isArray(exercise.sets) ? exercise.sets.length : 0;
                }
            }
        });
    });

    // Avoid an error if weeklyVolume is empty
    if (Object.keys(weeklyVolume).length === 0) {
        return {
            weakestLink: 'N/A',
            weeklyVolume,
        };
    }

    // Find the muscle group with the lowest volume
    const weakestLink = Object.keys(weeklyVolume).reduce((a, b) => weeklyVolume[a] < weeklyVolume[b] ? a : b);

    return {
        weakestLink,
        weeklyVolume,
    };
};

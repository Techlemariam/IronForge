import { HevyWorkout, HevySet } from '../types/hevy';
import { MuscleGroupVolume, RPVolumeStandards } from '../types/auditor';
import { getMuscleGroupForExercise, muscleMap } from '../data/muscleMap';

/**
 * Volume Calculator
 * Aggregates weekly training volume per muscle group based on Hevy workout history.
 */

// Milliseconds in a week
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Calculates the total volume (number of sets) per muscle group over the last 7 days.
 * 
 * @param workouts - List of completed Hevy workouts (should include at least 7 days of history)
 * @param referenceDate - Optional date to calculate backwards from (defaults to now)
 * @returns Array of MuscleGroupVolume objects
 */
export const calculateWeeklyVolume = (
    workouts: HevyWorkout[],
    referenceDate: Date = new Date()
): MuscleGroupVolume[] => {
    const windowStart = new Date(referenceDate.getTime() - ONE_WEEK_MS);

    // Map to store aggregated volumes
    // Key: Muscle Group Name (e.g., "Chest")
    // Value: Number of sets
    const volumeMap = new Map<string, number>();

    // Initialize map with 0 for all known muscle groups
    for (const muscleGroup of muscleMap.keys()) {
        volumeMap.set(muscleGroup, 0);
    }

    // Filter workouts within the 7-day window
    const recentWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        return workoutDate >= windowStart && workoutDate <= referenceDate;
    });

    // Aggregate volume
    recentWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            // Find which muscle group this exercise belongs to
            const exerciseTitle = exercise.exercise_template.title;
            const muscleGroup = getMuscleGroupForExercise(exerciseTitle);

            if (muscleGroup) {
                // Count valid sets (exclude warmups if marked - assuming standard sets for now)
                // If Hevy API provides set 'type', we could filter out 'warmup'
                const validSets = exercise.sets.filter(set => isSetValid(set)).length;

                const currentVolume = volumeMap.get(muscleGroup) || 0;
                volumeMap.set(muscleGroup, currentVolume + validSets);

                // Secondary Muscle Group Logic (Optional)
                // For example, Bench Press hits Triceps too.
                // Currently, muscleMap is 1:1. Future improvement: 1:Many mapping.
            }
        });
    });

    // Convert to output format
    const result: MuscleGroupVolume[] = Array.from(volumeMap.entries()).map(([muscle, volume]) => ({
        muscleGroup: muscle,
        weeklyVolume: volume,
        lastUpdated: new Date().toISOString()
    }));

    return result;
};

/**
 * Helper to determine if a set counts towards volume
 */
const isSetValid = (set: HevySet): boolean => {
    // If set type is "warmup", exclude it.
    // 'failure', 'drop', 'normal' count.
    if (set.type && set.type.toLowerCase() === 'warmup') {
        return false;
    }
    return true;
};

/**
 * Gets the RP Standards for a given muscle group
 */
export const getStandardsForMuscle = (muscleGroup: string): RPVolumeStandards | null => {
    const data = muscleMap.get(muscleGroup);
    return data ? data.rpStandards : null;
};

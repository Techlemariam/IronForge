// src/utils/weaknessAuditor.ts
import { HevyWorkout } from '../types/hevy';
import { getMuscleGroupForExercise, muscleMap } from '../data/muscleMap';

export type MuscleVolume = {
    muscleGroup: string;
    volume: number; // Total sets
}

/**
 * The Oracle Engine - Weakness Auditor
 * Analyzes a collection of Hevy workouts to determine volume distribution across muscle groups.
 * 
 * @param workouts An array of Hevy workout objects.
 * @returns An array of MuscleVolume objects, sorted from lowest to highest volume.
 */
export const auditWeaknesses = (workouts: HevyWorkout[]): MuscleVolume[] => {
    const volumeTally = new Map<string, number>();

    // 1. Initialize the tally with all known muscle groups to ensure they are represented.
    for (const muscleGroup of muscleMap.keys()) {
        volumeTally.set(muscleGroup, 0);
    }

    // 2. Iterate through each workout and its exercises to aggregate volume.
    for (const workout of workouts) {
        for (const exercise of workout.exercises) {
            // FIX: Check if exercise_template exists before accessing its properties.
            if (exercise.exercise_template) {
                const hevyMuscleGroup = exercise.exercise_template.primary_muscle_group;
                const mappedGroup = hevyMuscleGroup || getMuscleGroupForExercise(exercise.exercise_template.title);
                
                if (mappedGroup) {
                    // Increment the volume (total sets) for the identified muscle group.
                    const currentVolume = volumeTally.get(mappedGroup) || 0;
                    volumeTally.set(mappedGroup, currentVolume + exercise.sets.length);
                }
            }
        }
    }

    // 3. Convert the map to an array of objects.
    const results: MuscleVolume[] = Array.from(volumeTally, ([muscleGroup, volume]) => ({
        muscleGroup,
        volume
    }));

    // 4. Sort the results to easily identify the least-trained muscle groups.
    results.sort((a, b) => a.volume - b.volume);

    return results;
};

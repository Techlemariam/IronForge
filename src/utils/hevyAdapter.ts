// src/utils/hevyAdapter.ts
import { HevyRoutine } from '../types/hevy';
import { Exercise, Set } from '../types/ironforge';

/**
 * THE TRANSLATOR
 * Converts a Hevy Routine summary into a usable Quest, using a name map for titles.
 */
export const mapHevyToQuest = (routine: HevyRoutine, exerciseNameMap: Map<string, string>): Exercise[] => {
  if (!routine.exercises || routine.exercises.length === 0) {
    return [];
  }

  return routine.exercises.map((hevyExerciseSummary, index) => {
    
    const questSets: Set[] = hevyExerciseSummary.sets.map(() => ({
      targetReps: 10, // Default value
      targetRPE: 8,   // Default value
    }));

    // !!! THE FINAL FIX !!!
    // Look up the exercise name in the map. If it's not found, use the ID as a fallback.
    const exerciseName = exerciseNameMap.get(hevyExerciseSummary.exercise_template_id) || `ID: ${hevyExerciseSummary.exercise_template_id}`;

    return {
      id: parseInt(hevyExerciseSummary.exercise_template_id.substring(0, 8), 16) || index,
      hevyId: hevyExerciseSummary.exercise_template_id,
      name: exerciseName, // The true name!
      type: 'strength',
      sets: questSets,
      completed: false
    };
  });
};

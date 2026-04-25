// src/utils/hevyAdapter.ts
import type { HevyRoutine } from '../types/hevy';
import type { Exercise, WorkoutSet } from '../types/ironforge';

/**
 * THE TRANSLATOR
 * Converts a Hevy Routine summary into a usable Quest, using a name map for titles.
 */
export const mapHevyToQuest = (
  routine: HevyRoutine,
  exerciseNameMap: Map<string, string>
): Exercise[] => {
  if (!routine.exercises || routine.exercises.length === 0) {
    return [];
  }

  return routine.exercises.map((hevyExerciseSummary, index) => {
    const questSets: WorkoutSet[] = hevyExerciseSummary.sets.map((_, setIndex) => ({
      id: `set-${index}-${setIndex}`,
      targetReps: 10, // Default value
      targetRPE: 8, // Default value
      completed: false,
    }));

    const exerciseName =
      exerciseNameMap.get(hevyExerciseSummary.exercise_template_id) ||
      `ID: ${hevyExerciseSummary.exercise_template_id}`;

    return {
      id: hevyExerciseSummary.exercise_template_id,
      hevyId: hevyExerciseSummary.exercise_template_id,
      name: exerciseName,
      type: 'strength',
      sets: questSets,
      completed: false,
    };
  });
};

/**
 * THE FORGE
 * Converts a completed Quest back into the format Hevy expects for a workout log.
 */
export const mapQuestToHevyPayload = (
  exercises: Exercise[],
  questTitle: string,
  startTime: Date,
  endTime: Date,
  isPrivate: boolean
) => {
  const hevyExercises = exercises
    .map((ex) => {
      const completedSets = ex.sets
        .filter(
          (set): set is WorkoutSet & { weight: number; completedReps: number } =>
            set.completed === true &&
            typeof set.weight === 'number' &&
            typeof set.completedReps === 'number'
        )
        .map((set) => ({
          type: 'normal',
          weight_kg: set.weight,
          reps: set.completedReps,
          rpe: set.targetRPE,
        }));

      if (completedSets.length === 0) {
        return null;
      }

      return {
        exercise_template_id: ex.hevyId,
        exercise_template: {
          id: ex.hevyId,
          title: ex.name,
        },
        sets: completedSets,
        notes: ex.notes || undefined,
      };
    })
    .filter((ex): ex is NonNullable<typeof ex> => ex !== null); // Filter out exercises with no logged sets

  return {
    workout: {
      title: questTitle,
      start_time: startTime,
      end_time: endTime,
      is_private: isPrivate,
      exercises: hevyExercises,
    },
  };
};

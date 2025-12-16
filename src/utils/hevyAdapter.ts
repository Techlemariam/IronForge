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

// src/utils/hevyAdapter.ts - TILLÄGG

// Hjälpfunktion för att bygga payloaden
export const mapQuestToHevyPayload = (
    exercises: Exercise[], 
    title: string, 
    startTime: Date, 
    endTime: Date
) => {
    return {
        workout: {
            title: title,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            is_private: false, // Eller true om du vill
            comments: "Logged via IronForge Architect. #IronForge",
            exercises: exercises.map((ex, index) => ({
                exercise_template_id: ex.hevyId, // Kritiskt: Vi måste ha sparat detta ID från GET-anropet!
                superset_id: null,
                notes: "",
                sets: ex.sets
                    .filter(set => set.loggedWeight && set.loggedReps) // Spara bara loggade sets
                    .map((set, setIndex) => ({
                        type: "normal", // Kan utökas med logik för 'warmup' etc.
                        weight_kg: set.loggedWeight,
                        reps: set.loggedReps,
                        rpe: set.loggedRPE,
                        distance_meters: null,
                        duration_seconds: null,
                        index: setIndex
                    }))
            })).filter(ex => ex.sets.length > 0) // Ta bort övningar där inga set loggats
        }
    };
};
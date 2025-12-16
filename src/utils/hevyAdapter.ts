// src/utils/hevyAdapter.ts
import { HevyRoutine } from '../types/hevy';
import { Exercise, Set } from '../types/ironforge';

/**
 * THE TRANSLATOR
 * Konverterar en Hevy-rutin (Template) till en Active Quest (Live Workout).
 */
export const mapHevyToQuest = (routine: HevyRoutine): Exercise[] => {
  return routine.exercises.map((hevyExercise, index) => {
    
    const questSets: Set[] = hevyExercise.sets.map((s) => ({
      targetReps: s.reps || 10, 
      targetRPE: 8,            
    }));

    return {
      id: parseInt(hevyExercise.exercise_template_id.substring(0, 8), 16) || index, 
      hevyId: hevyExercise.exercise_template_id, 
      name: hevyExercise.exercise_template.title,
      type: 'strength', 
      sets: questSets,
      completed: false
    };
  });
};

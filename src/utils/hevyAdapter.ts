// src/utils/hevyAdapter.ts
import { HevyRoutine } from '../../types/hevy';
import { Exercise, Set } from '../types/ironforge'; // Importera typer från din Quest_Log (eller flytta dem till en shared types fil)

/**
 * Konverterar en Hevy-rutin till en IronForge Dungeon (Quest).
 */
export const mapHevyToQuest = (routine: HevyRoutine): Exercise[] => {
  return routine.exercises.map((hevyExercise, index) => {
    
    // Mappa sets
    const questSets: Set[] = hevyExercise.sets.map((s, setIndex) => ({
      id: `${hevyExercise.exercise_template_id}-${setIndex}`,
      reps: s.reps || 8, // Target reps as a string or number
      targetReps: s.reps || 8, // Default om inget mål finns
      targetRPE: 8,            // Default RPE (Hevy har inte RPE-mål i API:et än)
      completed: false,
    }));

    return {
      id: hevyExercise.exercise_template_id || `${index}`,
      name: hevyExercise.exercise_template.title,
      type: 'strength', // Antag styrka för nu
      sets: questSets,
      completed: false
    };
  });
};

// src/utils/hevyAdapter.ts
import { HevyRoutine } from '../../types/hevy';
import { Exercise, Set } from '../../components/Quest_Log'; // Importera typer från din Quest_Log (eller flytta dem till en shared types fil)

/**
 * Konverterar en Hevy-rutin till en IronForge Dungeon (Quest).
 */
export const mapHevyToQuest = (routine: HevyRoutine): Exercise[] => {
  return routine.exercises.map((hevyExercise, index) => {
    
    // Mappa sets
    const questSets: Set[] = hevyExercise.sets.map((s) => ({
      targetReps: s.reps || 8, // Default om inget mål finns
      targetRPE: 8,            // Default RPE (Hevy har inte RPE-mål i API:et än)
      // Vi lämnar loggedWeight/loggedReps tomma eftersom detta är ett nytt pass
    }));

    return {
      id: parseInt(hevyExercise.exercise_template_id, 16) || index, // Generera ett ID
      name: hevyExercise.exercise_template.title,
      type: 'strength', // Antag styrka för nu
      sets: questSets,
      completed: false
    };
  });
};

import { Exercise as LegacyExercise, WorkoutSet as LegacySet } from '@/types/ironforge';
import { Exercise as DomainExercise, Set as DomainSet } from '@/types';

// Converts Domain Set (new) to Legacy Set (old)
export const mapDomainSetToLegacy = (set: DomainSet): LegacySet => {
    // Resolve reps: Domain uses 'reps' (number|string), Legacy uses 'targetReps' (number) + optional 'reps'
    let targetReps = 10;
    if (typeof set.reps === 'number') {
        targetReps = set.reps;
    } else {
        // Handle AMRAP strings or others by defaulting to 10 or parsing
        const parsed = parseInt(set.reps as string);
        if (!isNaN(parsed)) targetReps = parsed;
    }

    return {
        id: set.id,
        completed: set.completed,
        weight: set.weight,
        targetReps: targetReps,
        reps: set.reps, // Keep the original value if needed
        targetRPE: 8, // Domain set might not have RPE, default to 8
        completedReps: set.completedReps,
        rarity: set.rarity,
        e1rm: set.e1rm,
        isPr: set.isPrZone, // Map isPrZone to isPr? Or keep separate?
        type: set.type
    };
};

export const mapDomainExerciseToLegacy = (ex: DomainExercise): LegacyExercise => {
    return {
        id: ex.id,
        name: ex.name,
        hevyId: ex.hevyId || '',
        trainingMax: ex.trainingMax,
        notes: ex.notes,
        sets: ex.sets.map(mapDomainSetToLegacy)
    };
};

export const mapSessionToQuest = (exercises: DomainExercise[] | undefined): LegacyExercise[] => {
    if (!exercises) return [];
    return exercises.map(mapDomainExerciseToLegacy);
};

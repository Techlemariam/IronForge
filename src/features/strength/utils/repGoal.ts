import type { Exercise, Set as WorkoutSet } from '@/types';

export type ExercisePrescription =
  | {
      type: 'SETS_REPS';
    }
  | {
      type: 'TOTAL_REPS';
      targetTotalReps: number;
      maxSets?: number;
      minRepsPerSet?: number;
    };

export type RepGoalExercise = Exercise & {
  prescription?: ExercisePrescription;
};

export interface RepGoalProgress {
  completedReps: number;
  targetReps: number;
  remainingReps: number;
  percentage: number;
  isComplete: boolean;
}

export const getCompletedReps = (sets: WorkoutSet[]): number =>
  sets.reduce((total, set) => total + (set.completed ? (set.completedReps ?? 0) : 0), 0);

export const getRepGoalProgress = (exercise: RepGoalExercise): RepGoalProgress | null => {
  if (exercise.prescription?.type !== 'TOTAL_REPS') return null;

  const targetReps = Math.max(1, exercise.prescription.targetTotalReps);
  const completedReps = getCompletedReps(exercise.sets);
  const remainingReps = Math.max(0, targetReps - completedReps);

  return {
    completedReps,
    targetReps,
    remainingReps,
    percentage: Math.min(100, Math.round((completedReps / targetReps) * 100)),
    isComplete: completedReps >= targetReps,
  };
};

export const isExerciseComplete = (exercise: RepGoalExercise): boolean => {
  const repGoal = getRepGoalProgress(exercise);
  return repGoal ? repGoal.isComplete : exercise.sets.every((set) => set.completed);
};

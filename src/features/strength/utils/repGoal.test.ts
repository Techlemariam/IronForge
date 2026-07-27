import { type Exercise, ExerciseLogic } from '@/types';
import { describe, expect, it } from 'vitest';
import { type RepGoalExercise, getRepGoalProgress, isExerciseComplete } from './repGoal';

const exercise = (completedReps: number[]): RepGoalExercise =>
  ({
    id: 'pull-ups',
    name: 'Pull-ups',
    logic: ExerciseLogic.FIXED_REPS,
    prescription: {
      type: 'TOTAL_REPS',
      targetTotalReps: 30,
      maxSets: 5,
    },
    sets: completedReps.map((reps, index) => ({
      id: `set-${index}`,
      reps: 10,
      completedReps: reps,
      completed: true,
    })),
  }) as RepGoalExercise;

describe('repGoal', () => {
  it('returns progress for total-reps prescriptions', () => {
    expect(getRepGoalProgress(exercise([8, 7, 6]))).toEqual({
      completedReps: 21,
      targetReps: 30,
      remainingReps: 9,
      percentage: 70,
      isComplete: false,
    });
  });

  it('completes once accumulated reps reach the target', () => {
    expect(isExerciseComplete(exercise([8, 7, 6, 5, 4]))).toBe(true);
  });

  it('keeps fixed set exercises on existing completion semantics', () => {
    const fixedExercise = {
      id: 'bench',
      name: 'Bench press',
      logic: ExerciseLogic.FIXED_REPS,
      sets: [
        { id: '1', reps: 5, completed: true },
        { id: '2', reps: 5, completed: false },
      ],
    } as Exercise;

    expect(getRepGoalProgress(fixedExercise)).toBeNull();
    expect(isExerciseComplete(fixedExercise)).toBe(false);
  });
});

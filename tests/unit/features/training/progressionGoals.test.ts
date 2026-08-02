import { getProgressionGoalStatus } from '@/features/training/types/progressionGoals';
import { describe, expect, it } from 'vitest';

describe('getProgressionGoalStatus', () => {
  it('keeps goals pending until the set is completed', () => {
    expect(
      getProgressionGoalStatus(
        { repGoal: 10, e1rmGoalReps: 8, e1rmTarget: 100 },
        false,
        12,
        105
      )
    ).toEqual({
      repGoalReached: false,
      e1rmGoalReached: false,
    });
  });

  it('marks a completed rep goal as reached', () => {
    expect(getProgressionGoalStatus({ repGoal: 10 }, true, 10)).toEqual({
      repGoalReached: true,
      e1rmGoalReached: false,
    });
  });

  it('marks a completed e1RM bonus as reached only with its numeric target', () => {
    expect(
      getProgressionGoalStatus({ e1rmGoalReps: 8, e1rmTarget: 100 }, true, 8, 100)
    ).toEqual({
      repGoalReached: false,
      e1rmGoalReached: true,
    });
  });

  it('does not infer e1RM success from bonus reps without an e1RM target', () => {
    expect(getProgressionGoalStatus({ e1rmGoalReps: 8 }, true, 12, 120)).toEqual({
      repGoalReached: false,
      e1rmGoalReached: false,
    });
  });
});

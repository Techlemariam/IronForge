export interface ProgressionGoalFields {
  repGoal?: number;
  e1rmGoalReps?: number;
  e1rmTarget?: number;
}

export function getProgressionGoalStatus(
  goals: ProgressionGoalFields,
  completed: boolean,
  completedReps?: number
) {
  if (!completed) {
    return {
      repGoalReached: false,
      e1rmGoalReached: false,
    };
  }

  return {
    repGoalReached:
      goals.repGoal !== undefined && completedReps !== undefined && completedReps >= goals.repGoal,
    e1rmGoalReached:
      goals.e1rmGoalReps !== undefined &&
      goals.e1rmTarget !== undefined &&
      completedReps !== undefined &&
      completedReps >= goals.e1rmGoalReps,
  };
}

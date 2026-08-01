export interface ProgressionGoalFields {
  repGoal?: number;
  e1rmGoalReps?: number;
  e1rmTarget?: number;
}

export function getProgressionGoalStatus(
  goals: ProgressionGoalFields,
  completedReps?: number,
  e1rm?: number
) {
  return {
    repGoalReached:
      goals.repGoal !== undefined && completedReps !== undefined && completedReps >= goals.repGoal,
    e1rmGoalReached:
      goals.e1rmTarget !== undefined && e1rm !== undefined && e1rm >= goals.e1rmTarget,
  };
}

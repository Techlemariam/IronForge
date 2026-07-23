export type GoalPriority = 'PRIMARY' | 'SECONDARY';
export type GoalMode = 'PROGRESS' | 'MAINTENANCE' | 'PAUSED';

export interface GoalPriorityInput {
  goalId: string;
  priority: GoalPriority;
  requestedLoad: number;
  recoveryCost: number;
  equipmentCompatible: boolean;
  locallyAvoided?: boolean;
}

export interface GoalPriorityDecision {
  goalId: string;
  mode: GoalMode;
  score: number;
  reasonCodes: string[];
}

export interface GoalPriorityBudget {
  availableRecovery: number;
  availableTime: number;
}

const priorityWeight: Record<GoalPriority, number> = {
  PRIMARY: 1,
  SECONDARY: 0.6,
};

export function prioritizeGoals(
  goals: GoalPriorityInput[],
  budget: GoalPriorityBudget,
): GoalPriorityDecision[] {
  let recoveryLeft = Math.max(0, budget.availableRecovery);
  let timeLeft = Math.max(0, budget.availableTime);

  return [...goals]
    .sort((a, b) => {
      const priorityDelta = priorityWeight[b.priority] - priorityWeight[a.priority];
      return priorityDelta !== 0 ? priorityDelta : a.goalId.localeCompare(b.goalId);
    })
    .map((goal) => {
      const reasonCodes: string[] = [];

      if (!goal.equipmentCompatible) {
        return {
          goalId: goal.goalId,
          mode: 'PAUSED',
          score: 0,
          reasonCodes: ['EQUIPMENT_INCOMPATIBLE'],
        };
      }

      if (goal.locallyAvoided) {
        return {
          goalId: goal.goalId,
          mode: 'PAUSED',
          score: 0,
          reasonCodes: ['LOCAL_AVOID'],
        };
      }

      const requested = Math.max(0, goal.requestedLoad);
      const recoveryCost = Math.max(0, goal.recoveryCost);
      const canProgress = recoveryLeft >= recoveryCost && timeLeft >= requested;

      if (canProgress) {
        recoveryLeft -= recoveryCost;
        timeLeft -= requested;
        reasonCodes.push(goal.priority === 'PRIMARY' ? 'PRIMARY_PROGRESS' : 'SECONDARY_PROGRESS');
        return {
          goalId: goal.goalId,
          mode: 'PROGRESS',
          score: priorityWeight[goal.priority],
          reasonCodes,
        };
      }

      const canMaintain = recoveryLeft > 0 && timeLeft > 0;
      if (canMaintain) {
        const maintenanceRecovery = Math.min(recoveryLeft, recoveryCost * 0.35);
        const maintenanceTime = Math.min(timeLeft, requested * 0.35);
        recoveryLeft -= maintenanceRecovery;
        timeLeft -= maintenanceTime;
        return {
          goalId: goal.goalId,
          mode: 'MAINTENANCE',
          score: priorityWeight[goal.priority] * 0.4,
          reasonCodes: ['BUDGET_LIMITED', 'MAINTENANCE_SELECTED'],
        };
      }

      return {
        goalId: goal.goalId,
        mode: 'PAUSED',
        score: 0,
        reasonCodes: ['BUDGET_EXHAUSTED', 'NO_MAKE_UP_DEBT'],
      };
    });
}

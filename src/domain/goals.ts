export type GoalCategory =
  | 'PHYSIQUE'
  | 'STRENGTH'
  | 'ENDURANCE'
  | 'HEALTH'
  | 'CONSISTENCY';

export type GoalStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type GoalPriority = 'PRIMARY' | 'SECONDARY';

export type GoalDefinitionId =
  | 'BUILD_CHEST'
  | 'BUILD_BACK'
  | 'BENCH_100_KG'
  | 'RUN_MARATHON'
  | 'TRAIN_THREE_TIMES_PER_WEEK';

export interface GoalDefinition {
  id: GoalDefinitionId;
  title: string;
  category: GoalCategory;
  objectiveIds: string[];
}

export interface Goal {
  id: string;
  definitionId: GoalDefinitionId;
  status: GoalStatus;
  priority?: GoalPriority;
  createdAt: string;
  activatedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  archivedAt?: string;
}

export interface GoalPortfolio {
  goals: Goal[];
}

export class GoalDomainError extends Error {}

export const GOAL_CATALOG: Readonly<Record<GoalDefinitionId, GoalDefinition>> = {
  BUILD_CHEST: {
    id: 'BUILD_CHEST',
    title: 'Build chest',
    category: 'PHYSIQUE',
    objectiveIds: [
      'CHEST_HORIZONTAL_PRESS',
      'CHEST_INCLINE_PRESS',
      'CHEST_WEEKLY_VOLUME',
    ],
  },
  BUILD_BACK: {
    id: 'BUILD_BACK',
    title: 'Build back',
    category: 'PHYSIQUE',
    objectiveIds: ['BACK_HORIZONTAL_PULL', 'BACK_VERTICAL_PULL'],
  },
  BENCH_100_KG: {
    id: 'BENCH_100_KG',
    title: 'Bench press 100 kg',
    category: 'STRENGTH',
    objectiveIds: ['BENCH_PRESS_STRENGTH'],
  },
  RUN_MARATHON: {
    id: 'RUN_MARATHON',
    title: 'Run a marathon',
    category: 'ENDURANCE',
    objectiveIds: ['RUN_ENDURANCE', 'RUN_DURABILITY'],
  },
  TRAIN_THREE_TIMES_PER_WEEK: {
    id: 'TRAIN_THREE_TIMES_PER_WEEK',
    title: 'Train three times per week',
    category: 'CONSISTENCY',
    objectiveIds: ['WEEKLY_TRAINING_FREQUENCY'],
  },
};

function nowIso(now?: string): string {
  return now ?? new Date().toISOString();
}

export function createGoal(
  id: string,
  definitionId: GoalDefinitionId,
  now?: string,
): Goal {
  if (!GOAL_CATALOG[definitionId]) {
    throw new GoalDomainError(`Unknown goal definition: ${definitionId}`);
  }

  return {
    id,
    definitionId,
    status: 'DRAFT',
    createdAt: nowIso(now),
  };
}

export function activateGoal(
  portfolio: GoalPortfolio,
  goalId: string,
  priority: GoalPriority,
  now?: string,
): GoalPortfolio {
  const target = portfolio.goals.find((goal) => goal.id === goalId);
  if (!target) {
    throw new GoalDomainError(`Goal not found: ${goalId}`);
  }
  if (!['DRAFT', 'PAUSED'].includes(target.status)) {
    throw new GoalDomainError(`Cannot activate goal from ${target.status}`);
  }

  const otherActive = portfolio.goals.filter(
    (goal) => goal.id !== goalId && goal.status === 'ACTIVE',
  );
  const primaryCount = otherActive.filter(
    (goal) => goal.priority === 'PRIMARY',
  ).length;
  const secondaryCount = otherActive.filter(
    (goal) => goal.priority === 'SECONDARY',
  ).length;

  if (priority === 'PRIMARY' && primaryCount >= 1) {
    throw new GoalDomainError('Only one primary goal may be active');
  }
  if (priority === 'SECONDARY' && secondaryCount >= 2) {
    throw new GoalDomainError('Only two secondary goals may be active');
  }

  return {
    goals: portfolio.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            status: 'ACTIVE',
            priority,
            activatedAt: nowIso(now),
            pausedAt: undefined,
          }
        : goal,
    ),
  };
}

export function pauseGoal(
  portfolio: GoalPortfolio,
  goalId: string,
  now?: string,
): GoalPortfolio {
  return transitionActiveGoal(portfolio, goalId, {
    status: 'PAUSED',
    priority: undefined,
    pausedAt: nowIso(now),
  });
}

export function completeGoal(
  portfolio: GoalPortfolio,
  goalId: string,
  now?: string,
): GoalPortfolio {
  return transitionActiveGoal(portfolio, goalId, {
    status: 'COMPLETED',
    priority: undefined,
    completedAt: nowIso(now),
  });
}

export function archiveGoal(
  portfolio: GoalPortfolio,
  goalId: string,
  now?: string,
): GoalPortfolio {
  const target = portfolio.goals.find((goal) => goal.id === goalId);
  if (!target) {
    throw new GoalDomainError(`Goal not found: ${goalId}`);
  }
  if (target.status === 'ARCHIVED') {
    return portfolio;
  }

  return {
    goals: portfolio.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            status: 'ARCHIVED',
            priority: undefined,
            archivedAt: nowIso(now),
          }
        : goal,
    ),
  };
}

function transitionActiveGoal(
  portfolio: GoalPortfolio,
  goalId: string,
  patch: Partial<Goal> & Pick<Goal, 'status'>,
): GoalPortfolio {
  const target = portfolio.goals.find((goal) => goal.id === goalId);
  if (!target) {
    throw new GoalDomainError(`Goal not found: ${goalId}`);
  }
  if (target.status !== 'ACTIVE') {
    throw new GoalDomainError(`Goal must be active, was ${target.status}`);
  }

  return {
    goals: portfolio.goals.map((goal) =>
      goal.id === goalId ? { ...goal, ...patch } : goal,
    ),
  };
}

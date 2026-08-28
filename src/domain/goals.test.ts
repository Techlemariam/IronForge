import { describe, expect, it } from 'vitest';
import {
  GoalDomainError,
  activateGoal,
  archiveGoal,
  completeGoal,
  createGoal,
  pauseGoal,
  type GoalPortfolio,
} from './goals';

const NOW = '2026-07-22T18:00:00.000Z';

function portfolio(...definitionIds: Parameters<typeof createGoal>[1][]): GoalPortfolio {
  return {
    goals: definitionIds.map((definitionId, index) =>
      createGoal(`goal-${index + 1}`, definitionId, NOW),
    ),
  };
}

describe('goal domain lifecycle', () => {
  it('creates a draft goal from the versioned catalog', () => {
    expect(createGoal('goal-1', 'BUILD_CHEST', NOW)).toEqual({
      id: 'goal-1',
      definitionId: 'BUILD_CHEST',
      status: 'DRAFT',
      createdAt: NOW,
    });
  });

  it('allows one primary and two secondary active goals', () => {
    let result = portfolio('BUILD_CHEST', 'RUN_MARATHON', 'BENCH_100_KG');
    result = activateGoal(result, 'goal-1', 'PRIMARY', NOW);
    result = activateGoal(result, 'goal-2', 'SECONDARY', NOW);
    result = activateGoal(result, 'goal-3', 'SECONDARY', NOW);

    expect(result.goals.map(({ status, priority }) => ({ status, priority }))).toEqual([
      { status: 'ACTIVE', priority: 'PRIMARY' },
      { status: 'ACTIVE', priority: 'SECONDARY' },
      { status: 'ACTIVE', priority: 'SECONDARY' },
    ]);
  });

  it('rejects a second active primary goal', () => {
    let result = portfolio('BUILD_CHEST', 'RUN_MARATHON');
    result = activateGoal(result, 'goal-1', 'PRIMARY', NOW);

    expect(() => activateGoal(result, 'goal-2', 'PRIMARY', NOW)).toThrow(
      'Only one primary goal may be active',
    );
  });

  it('rejects a third active secondary goal', () => {
    let result = portfolio(
      'BUILD_CHEST',
      'RUN_MARATHON',
      'TRAIN_THREE_TIMES_PER_WEEK',
    );
    result = activateGoal(result, 'goal-1', 'SECONDARY', NOW);
    result = activateGoal(result, 'goal-2', 'SECONDARY', NOW);

    expect(() => activateGoal(result, 'goal-3', 'SECONDARY', NOW)).toThrow(
      'Only two secondary goals may be active',
    );
  });

  it('pauses without creating debt and can later reactivate', () => {
    let result = portfolio('BUILD_CHEST');
    result = activateGoal(result, 'goal-1', 'PRIMARY', NOW);
    result = pauseGoal(result, 'goal-1', '2026-07-23T18:00:00.000Z');

    expect(result.goals[0]).toMatchObject({
      status: 'PAUSED',
      priority: undefined,
      pausedAt: '2026-07-23T18:00:00.000Z',
    });

    result = activateGoal(
      result,
      'goal-1',
      'PRIMARY',
      '2026-07-24T18:00:00.000Z',
    );
    expect(result.goals[0]).toMatchObject({
      status: 'ACTIVE',
      priority: 'PRIMARY',
      activatedAt: '2026-07-24T18:00:00.000Z',
      pausedAt: undefined,
    });
  });

  it('completes only active goals', () => {
    const result = portfolio('BENCH_100_KG');
    expect(() => completeGoal(result, 'goal-1', NOW)).toThrow(GoalDomainError);

    const active = activateGoal(result, 'goal-1', 'PRIMARY', NOW);
    const completed = completeGoal(active, 'goal-1', NOW);
    expect(completed.goals[0]).toMatchObject({
      status: 'COMPLETED',
      priority: undefined,
      completedAt: NOW,
    });
  });

  it('archives without rewriting historical timestamps', () => {
    let result = portfolio('BUILD_CHEST');
    result = activateGoal(result, 'goal-1', 'PRIMARY', NOW);
    result = pauseGoal(result, 'goal-1', '2026-07-23T18:00:00.000Z');
    result = archiveGoal(result, 'goal-1', '2026-07-24T18:00:00.000Z');

    expect(result.goals[0]).toMatchObject({
      createdAt: NOW,
      activatedAt: NOW,
      pausedAt: '2026-07-23T18:00:00.000Z',
      archivedAt: '2026-07-24T18:00:00.000Z',
      status: 'ARCHIVED',
    });
  });
});

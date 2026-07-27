import { describe, expect, it } from 'vitest';
import { calculateGoalProgress, GoalEvidenceEvent } from './goal-progress';

describe('calculateGoalProgress', () => {
  const event = (overrides: Partial<GoalEvidenceEvent> = {}): GoalEvidenceEvent => ({
    id: 'event-1',
    goalId: 'goal-build-chest',
    occurredAt: '2026-07-22T10:00:00Z',
    kind: 'TRAINING_VOLUME',
    quality: 'DIRECT',
    outcome: 'COMPLETED',
    contribution: 1,
    sourceId: 'activity-1',
    ...overrides,
  });

  it('is deterministic regardless of event order', () => {
    const events = [event(), event({ id: 'event-2', sourceId: 'activity-2' })];
    const first = calculateGoalProgress('goal-build-chest', events, '2026-07-23T00:00:00Z');
    const second = calculateGoalProgress('goal-build-chest', [...events].reverse(), '2026-07-23T00:00:00Z');
    expect(first).toEqual(second);
  });

  it('counts partial and quit-smart outcomes conservatively', () => {
    const snapshot = calculateGoalProgress(
      'goal-build-chest',
      [
        event({ outcome: 'PARTIAL' }),
        event({ id: 'event-2', sourceId: 'activity-2', outcome: 'QUIT_SMART' }),
      ],
      '2026-07-23T00:00:00Z',
    );

    expect(snapshot.progress).toBeGreaterThan(0);
    expect(snapshot.progress).toBeLessThan(0.2);
    expect(snapshot.reasonCodes).toContain('PARTIAL_ACTIVITY_COUNTED');
    expect(snapshot.reasonCodes).toContain('QUIT_SMART_LIMITED_CONTRIBUTION');
  });

  it('returns no progress and zero confidence without evidence', () => {
    expect(calculateGoalProgress('goal-build-chest', [], '2026-07-23T00:00:00Z')).toEqual({
      goalId: 'goal-build-chest',
      calculatedAt: '2026-07-23T00:00:00Z',
      progress: 0,
      confidence: 0,
      evidenceCount: 0,
      reasonCodes: ['NO_EVIDENCE'],
    });
  });
});

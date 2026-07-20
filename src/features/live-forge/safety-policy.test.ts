import { describe, expect, it } from 'vitest';
import type { LiveForgeSession, NextSetRecommendation } from './domain';
import { applySafetyPolicy } from './safety-policy';

const session: LiveForgeSession = {
  id: 'session-1',
  challengeId: 'challenge-1',
  challengeVersion: 1,
  exerciseId: 'belt-squat',
  equipmentProfile: {
    id: 'hyper-pro',
    name: 'Freak Athlete Hyper Pro',
    exerciseVariant: 'belt-squat',
    availableLoadStepsKg: [10, 20, 30, 40],
  },
  status: 'ACTIVE',
  startedAt: '2026-07-20T18:00:00Z',
  updatedAt: '2026-07-20T18:00:00Z',
  setHistory: [],
};

const increase: NextSetRecommendation = {
  action: 'INCREASE',
  reason: 'LOW_RPE',
  explanationKey: 'liveForge.recommendation.clearIncrease',
  safetyFlags: [],
  prescription: {
    id: 'set-2',
    sequence: 2,
    targetLoadKg: 40,
    targetReps: 10,
  },
};

describe('applySafetyPolicy', () => {
  it('lets explicit stop override progression', () => {
    const result = applySafetyPolicy(session, increase, {
      explicitStop: true,
      systemicCapacity: 'READY',
      localCapacity: 'READY',
    });

    expect(result.recommendation.action).toBe('FINISH');
    expect(result.outcome).toBe('QUIT_SMART');
    expect(result.createsMakeUpDebt).toBe(false);
  });

  it('blocks training when local capacity is avoid', () => {
    const result = applySafetyPolicy(session, increase, {
      systemicCapacity: 'READY',
      localCapacity: 'AVOID',
    });

    expect(result.recommendation.action).toBe('FINISH');
    expect(result.recommendation.safetyFlags).toContain('LOCAL_AVOID');
  });

  it('downgrades an increase under reduced systemic capacity', () => {
    const result = applySafetyPolicy(session, increase, {
      systemicCapacity: 'REDUCED',
      localCapacity: 'READY',
      missedPreviousSession: true,
    });

    expect(result.recommendation.action).toBe('HOLD');
    expect(result.recommendation.reason).toBe('RECOVERY_CONSTRAINT');
    expect(result.createsMakeUpDebt).toBe(false);
  });

  it('passes through a safe recommendation', () => {
    const result = applySafetyPolicy(session, increase, {
      systemicCapacity: 'READY',
      localCapacity: 'READY',
    });

    expect(result.recommendation).toEqual(increase);
  });
});

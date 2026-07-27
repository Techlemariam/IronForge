import { describe, expect, it } from 'vitest';

import { requestSessionStop, type LiveForgeSession } from './domain';
import { resolveNextSet } from './next-set-resolver';

function createSession(): LiveForgeSession {
  return {
    id: 'session-1',
    challengeId: 'belt-squat-pyramid',
    challengeVersion: 1,
    exerciseId: 'belt-squat',
    equipmentProfile: {
      id: 'hyper-pro',
      name: 'Freak Athlete Hyper Pro',
      exerciseVariant: 'belt-squat',
      availableLoadStepsKg: [10, 20, 30, 40],
    },
    status: 'ACTIVE',
    startedAt: '2026-07-20T18:00:00.000Z',
    updatedAt: '2026-07-20T18:00:00.000Z',
    currentPrescription: {
      id: 'set-3',
      sequence: 3,
      targetLoadKg: 30,
      targetReps: 15,
    },
    setHistory: [
      {
        prescriptionId: 'set-1',
        completedAt: '2026-07-20T18:02:00.000Z',
        actualLoadKg: 10,
        actualReps: 20,
        rpe: 3,
      },
      {
        prescriptionId: 'set-2',
        completedAt: '2026-07-20T18:07:00.000Z',
        actualLoadKg: 20,
        actualReps: 15,
        rpe: 5,
      },
    ],
  };
}

describe('resolveNextSet', () => {
  it('never increases load after missed target reps', () => {
    const recommendation = resolveNextSet(createSession(), {
      prescriptionId: 'set-3',
      completedAt: '2026-07-20T18:12:00.000Z',
      actualLoadKg: 30,
      actualReps: 13,
      rpe: 8,
    });

    expect(recommendation.action).toBe('HOLD');
    expect(recommendation.reason).toBe('MISSED_REPS');
    expect(recommendation.safetyFlags).toContain('NO_LOAD_INCREASE');
  });

  it('uses available equipment steps for a low-RPE increase', () => {
    const recommendation = resolveNextSet(createSession(), {
      prescriptionId: 'set-3',
      completedAt: '2026-07-20T18:12:00.000Z',
      actualLoadKg: 30,
      actualReps: 15,
      rpe: 6,
    });

    expect(recommendation.action).toBe('INCREASE');
    expect(recommendation.prescription?.targetLoadKg).toBe(40);
  });

  it('finishes after an explicit stop and emits no prescription', () => {
    const stopped = requestSessionStop(
      createSession(),
      '2026-07-20T18:20:00.000Z',
    );

    const recommendation = resolveNextSet(stopped, {
      prescriptionId: 'set-4',
      completedAt: '2026-07-20T18:19:00.000Z',
      actualLoadKg: 40,
      actualReps: 10,
      rpe: 9,
    });

    expect(recommendation.action).toBe('FINISH');
    expect(recommendation.reason).toBe('EXPLICIT_STOP');
    expect(recommendation.prescription).toBeUndefined();
  });

  it('finishes a high-RPE top set instead of escalating', () => {
    const recommendation = resolveNextSet(createSession(), {
      prescriptionId: 'set-4',
      completedAt: '2026-07-20T18:19:00.000Z',
      actualLoadKg: 40,
      actualReps: 10,
      rpe: 9,
    });

    expect(recommendation.action).toBe('FINISH');
    expect(recommendation.reason).toBe('HIGH_RPE');
    expect(recommendation.safetyFlags).toContain('HIGH_RPE');
  });
});

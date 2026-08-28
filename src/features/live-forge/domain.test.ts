import { describe, expect, it } from 'vitest';

import {
  appendSetResult,
  requestSessionStop,
  type LiveForgeSession,
} from './domain';

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
      id: 'set-1',
      sequence: 1,
      targetLoadKg: 10,
      targetReps: 20,
    },
    setHistory: [],
  };
}

describe('Live Forge domain', () => {
  it('keeps an ordered append-only set history', () => {
    const session = createSession();
    const result = {
      prescriptionId: 'set-1',
      completedAt: '2026-07-20T18:02:00.000Z',
      actualLoadKg: 10,
      actualReps: 20,
      rpe: 4,
    };

    const updated = appendSetResult(session, result);
    const duplicate = appendSetResult(updated, result);

    expect(updated.setHistory).toEqual([result]);
    expect(duplicate).toBe(updated);
  });

  it('turns an explicit stop into a valid quit-smart completion', () => {
    const stopped = requestSessionStop(
      createSession(),
      '2026-07-20T18:20:00.000Z',
    );

    expect(stopped.status).toBe('COMPLETED');
    expect(stopped.outcome).toBe('QUIT_SMART');
    expect(stopped.currentPrescription).toBeUndefined();
    expect(stopped.stopRequestedAt).toBe('2026-07-20T18:20:00.000Z');
  });

  it('rejects set results after the session has stopped', () => {
    const stopped = requestSessionStop(
      createSession(),
      '2026-07-20T18:20:00.000Z',
    );

    expect(() =>
      appendSetResult(stopped, {
        prescriptionId: 'set-2',
        completedAt: '2026-07-20T18:21:00.000Z',
        actualLoadKg: 40,
        actualReps: 10,
        rpe: 9,
      }),
    ).toThrow('Set results can only be added to an active session');
  });
});

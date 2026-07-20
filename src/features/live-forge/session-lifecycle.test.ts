import { describe, expect, it } from 'vitest';
import type { ChallengeDefinition, EquipmentProfile } from './domain';
import {
  abandonSession,
  finishSession,
  InMemoryLiveForgeSessionRepository,
  pauseSession,
  recordSetAndAdvance,
  resumeSession,
  startSession,
} from './session-lifecycle';

const equipment: EquipmentProfile = {
  id: 'hyper-pro-belt-squat',
  name: 'Freak Athlete Hyper Pro',
  exerciseVariant: 'belt-squat',
  availableLoadStepsKg: [10, 20, 30, 40],
};

const challenge: ChallengeDefinition = {
  id: 'belt-squat-pyramid',
  version: 1,
  name: 'Belt Squat Pyramid',
  exerciseId: 'belt-squat',
  equipmentProfileId: equipment.id,
  prescriptions: [
    { id: 'set-1', sequence: 1, targetLoadKg: 10, targetReps: 20 },
    { id: 'set-2', sequence: 2, targetLoadKg: 20, targetReps: 15 },
  ],
};

describe('Live Forge session lifecycle', () => {
  it('starts, records, pauses, resumes and finishes a session', async () => {
    const repository = new InMemoryLiveForgeSessionRepository();
    let session = startSession({
      sessionId: 'session-1',
      challenge,
      equipmentProfile: equipment,
      startedAt: '2026-07-20T18:00:00Z',
    });

    session = recordSetAndAdvance(
      session,
      {
        prescriptionId: 'set-1',
        actualLoadKg: 10,
        actualReps: 20,
        rpe: 4,
        completedAt: '2026-07-20T18:02:00Z',
      },
      challenge.prescriptions[1],
    );
    session = pauseSession(session, '2026-07-20T18:03:00Z');
    await repository.save(session);

    const restored = await repository.get(session.id);
    expect(restored?.status).toBe('PAUSED');
    expect(restored?.setHistory).toHaveLength(1);

    session = resumeSession(restored!, '2026-07-20T18:10:00Z');
    session = finishSession(session, 'STANDARD_CLEAR', '2026-07-20T18:15:00Z');

    expect(session.status).toBe('COMPLETED');
    expect(session.currentPrescription).toBeUndefined();
  });

  it('does not duplicate the same prescription result', () => {
    const started = startSession({
      sessionId: 'session-2',
      challenge,
      equipmentProfile: equipment,
      startedAt: '2026-07-20T18:00:00Z',
    });
    const result = {
      prescriptionId: 'set-1',
      actualLoadKg: 10,
      actualReps: 20,
      completedAt: '2026-07-20T18:02:00Z',
    };
    const recorded = recordSetAndAdvance(started, result, challenge.prescriptions[1]);
    const duplicate = recordSetAndAdvance(
      { ...recorded, currentPrescription: challenge.prescriptions[0] },
      result,
      challenge.prescriptions[1],
    );

    expect(duplicate.setHistory).toHaveLength(1);
  });

  it('abandons without allowing further progression', () => {
    const session = abandonSession(
      startSession({
        sessionId: 'session-3',
        challenge,
        equipmentProfile: equipment,
        startedAt: '2026-07-20T18:00:00Z',
      }),
      '2026-07-20T18:05:00Z',
    );

    expect(session.status).toBe('ABANDONED');
    expect(session.outcome).toBe('ABANDONED');
    expect(session.currentPrescription).toBeUndefined();
  });
});

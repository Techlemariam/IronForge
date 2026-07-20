import type {
  ChallengeDefinition,
  EquipmentProfile,
  LiveForgeSession,
  SessionOutcome,
  SetPrescription,
  SetResult,
} from './domain';

export interface LiveForgeSessionRepository {
  get(sessionId: string): Promise<LiveForgeSession | null>;
  save(session: LiveForgeSession): Promise<void>;
}

export interface StartSessionInput {
  sessionId: string;
  challenge: ChallengeDefinition;
  equipmentProfile: EquipmentProfile;
  startedAt: string;
}

export function startSession(input: StartSessionInput): LiveForgeSession {
  const firstPrescription = input.challenge.prescriptions[0];

  return {
    id: input.sessionId,
    challengeId: input.challenge.id,
    challengeVersion: input.challenge.version,
    exerciseId: input.challenge.exerciseId,
    equipmentProfile: input.equipmentProfile,
    status: 'ACTIVE',
    startedAt: input.startedAt,
    updatedAt: input.startedAt,
    currentPrescription: firstPrescription,
    setHistory: [],
  };
}

export function pauseSession(
  session: LiveForgeSession,
  pausedAt: string,
): LiveForgeSession {
  if (session.status !== 'ACTIVE') {
    throw new Error('Only active sessions can be paused');
  }

  return { ...session, status: 'PAUSED', updatedAt: pausedAt };
}

export function resumeSession(
  session: LiveForgeSession,
  resumedAt: string,
): LiveForgeSession {
  if (session.status !== 'PAUSED') {
    throw new Error('Only paused sessions can be resumed');
  }

  return { ...session, status: 'ACTIVE', updatedAt: resumedAt };
}

export function recordSetAndAdvance(
  session: LiveForgeSession,
  result: SetResult,
  nextPrescription?: SetPrescription,
): LiveForgeSession {
  if (session.status !== 'ACTIVE') {
    throw new Error('Set results can only be recorded for active sessions');
  }

  if (!session.currentPrescription) {
    throw new Error('Active session has no current prescription');
  }

  if (result.prescriptionId !== session.currentPrescription.id) {
    throw new Error('Set result does not match current prescription');
  }

  if (session.setHistory.some((set) => set.prescriptionId === result.prescriptionId)) {
    return session;
  }

  return {
    ...session,
    setHistory: [...session.setHistory, result],
    currentPrescription: nextPrescription,
    updatedAt: result.completedAt,
  };
}

export function finishSession(
  session: LiveForgeSession,
  outcome: Exclude<SessionOutcome, 'ABANDONED'>,
  finishedAt: string,
): LiveForgeSession {
  if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
    return session;
  }

  return {
    ...session,
    status: 'COMPLETED',
    outcome,
    currentPrescription: undefined,
    completedAt: finishedAt,
    updatedAt: finishedAt,
  };
}

export function abandonSession(
  session: LiveForgeSession,
  abandonedAt: string,
): LiveForgeSession {
  if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
    return session;
  }

  return {
    ...session,
    status: 'ABANDONED',
    outcome: 'ABANDONED',
    currentPrescription: undefined,
    completedAt: abandonedAt,
    updatedAt: abandonedAt,
  };
}

export class InMemoryLiveForgeSessionRepository
  implements LiveForgeSessionRepository
{
  private readonly sessions = new Map<string, LiveForgeSession>();

  async get(sessionId: string): Promise<LiveForgeSession | null> {
    const session = this.sessions.get(sessionId);
    return session ? structuredClone(session) : null;
  }

  async save(session: LiveForgeSession): Promise<void> {
    this.sessions.set(session.id, structuredClone(session));
  }
}

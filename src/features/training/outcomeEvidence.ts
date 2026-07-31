export type SessionCompletion = 'FULL' | 'PARTIAL' | 'QUIT_SMART';

export interface OutcomeEvidence {
  sessionId: string;
  completion: SessionCompletion;
  completedSetIds: string[];
  recordedAt: string;
  createsTrainingDebt: false;
}

export function createOutcomeEvidence(
  sessionId: string,
  completion: SessionCompletion,
  completedSetIds: string[],
  recordedAt: string
): OutcomeEvidence {
  return {
    sessionId,
    completion,
    completedSetIds,
    recordedAt,
    createsTrainingDebt: false,
  };
}

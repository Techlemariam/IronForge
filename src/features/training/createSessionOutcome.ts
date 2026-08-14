import { createOutcomeEvidence, type OutcomeEvidence, type SessionCompletion } from './outcomeEvidence';

export interface CompletedSessionSet {
  id: string;
  completed: boolean;
}

export function createSessionOutcome(
  sessionId: string,
  completion: SessionCompletion,
  sets: CompletedSessionSet[],
  recordedAt: string
): OutcomeEvidence {
  return createOutcomeEvidence(
    sessionId,
    completion,
    sets.filter((set) => set.completed).map((set) => set.id),
    recordedAt
  );
}

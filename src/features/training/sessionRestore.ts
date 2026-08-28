export interface RestorableSession {
  sessionId: string;
  revision: number;
  activeExerciseIndex: number;
  completedSetIds: string[];
  updatedAt: string;
}

export function selectNewestSession(
  local: RestorableSession | null,
  persisted: RestorableSession | null
): RestorableSession | null {
  if (!local) return persisted;
  if (!persisted) return local;
  if (local.sessionId !== persisted.sessionId) return persisted;
  return local.revision >= persisted.revision ? local : persisted;
}

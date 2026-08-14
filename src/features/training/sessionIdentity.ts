export interface LocalSessionIdentity {
  sessionId: string;
  source: 'IRONFORGE_LOCAL';
  createdAt: string;
  revision: number;
}

export function createLocalSessionIdentity(sessionId: string, createdAt: string): LocalSessionIdentity {
  if (!sessionId.trim()) throw new Error('sessionId is required');

  return {
    sessionId,
    source: 'IRONFORGE_LOCAL',
    createdAt,
    revision: 1,
  };
}

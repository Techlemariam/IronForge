import type { LocalSessionIdentity } from './sessionIdentity';

export interface StoredLocalSession<T> {
  identity: LocalSessionIdentity;
  payload: T;
}

export class LocalSessionStore<T> {
  private readonly sessions = new Map<string, StoredLocalSession<T>>();

  save(session: StoredLocalSession<T>): void {
    const existing = this.sessions.get(session.identity.sessionId);
    if (existing && existing.identity.revision > session.identity.revision) return;
    this.sessions.set(session.identity.sessionId, session);
  }

  get(sessionId: string): StoredLocalSession<T> | undefined {
    return this.sessions.get(sessionId);
  }
}

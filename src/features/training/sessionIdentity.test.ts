import { describe, expect, it } from 'vitest';
import { createLocalSessionIdentity } from './sessionIdentity';

describe('createLocalSessionIdentity', () => {
  it('creates a stable local identity at revision one', () => {
    expect(createLocalSessionIdentity('session-1', '2026-07-31T12:00:00Z')).toEqual({
      sessionId: 'session-1',
      source: 'IRONFORGE_LOCAL',
      createdAt: '2026-07-31T12:00:00Z',
      revision: 1,
    });
  });

  it('rejects blank ids', () => {
    expect(() => createLocalSessionIdentity('  ', '2026-07-31T12:00:00Z')).toThrow();
  });
});

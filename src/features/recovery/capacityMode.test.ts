import { describe, expect, it } from 'vitest';
import { isCapacitySelectionActive, shouldSuppressIntensity } from './capacityMode';

const selection = {
  mode: 'MINIMUM' as const,
  selectedAt: '2026-07-31T08:00:00Z',
  expiresAt: '2026-08-01T08:00:00Z',
  source: 'USER' as const,
};

describe('capacityMode', () => {
  it('lets active minimum mode suppress intensity', () => {
    expect(isCapacitySelectionActive(selection, '2026-07-31T12:00:00Z')).toBe(true);
    expect(shouldSuppressIntensity(selection)).toBe(true);
  });

  it('expires predictably', () => {
    expect(isCapacitySelectionActive(selection, '2026-08-01T08:00:00Z')).toBe(false);
  });
});

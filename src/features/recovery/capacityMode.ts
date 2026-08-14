export type CapacityMode = 'MINIMUM' | 'GOOD' | 'OPTIMAL';

export interface CapacitySelection {
  mode: CapacityMode;
  selectedAt: string;
  expiresAt: string;
  source: 'USER';
}

export function shouldSuppressIntensity(selection: CapacitySelection): boolean {
  return selection.mode === 'MINIMUM';
}

export function isCapacitySelectionActive(selection: CapacitySelection, now: string): boolean {
  return Date.parse(now) < Date.parse(selection.expiresAt);
}

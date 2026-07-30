export type ActivitySource = 'IRONFORGE_LOCAL' | 'HEVY' | 'INTERVALS_ICU';

export interface ActivityProvenance {
  source: ActivitySource;
  externalId?: string;
  importedAt?: string;
  revision: number;
  normalizedStartTime: string;
}

export function hasStableSourceIdentity(provenance: ActivityProvenance): boolean {
  return provenance.source === 'IRONFORGE_LOCAL' || Boolean(provenance.externalId);
}

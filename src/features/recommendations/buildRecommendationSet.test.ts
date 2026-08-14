import { describe, expect, it } from 'vitest';
import { buildRecommendationSet, type RecommendationCandidate } from './buildRecommendationSet';

const candidate = (id: string): RecommendationCandidate => ({
  id,
  kind: 'TRAIN',
  title: id,
  confidence: 'HIGH',
  equipmentProfileId: 'home',
  estimatedMinutes: 30,
  reasons: [
    { code: 'GOAL_ALIGNMENT', summary: 'Matches goal', source: 'GOAL_ENGINE' },
    { code: 'EQUIPMENT_COMPATIBLE', summary: 'Available at home', source: 'EQUIPMENT' },
    { code: 'DATA_UNCERTAIN', summary: 'Limited history', source: 'SYSTEM' },
    { code: 'TIME_CONSTRAINT', summary: 'Fits available time', source: 'SYSTEM' },
  ],
});

describe('buildRecommendationSet', () => {
  it('returns at most three recommendations and three reasons', () => {
    const result = buildRecommendationSet(['a', 'b', 'c', 'd'].map(candidate), '2026-07-31T12:00:00Z');
    expect(result.recommendations).toHaveLength(3);
    expect(result.recommendations[0]?.reasonCodes).toHaveLength(3);
  });

  it('rejects an empty candidate list', () => {
    expect(() => buildRecommendationSet([], '2026-07-31T12:00:00Z')).toThrow();
  });
});

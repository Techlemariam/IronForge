import { describe, expect, it } from 'vitest';
import { limitReasons, type RecommendationReason } from './reasonCodes';

const reasons: RecommendationReason[] = [
  { code: 'GOAL_ALIGNMENT', summary: 'Goal', source: 'GOAL_ENGINE' },
  { code: 'EQUIPMENT_COMPATIBLE', summary: 'Equipment', source: 'EQUIPMENT' },
  { code: 'LOW_CAPACITY', summary: 'Capacity', source: 'USER' },
  { code: 'TIME_CONSTRAINT', summary: 'Time', source: 'SYSTEM' },
];

describe('limitReasons', () => {
  it('keeps only the three most relevant reasons in input order', () => {
    expect(limitReasons(reasons)).toEqual(reasons.slice(0, 3));
  });
});

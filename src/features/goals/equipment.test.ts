import { describe, expect, it } from 'vitest';

import {
  CHEST_EXERCISE_DEFINITIONS,
  type GoalChallengeCandidate,
  HOME_GYM_WITHOUT_PEC_FLY,
  evaluateEquipmentCompatibility,
  filterEquipmentCompatibleCandidates,
} from './equipment';

const buildChestCandidates: GoalChallengeCandidate[] = [
  {
    id: 'bench',
    exerciseId: 'barbell-bench-press',
    goalId: 'BUILD_CHEST',
    requiredCapability: 'CHEST_HORIZONTAL_PRESS',
  },
  {
    id: 'incline',
    exerciseId: 'incline-barbell-bench-press',
    goalId: 'BUILD_CHEST',
    requiredCapability: 'CHEST_INCLINE_PRESS',
  },
  {
    id: 'push-up',
    exerciseId: 'push-up',
    goalId: 'BUILD_CHEST',
    requiredCapability: 'CHEST_HORIZONTAL_PRESS',
  },
  {
    id: 'pec-deck',
    exerciseId: 'pec-deck',
    goalId: 'BUILD_CHEST',
    requiredCapability: 'CHEST_ADDUCTION',
  },
  {
    id: 'cable-fly',
    exerciseId: 'cable-fly',
    goalId: 'BUILD_CHEST',
    requiredCapability: 'CHEST_ADDUCTION',
  },
  {
    id: 'band-fly',
    exerciseId: 'band-fly',
    goalId: 'BUILD_CHEST',
    requiredCapability: 'CHEST_ADDUCTION',
  },
];

describe('equipment-aware goal planning', () => {
  it('keeps bench and push-up options but removes unavailable fly variations', () => {
    const result = filterEquipmentCompatibleCandidates(
      HOME_GYM_WITHOUT_PEC_FLY,
      buildChestCandidates
    );

    expect(result.map((candidate) => candidate.exerciseId)).toEqual([
      'barbell-bench-press',
      'incline-barbell-bench-press',
      'push-up',
    ]);
  });

  it('treats unknown exercise requirements as incompatible', () => {
    const result = filterEquipmentCompatibleCandidates(HOME_GYM_WITHOUT_PEC_FLY, [
      {
        id: 'unknown',
        exerciseId: 'unknown-machine',
        goalId: 'BUILD_CHEST',
        requiredCapability: 'CHEST_ADDUCTION',
      },
    ]);

    expect(result).toEqual([]);
  });

  it('reports missing equipment for pec deck', () => {
    const pecDeck = CHEST_EXERCISE_DEFINITIONS.find(
      (exercise) => exercise.exerciseId === 'pec-deck'
    );

    expect(pecDeck).toBeDefined();
    if (!pecDeck) {
      throw new Error('Expected pec-deck definition');
    }

    expect(evaluateEquipmentCompatibility(HOME_GYM_WITHOUT_PEC_FLY, pecDeck)).toEqual({
      compatible: false,
      missingEquipment: ['PEC_DECK'],
      reasonCode: 'MISSING_REQUIRED_EQUIPMENT',
    });
  });

  it('respects temporarily unavailable equipment', () => {
    const result = filterEquipmentCompatibleCandidates(
      {
        ...HOME_GYM_WITHOUT_PEC_FLY,
        temporarilyUnavailable: ['ADJUSTABLE_BENCH'],
      },
      buildChestCandidates
    );

    expect(result.map((candidate) => candidate.exerciseId)).toEqual([
      'barbell-bench-press',
      'push-up',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  HOME_GYM_WITHOUT_PEC_FLY,
  type EquipmentInventoryProfile,
} from './equipment';
import { resolveStimulusSubstitutions } from './substitutions';

describe('resolveStimulusSubstitutions', () => {
  it('returns exact adduction exercises when compatible equipment exists', () => {
    const commercialGym: EquipmentInventoryProfile = {
      id: 'commercial-gym',
      name: 'Commercial gym',
      location: 'COMMERCIAL_GYM',
      available: ['PEC_DECK', 'CABLE_MACHINE'],
    };

    const result = resolveStimulusSubstitutions(
      commercialGym,
      'build-chest',
      'CHEST_ADDUCTION',
    );

    expect(result.reasonCode).toBe('EXACT_CAPABILITY_MATCH');
    expect(result.candidates.map((candidate) => candidate.exerciseId)).toEqual([
      'cable-fly',
      'pec-deck',
    ]);
    expect(result.candidates.every((candidate) => candidate.matchQuality === 'EXACT')).toBe(true);
    expect(result.candidates.every((candidate) => candidate.contributionMultiplier === 1)).toBe(true);
  });

  it('falls back to partial press substitutions in a home gym without fly equipment', () => {
    const result = resolveStimulusSubstitutions(
      HOME_GYM_WITHOUT_PEC_FLY,
      'build-chest',
      'CHEST_ADDUCTION',
    );

    expect(result.reasonCode).toBe('PARTIAL_GOAL_CONTRIBUTION');
    expect(result.candidates.map((candidate) => candidate.exerciseId)).toEqual([
      'barbell-bench-press',
      'push-up',
      'incline-barbell-bench-press',
    ]);
    expect(result.candidates.every((candidate) => candidate.matchQuality === 'PARTIAL')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.exerciseId === 'pec-deck')).toBe(false);
    expect(result.candidates.some((candidate) => candidate.exerciseId === 'cable-fly')).toBe(false);
  });

  it('prefers exact horizontal press matches over strong incline substitutions', () => {
    const result = resolveStimulusSubstitutions(
      HOME_GYM_WITHOUT_PEC_FLY,
      'build-chest',
      'CHEST_HORIZONTAL_PRESS',
    );

    expect(result.reasonCode).toBe('EXACT_CAPABILITY_MATCH');
    expect(result.candidates.map((candidate) => candidate.exerciseId)).toEqual([
      'barbell-bench-press',
      'push-up',
    ]);
    expect(result.candidates.some((candidate) => candidate.exerciseId === 'incline-barbell-bench-press')).toBe(false);
  });

  it('returns no compatible substitution when no exercise can satisfy the objective', () => {
    const emptyTravelProfile: EquipmentInventoryProfile = {
      id: 'empty-travel',
      name: 'Travel without equipment',
      location: 'TRAVEL',
      available: [],
      temporarilyUnavailable: [],
    };

    const result = resolveStimulusSubstitutions(
      emptyTravelProfile,
      'build-upper-chest',
      'CHEST_INCLINE_PRESS',
      [],
    );

    expect(result).toEqual({
      candidates: [],
      reasonCode: 'NO_COMPATIBLE_SUBSTITUTION',
    });
  });

  it('is deterministic for the same profile and objective', () => {
    const first = resolveStimulusSubstitutions(
      HOME_GYM_WITHOUT_PEC_FLY,
      'build-chest',
      'CHEST_ADDUCTION',
    );
    const second = resolveStimulusSubstitutions(
      HOME_GYM_WITHOUT_PEC_FLY,
      'build-chest',
      'CHEST_ADDUCTION',
    );

    expect(second).toEqual(first);
  });
});

// src/utils/hyperProAdvisorAdapter.ts

import type { HyperProTaxonomy } from '@/types';

export const hyperProTaxonomyMap = new Map<string, HyperProTaxonomy>([
  [
    'Push Up',
    {
      pattern: 'UPPER_ACCESSORY',
      setupMode: 'Flat/Incline (Bench)',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Chest'],
      secondaryMuscles: ['Triceps', 'Shoulders (Front)'],
      progressionFamily: 'Weighted Push Up',
      regressionFamily: 'Knee Push Up',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: false,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Dips',
    {
      pattern: 'UPPER_ACCESSORY',
      setupMode: 'Dip Station',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Chest'],
      secondaryMuscles: ['Triceps', 'Shoulders (Front)'],
      progressionFamily: 'Weighted Dips',
      regressionFamily: 'Band Assisted Dips',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: false,
        isLowFriction: true,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    '45° Back Extension',
    {
      pattern: 'HIP_EXTENSION',
      setupMode: '45° Extension',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Back (Thickness)'],
      secondaryMuscles: ['Hamstrings', 'Glutes'],
      progressionFamily: 'Weighted 45° Back Extension',
      regressionFamily: 'Flat Bench Hyperextension',
      frictionLevel: 'MEDIUM',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: false,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    '90° Back Extension',
    {
      pattern: 'HIP_EXTENSION',
      setupMode: '90° Extension',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Back (Thickness)'],
      secondaryMuscles: ['Hamstrings', 'Glutes'],
      progressionFamily: 'Weighted 90° Back Extension',
      regressionFamily: '45° Back Extension',
      frictionLevel: 'MEDIUM',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: false,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    'Goblet Squat',
    {
      pattern: 'KNEE_EXTENSION',
      setupMode: 'Slant Board Squat',
      loadingStyle: 'DUMBBELL_KETTLEBELL',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glutes'],
      progressionFamily: 'Front Squat (Barbell)',
      regressionFamily: 'Bodyweight Squat',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Bulgarian Split Squat',
    {
      pattern: 'UNILATERAL_LOWER',
      setupMode: 'Split Squat Stand',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glutes', 'Hamstrings'],
      progressionFamily: 'Dumbbell Bulgarian Split Squat',
      regressionFamily: 'Reverse Lunge',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: true,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    'Leg Extension',
    {
      pattern: 'KNEE_EXTENSION',
      setupMode: 'Leg Extension Attachment',
      loadingStyle: 'PLATE_LOADED',
      primaryMuscles: ['Quads'],
      secondaryMuscles: [],
      progressionFamily: 'Heavy Leg Extension',
      regressionFamily: 'Band Leg Extension',
      frictionLevel: 'HIGH',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: false,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Sissy Squat',
    {
      pattern: 'KNEE_EXTENSION',
      setupMode: 'Sissy Squat Station',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Quads'],
      secondaryMuscles: [],
      progressionFamily: 'Weighted Sissy Squat',
      regressionFamily: 'Supported Sissy Squat',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: false,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Reverse Nordic',
    {
      pattern: 'KNEE_EXTENSION',
      setupMode: 'Floor/Pad',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Quads'],
      secondaryMuscles: [],
      progressionFamily: 'Weighted Reverse Nordic',
      regressionFamily: 'Band Assisted Reverse Nordic',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'KOT Squat',
    {
      pattern: 'KNEE_EXTENSION',
      setupMode: 'Slant Board',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Quads'],
      secondaryMuscles: [],
      progressionFamily: 'Weighted KOT Squat',
      regressionFamily: 'Assisted KOT Squat',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Nordic Curl',
    {
      pattern: 'KNEE_FLEXION',
      setupMode: 'Nordic Station',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes'],
      progressionFamily: 'Full Nordic Curl',
      regressionFamily: 'Band Assisted Nordic Curl',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: true,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    'Glute Ham Raise',
    {
      pattern: 'HIP_EXTENSION',
      setupMode: 'GHD',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: ['Glutes', 'Back (Thickness)'],
      progressionFamily: 'Weighted GHR',
      regressionFamily: 'Band Assisted GHR',
      frictionLevel: 'MEDIUM',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: false,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    'Hamstring Curl (Lying)',
    {
      pattern: 'KNEE_FLEXION',
      setupMode: 'Leg Curl Attachment',
      loadingStyle: 'PLATE_LOADED',
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: [],
      progressionFamily: 'Heavy Hamstring Curl',
      regressionFamily: 'Band Hamstring Curl',
      frictionLevel: 'HIGH',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: false,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Reverse Hyper',
    {
      pattern: 'HIP_EXTENSION',
      setupMode: 'Reverse Hyper Attachment',
      loadingStyle: 'PLATE_LOADED',
      primaryMuscles: ['Glutes'],
      secondaryMuscles: ['Back (Thickness)', 'Hamstrings'],
      progressionFamily: 'Heavy Reverse Hyper',
      regressionFamily: 'Bodyweight Reverse Hyper',
      frictionLevel: 'HIGH',
      suitabilityFlags: {
        isStrengthAccessory: true,
        isHypertrophyFocused: true,
        isPrehabFocused: true,
        isLowFriction: false,
        isPowerliftingAccessory: true,
      },
    },
  ],
  [
    'GHD Sit-Up',
    {
      pattern: 'TRUNK_CORE',
      setupMode: 'GHD',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Abs'],
      secondaryMuscles: [],
      progressionFamily: 'Weighted GHD Sit-Up',
      regressionFamily: 'Decline Sit Up',
      frictionLevel: 'MEDIUM',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: false,
        isLowFriction: false,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Dragon Flag',
    {
      pattern: 'TRUNK_CORE',
      setupMode: 'Bench Handle',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Abs'],
      secondaryMuscles: [],
      progressionFamily: 'Dragon Flag Crunches',
      regressionFamily: 'Leg Raise',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: false,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
  [
    'Decline Sit Up',
    {
      pattern: 'TRUNK_CORE',
      setupMode: 'Decline Bench',
      loadingStyle: 'BODYWEIGHT',
      primaryMuscles: ['Abs'],
      secondaryMuscles: [],
      progressionFamily: 'GHD Sit-Up',
      regressionFamily: 'Flat Bench Sit Up',
      frictionLevel: 'LOW',
      suitabilityFlags: {
        isStrengthAccessory: false,
        isHypertrophyFocused: true,
        isPrehabFocused: false,
        isLowFriction: true,
        isPowerliftingAccessory: false,
      },
    },
  ],
]);

export interface VolumeContribution {
  primaryMuscle: string;
  secondaryMuscles: string[];
  primarySets: number;
  secondarySets: number;
}

/**
 * Calculates how much a Hyper Pro exercise contributes to weekly volumes.
 * Primary muscle gets 100% of sets, secondary muscles get 50% contribution.
 */
export const getHyperProVolumeContribution = (
  exerciseName: string,
  sets: number
): VolumeContribution | null => {
  const taxonomy = hyperProTaxonomyMap.get(exerciseName);
  if (!taxonomy) return null;

  return {
    primaryMuscle: taxonomy.primaryMuscles[0],
    secondaryMuscles: taxonomy.secondaryMuscles,
    primarySets: sets,
    secondarySets: Math.round(sets * 0.5 * 10) / 10, // 50% contribution
  };
};

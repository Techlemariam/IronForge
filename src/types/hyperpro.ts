// src/types/hyperpro.ts

export type HyperProPattern = 
  | 'KNEE_FLEXION' // Nordic, leg curls
  | 'HIP_EXTENSION' // back extension, reverse hyper, GHD
  | 'KNEE_EXTENSION' // leg extension, reverse Nordic, sissy squat
  | 'UNILATERAL_LOWER' // split squat variants
  | 'TRUNK_CORE' // GHD sit-ups, decline sit-ups
  | 'UPPER_ACCESSORY' // dips, push-up variants
  | 'MOBILITY_PREHAB'; // slant board slant work, Tibialis work

export type HyperProLoadingStyle = 'BODYWEIGHT' | 'BANDED' | 'PLATE_LOADED' | 'DUMBBELL_KETTLEBELL';

export type FrictionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface HyperProTaxonomy {
  pattern: HyperProPattern;
  setupMode: string; // e.g. "GHD", "Slant Board", "Leg Extension Attachment"
  loadingStyle: HyperProLoadingStyle;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  progressionFamily: string; // Name of exercise it progresses to
  regressionFamily: string; // Name of exercise it regresses to
  frictionLevel: FrictionLevel; // Transition friction (high if complex setup change)
  suitabilityFlags: {
    isStrengthAccessory: boolean;
    isHypertrophyFocused: boolean;
    isPrehabFocused: boolean;
    isLowFriction: boolean;
    isPowerliftingAccessory: boolean;
  };
}

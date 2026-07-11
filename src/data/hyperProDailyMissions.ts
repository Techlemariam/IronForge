// src/data/hyperProDailyMissions.ts

import type { HyperProTaxonomy, HyperProPattern } from '@/types';

/**
 * Daily mission template for Hyper Pro exercises.
 * Each mission combines a training intent with a specific Hyper Pro exercise
 * and defines three clear‑levels (minimum, standard, boss) together with
 * RPE guidance, stop‑conditions and reward reasons.
 */
export interface HyperProDailyMission {
  /** Unique identifier */
  id: string;
  /** Human‑readable name */
  name: string;
  /** The underlying taxonomy entry for the exercise */
  taxonomy: HyperProTaxonomy;
  /** Training intent description */
  intent: string;
  /** Clear levels */
  clears: {
    minimum: string;
    standard: string;
    boss: string;
  };
  /** RPE guidance (e.g., "RPE 6‑7") */
  rpeGuidance: string;
  /** When to stop the set */
  stopCondition: string;
  /** Reason why this mission is rewarding */
  rewardReason: string;
}

/** Helper to fetch taxonomy by exercise name */
import { hyperProTaxonomyMap } from '@/utils/hyperProAdvisorAdapter';

function getTaxonomy(name: string): HyperProTaxonomy {
  const t = hyperProTaxonomyMap.get(name);
  if (!t) throw new Error(`Taxonomy entry not found for ${name}`);
  return t;
}

export const hyperProDailyMissions: HyperProDailyMission[] = [
  {
    id: 'posterior_chain_minimum',
    name: 'Posterior Chain Minimum',
    taxonomy: getTaxonomy('45° Back Extension'),
    intent: 'Activate glutes and hamstrings with low‑friction volume',
    clears: {
      minimum: '2 sets x 10 reps, low load',
      standard: '3 sets x 12 reps, moderate load',
      boss: '4 sets x 15 reps, heavy load',
    },
    rpeGuidance: 'RPE 6‑7',
    stopCondition: 'Stop if lower back tightens or hips round',
    rewardReason: 'Improves posterior chain strength for deadlift support',
  },
  {
    id: 'hamstring_strength_progression',
    name: 'Hamstring Strength / Nordic Progression',
    taxonomy: getTaxonomy('Nordic Curl'),
    intent: 'Eccentric hamstring overload – progress from assisted to full',
    clears: {
      minimum: 'Assisted Nordic, 2 × 8',
      standard: 'Partial ROM Nordic, 3 × 8',
      boss: 'Full ROM Nordic with load, 4 × 6',
    },
    rpeGuidance: 'RPE 7‑8',
    stopCondition: 'Stop if hamstring cramps or hip hinge fails',
    rewardReason: 'Increases eccentric strength, reduces injury risk',
  },
  {
    id: 'quad_accessory',
    name: 'Quad Accessory / Sissy‑Reverse Nordic',
    taxonomy: getTaxonomy('Sissy Squat'),
    intent: 'Quad hypertrophy with deep knee flexion',
    clears: {
      minimum: 'Supported Sissy, 2 × 10',
      standard: 'Bodyweight Sissy, 3 × 8',
      boss: 'Weighted Sissy, 4 × 6',
    },
    rpeGuidance: 'RPE 7‑8',
    stopCondition: 'Stop if knee pain or form breaks',
    rewardReason: 'Builds quad mass for leg‑day overload',
  },
  {
    id: 'core_gdh',
    name: 'Core / GHD Sit‑Up',
    taxonomy: getTaxonomy('GHD Sit-Up'),
    intent: 'Core stability and abdominal hypertrophy',
    clears: {
      minimum: 'Short ROM GHD, 2 × 10',
      standard: 'Full ROM GHD, 3 × 8',
      boss: 'Weighted GHD, 4 × 6',
    },
    rpeGuidance: 'RPE 7‑8',
    stopCondition: 'Stop if abs cramp or hip flexors dominate',
    rewardReason: 'Enhances spinal stability for heavy lifts',
  },
  {
    id: 'low_friction_home',
    name: 'Low‑Friction Home Strength',
    taxonomy: getTaxonomy('Push Up'),
    intent: 'Bodyweight strength with minimal equipment',
    clears: {
      minimum: 'Push‑ups 2 × 12',
      standard: 'Weighted Push‑ups 3 × 8',
      boss: 'Weighted Push‑ups + elevated feet 4 × 6',
    },
    rpeGuidance: 'RPE 6‑7',
    stopCondition: 'Stop if shoulders strain or back rounds',
    rewardReason: 'Provides a quick, equipment‑free strength session',
  },
  {
    id: 'powerlifting_accessory',
    name: 'Powerlifting Accessory Day',
    taxonomy: getTaxonomy('Dips'),
    intent: 'Upper‑body accessory for bench press support',
    clears: {
      minimum: 'Band‑assisted Dips 2 × 8',
      standard: 'Bodyweight Dips 3 × 8',
      boss: 'Weighted Dips 4 × 6',
    },
    rpeGuidance: 'RPE 7‑8',
    stopCondition: 'Stop if shoulder pain or excessive swing',
    rewardReason: 'Strengthens chest, triceps, and shoulder stability',
  },
];

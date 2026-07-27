export type EquipmentKind =
  | 'BARBELL'
  | 'WEIGHT_PLATES'
  | 'FLAT_BENCH'
  | 'ADJUSTABLE_BENCH'
  | 'RACK'
  | 'SAFETY_ARMS'
  | 'DUMBBELLS'
  | 'RESISTANCE_BANDS'
  | 'SAFE_BAND_ANCHOR'
  | 'CABLE_MACHINE'
  | 'PEC_DECK';

export type TrainingLocation = 'HOME_GYM' | 'COMMERCIAL_GYM' | 'TRAVEL';

export interface EquipmentInventoryProfile {
  id: string;
  name: string;
  location: TrainingLocation;
  available: EquipmentKind[];
  temporarilyUnavailable?: EquipmentKind[];
}

export type StimulusCapability =
  | 'CHEST_HORIZONTAL_PRESS'
  | 'CHEST_INCLINE_PRESS'
  | 'CHEST_ADDUCTION';

export interface ExerciseEquipmentDefinition {
  exerciseId: string;
  requiredEquipment: EquipmentKind[];
  stimulusCapabilities: StimulusCapability[];
}

export interface GoalChallengeCandidate {
  id: string;
  exerciseId: string;
  goalId: string;
  requiredCapability: StimulusCapability;
}

export interface EquipmentCompatibilityResult {
  compatible: boolean;
  missingEquipment: EquipmentKind[];
  reasonCode: 'EQUIPMENT_COMPATIBLE' | 'MISSING_REQUIRED_EQUIPMENT';
}

export const CHEST_EXERCISE_DEFINITIONS: ExerciseEquipmentDefinition[] = [
  {
    exerciseId: 'barbell-bench-press',
    requiredEquipment: ['BARBELL', 'WEIGHT_PLATES', 'FLAT_BENCH', 'RACK'],
    stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
  },
  {
    exerciseId: 'incline-barbell-bench-press',
    requiredEquipment: ['BARBELL', 'WEIGHT_PLATES', 'ADJUSTABLE_BENCH', 'RACK'],
    stimulusCapabilities: ['CHEST_INCLINE_PRESS'],
  },
  {
    exerciseId: 'dumbbell-bench-press',
    requiredEquipment: ['DUMBBELLS', 'FLAT_BENCH'],
    stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
  },
  {
    exerciseId: 'push-up',
    requiredEquipment: [],
    stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
  },
  {
    exerciseId: 'band-fly',
    requiredEquipment: ['RESISTANCE_BANDS', 'SAFE_BAND_ANCHOR'],
    stimulusCapabilities: ['CHEST_ADDUCTION'],
  },
  {
    exerciseId: 'cable-fly',
    requiredEquipment: ['CABLE_MACHINE'],
    stimulusCapabilities: ['CHEST_ADDUCTION'],
  },
  {
    exerciseId: 'pec-deck',
    requiredEquipment: ['PEC_DECK'],
    stimulusCapabilities: ['CHEST_ADDUCTION'],
  },
];

export const HOME_GYM_WITHOUT_PEC_FLY: EquipmentInventoryProfile = {
  id: 'home-gym-without-pec-fly',
  name: 'Home gym',
  location: 'HOME_GYM',
  available: ['BARBELL', 'WEIGHT_PLATES', 'FLAT_BENCH', 'ADJUSTABLE_BENCH', 'RACK', 'SAFETY_ARMS'],
};

function activeEquipment(profile: EquipmentInventoryProfile): Set<EquipmentKind> {
  const unavailable = new Set(profile.temporarilyUnavailable ?? []);
  return new Set(profile.available.filter((item) => !unavailable.has(item)));
}

export function evaluateEquipmentCompatibility(
  profile: EquipmentInventoryProfile,
  exercise: ExerciseEquipmentDefinition
): EquipmentCompatibilityResult {
  const available = activeEquipment(profile);
  const missingEquipment = exercise.requiredEquipment.filter((item) => !available.has(item));

  return missingEquipment.length === 0
    ? {
        compatible: true,
        missingEquipment: [],
        reasonCode: 'EQUIPMENT_COMPATIBLE',
      }
    : {
        compatible: false,
        missingEquipment,
        reasonCode: 'MISSING_REQUIRED_EQUIPMENT',
      };
}

export function filterEquipmentCompatibleCandidates(
  profile: EquipmentInventoryProfile,
  candidates: GoalChallengeCandidate[],
  exercises: ExerciseEquipmentDefinition[] = CHEST_EXERCISE_DEFINITIONS
): GoalChallengeCandidate[] {
  const definitions = new Map(exercises.map((exercise) => [exercise.exerciseId, exercise]));

  return candidates.filter((candidate) => {
    const exercise = definitions.get(candidate.exerciseId);
    if (!exercise) {
      return false;
    }

    return evaluateEquipmentCompatibility(profile, exercise).compatible;
  });
}

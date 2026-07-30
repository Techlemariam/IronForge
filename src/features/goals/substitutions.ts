import {
  CHEST_EXERCISE_DEFINITIONS,
  evaluateEquipmentCompatibility,
  type EquipmentInventoryProfile,
  type ExerciseEquipmentDefinition,
  type GoalChallengeCandidate,
  type StimulusCapability,
} from './equipment';

export type StimulusMatchQuality = 'EXACT' | 'STRONG' | 'PARTIAL';

export type SubstitutionReasonCode =
  | 'EXACT_CAPABILITY_MATCH'
  | 'STRONG_STIMULUS_SUBSTITUTION'
  | 'PARTIAL_GOAL_CONTRIBUTION'
  | 'NO_COMPATIBLE_SUBSTITUTION';

export interface StimulusSubstitutionRule {
  sourceCapability: StimulusCapability;
  replacementCapability: StimulusCapability;
  matchQuality: Exclude<StimulusMatchQuality, 'EXACT'>;
  contributionMultiplier: number;
  reasonCode: Exclude<
    SubstitutionReasonCode,
    'EXACT_CAPABILITY_MATCH' | 'NO_COMPATIBLE_SUBSTITUTION'
  >;
}

export interface SubstitutionCandidate extends GoalChallengeCandidate {
  sourceCapability: StimulusCapability;
  deliveredCapability: StimulusCapability;
  matchQuality: StimulusMatchQuality;
  contributionMultiplier: number;
  reasonCode: Exclude<SubstitutionReasonCode, 'NO_COMPATIBLE_SUBSTITUTION'>;
}

export interface SubstitutionResolution {
  candidates: SubstitutionCandidate[];
  reasonCode: SubstitutionReasonCode;
}

export const CHEST_SUBSTITUTION_RULES: StimulusSubstitutionRule[] = [
  {
    sourceCapability: 'CHEST_ADDUCTION',
    replacementCapability: 'CHEST_HORIZONTAL_PRESS',
    matchQuality: 'PARTIAL',
    contributionMultiplier: 0.55,
    reasonCode: 'PARTIAL_GOAL_CONTRIBUTION',
  },
  {
    sourceCapability: 'CHEST_ADDUCTION',
    replacementCapability: 'CHEST_INCLINE_PRESS',
    matchQuality: 'PARTIAL',
    contributionMultiplier: 0.45,
    reasonCode: 'PARTIAL_GOAL_CONTRIBUTION',
  },
  {
    sourceCapability: 'CHEST_HORIZONTAL_PRESS',
    replacementCapability: 'CHEST_INCLINE_PRESS',
    matchQuality: 'STRONG',
    contributionMultiplier: 0.8,
    reasonCode: 'STRONG_STIMULUS_SUBSTITUTION',
  },
  {
    sourceCapability: 'CHEST_INCLINE_PRESS',
    replacementCapability: 'CHEST_HORIZONTAL_PRESS',
    matchQuality: 'STRONG',
    contributionMultiplier: 0.75,
    reasonCode: 'STRONG_STIMULUS_SUBSTITUTION',
  },
];

function compatibleExercisesForCapability(
  profile: EquipmentInventoryProfile,
  capability: StimulusCapability,
  exercises: ExerciseEquipmentDefinition[],
): ExerciseEquipmentDefinition[] {
  return exercises.filter(
    (exercise) =>
      exercise.stimulusCapabilities.includes(capability) &&
      evaluateEquipmentCompatibility(profile, exercise).compatible,
  );
}

function toCandidate(
  goalId: string,
  sourceCapability: StimulusCapability,
  exercise: ExerciseEquipmentDefinition,
  deliveredCapability: StimulusCapability,
  matchQuality: StimulusMatchQuality,
  contributionMultiplier: number,
  reasonCode: Exclude<SubstitutionReasonCode, 'NO_COMPATIBLE_SUBSTITUTION'>,
): SubstitutionCandidate {
  return {
    id: `${goalId}:${sourceCapability}:${exercise.exerciseId}`,
    exerciseId: exercise.exerciseId,
    goalId,
    requiredCapability: sourceCapability,
    sourceCapability,
    deliveredCapability,
    matchQuality,
    contributionMultiplier,
    reasonCode,
  };
}

export function resolveStimulusSubstitutions(
  profile: EquipmentInventoryProfile,
  goalId: string,
  requiredCapability: StimulusCapability,
  exercises: ExerciseEquipmentDefinition[] = CHEST_EXERCISE_DEFINITIONS,
  rules: StimulusSubstitutionRule[] = CHEST_SUBSTITUTION_RULES,
): SubstitutionResolution {
  const exact = compatibleExercisesForCapability(
    profile,
    requiredCapability,
    exercises,
  ).map((exercise) =>
    toCandidate(
      goalId,
      requiredCapability,
      exercise,
      requiredCapability,
      'EXACT',
      1,
      'EXACT_CAPABILITY_MATCH',
    ),
  );

  if (exact.length > 0) {
    return {
      candidates: exact,
      reasonCode: 'EXACT_CAPABILITY_MATCH',
    };
  }

  const substitutions = rules
    .filter((rule) => rule.sourceCapability === requiredCapability)
    .flatMap((rule) =>
      compatibleExercisesForCapability(
        profile,
        rule.replacementCapability,
        exercises,
      ).map((exercise) =>
        toCandidate(
          goalId,
          requiredCapability,
          exercise,
          rule.replacementCapability,
          rule.matchQuality,
          rule.contributionMultiplier,
          rule.reasonCode,
        ),
      ),
    )
    .sort((left, right) => {
      if (right.contributionMultiplier !== left.contributionMultiplier) {
        return right.contributionMultiplier - left.contributionMultiplier;
      }
      return left.exerciseId.localeCompare(right.exerciseId);
    });

  if (substitutions.length === 0) {
    return {
      candidates: [],
      reasonCode: 'NO_COMPATIBLE_SUBSTITUTION',
    };
  }

  return {
    candidates: substitutions,
    reasonCode: substitutions[0].reasonCode,
  };
}

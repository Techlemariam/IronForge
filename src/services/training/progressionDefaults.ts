import type { EquipmentConstraints } from '@/services/training/progressionEngine';
import type { Exercise } from '@/types';

export type ExerciseRegion = 'UPPER' | 'LOWER' | 'FULL_BODY' | 'UNKNOWN';

type ExerciseClassificationInput = Pick<Exercise, 'name'> & {
  muscleGroup?: string | null;
};

const LOWER_BODY_MUSCLE_GROUPS = new Set([
  'LEGS',
  'QUADRICEPS',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES',
]);

const UPPER_BODY_MUSCLE_GROUPS = new Set([
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
]);

const LOWER_BODY_TERMS = [
  'squat',
  'deadlift',
  'leg press',
  'leg extension',
  'leg curl',
  'hamstring curl',
  'lunge',
  'split squat',
  'hip thrust',
  'hip abduction',
  'hip adduction',
  'glute bridge',
  'glute ham',
  'nordic hamstring',
  'calf',
  'hack squat',
  'belt squat',
  'good morning',
  'romanian deadlift',
  'rdl',
];

const UPPER_BODY_TERMS = [
  'bench',
  'overhead press',
  'shoulder press',
  'military press',
  'row',
  'pulldown',
  'pull-up',
  'chin-up',
  'curl',
  'triceps extension',
  'raise',
  'fly',
  'dip',
];

export function inferExerciseRegion(exercise: ExerciseClassificationInput): ExerciseRegion {
  const muscleGroup = exercise.muscleGroup?.trim().toUpperCase();
  if (muscleGroup === 'FULL_BODY') return 'FULL_BODY';
  if (muscleGroup && LOWER_BODY_MUSCLE_GROUPS.has(muscleGroup)) return 'LOWER';
  if (muscleGroup && UPPER_BODY_MUSCLE_GROUPS.has(muscleGroup)) return 'UPPER';

  const name = exercise.name.toLowerCase();
  if (LOWER_BODY_TERMS.some((term) => name.includes(term))) return 'LOWER';
  if (UPPER_BODY_TERMS.some((term) => name.includes(term))) return 'UPPER';
  return 'UNKNOWN';
}

export function getDefaultEquipmentConstraints(
  exercise: ExerciseClassificationInput
): EquipmentConstraints {
  return {
    minimumIncrement: inferExerciseRegion(exercise) === 'LOWER' ? 5 : 2.5,
  };
}

export function resolveEquipmentConstraints(
  exercise: ExerciseClassificationInput,
  override?: Partial<EquipmentConstraints>
): EquipmentConstraints {
  const defaults = getDefaultEquipmentConstraints(exercise);
  return {
    minimumIncrement:
      override?.minimumIncrement && override.minimumIncrement > 0
        ? override.minimumIncrement
        : defaults.minimumIncrement,
    availableLoads: override?.availableLoads,
  };
}
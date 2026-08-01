import type { EquipmentConstraints } from '@/services/training/progressionEngine';
import type { Exercise } from '@/types';

export type ExerciseRegion = 'UPPER' | 'LOWER' | 'FULL_BODY' | 'UNKNOWN';

const LOWER_BODY_TERMS = [
  'squat',
  'deadlift',
  'leg press',
  'leg extension',
  'leg curl',
  'lunge',
  'split squat',
  'hip thrust',
  'glute bridge',
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

export function inferExerciseRegion(exercise: Pick<Exercise, 'name'>): ExerciseRegion {
  const name = exercise.name.toLowerCase();
  if (LOWER_BODY_TERMS.some((term) => name.includes(term))) return 'LOWER';
  if (UPPER_BODY_TERMS.some((term) => name.includes(term))) return 'UPPER';
  return 'UNKNOWN';
}

export function getDefaultEquipmentConstraints(
  exercise: Pick<Exercise, 'name'>
): EquipmentConstraints {
  return {
    minimumIncrement: inferExerciseRegion(exercise) === 'LOWER' ? 5 : 2.5,
  };
}

export function resolveEquipmentConstraints(
  exercise: Pick<Exercise, 'name'>,
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

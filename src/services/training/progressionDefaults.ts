import type { Exercise } from '@/types';
import type { EquipmentConstraints } from '@/services/training/progressionEngine';

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
  'press',
  'row',
  'pulldown',
  'pull-up',
  'chin-up',
  'curl',
  'extension',
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
  const region = inferExerciseRegion(exercise);
  return {
    minimumIncrement: region === 'LOWER' ? 5 : 2.5,
  };
}

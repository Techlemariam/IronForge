import type { z } from 'zod';
import type {
  HevyExerciseSchema,
  HevyExerciseTemplateSchema,
  HevyRoutineSchema,
  HevySetSchema,
  HevyWorkoutSchema,
} from './schemas';

export type HevySet = z.infer<typeof HevySetSchema>;
export type HevyExerciseTemplate = z.infer<typeof HevyExerciseTemplateSchema>;
export type HevyExercise = z.infer<typeof HevyExerciseSchema>;
export type HevyRoutine = z.infer<typeof HevyRoutineSchema>;
export type HevyWorkout = z.infer<typeof HevyWorkoutSchema>;

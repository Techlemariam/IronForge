export interface HevyExerciseTemplate {
  id: string;
  title: string;
  type: string; // "weight", "reps_only", etc.
  primary_muscle_group?: string; // Viktigt för Weakness Auditor!
  secondary_muscle_groups?: string[];
}

export interface HevySetTemplate {
  id: string;
  type: string; // "normal", "warmup", "failure"
  weight_kg?: number;
  reps?: number;
  rpe?: number;
}

export interface HevyRoutineExercise {
  exercise_template_id: string;
  exercise_template: HevyExerciseTemplate; // Den länkade infon
  sets: HevySetTemplate[];
  notes?: string;
}

export interface HevyRoutine {
  id: string;
  title: string; // T.ex. "Push Day A"
  notes?: string;
  folder_id?: number;
  exercises: HevyRoutineExercise[];
}

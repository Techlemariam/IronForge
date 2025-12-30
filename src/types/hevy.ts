export interface HevySet {
  weight_kg: number;
  reps: number;
  index?: number;
  type?: string;
}

export interface HevyExerciseTemplate {
  id: string;
  title: string;
  primary_muscle_group?: string;
}

export interface HevyRoutine {
  id: string;
  title: string;
  folder_id?: number | null;
  updated_at?: string;
  created_at?: string;
  notes?: string;
  exercises?: HevyExercise[];
}

export interface HevyExercise {
  exercise_template_id: string;
  exercise_template: HevyExerciseTemplate;
  sets: HevySet[];
  notes?: string;
}

export interface HevyWorkout {
  id: string;
  title: string;
  start_time: string;
  duration_seconds: number;
  exercises: HevyExercise[];
}

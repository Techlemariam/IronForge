
// src/types/hevy.ts - TILLÄGG

export interface HevySet {
    weight_kg: number;
    reps: number;
    // ... andra set-detaljer
}

export interface HevyExercise {
    exercise_template_id: string;
    exercise_template: { title: string; primary_muscle_group: string; }; // Viktigt för analysen!
    sets: HevySet[];
}

export interface HevyWorkout {
    id: string;
    title: string;
    start_time: string;
    duration_seconds: number;
    exercises: HevyExercise[];
}

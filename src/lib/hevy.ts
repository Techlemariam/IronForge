import { z } from "zod";
import type { HevyWorkout, HevyExerciseTemplate } from "@/types/hevy";

const EXTERNAL_BASE_URL = "https://api.hevyapp.com/v1";

// --- ZOD SCHEMAS ---

const HevySetSchema = z.object({
  weight_kg: z.number(),
  reps: z.number(),
  index: z.number().optional(),
  type: z.string().optional(),
});

const HevyExerciseTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  primary_muscle_group: z.string().optional(),
});

const HevyExerciseSchema = z.object({
  exercise_template_id: z.string(),
  exercise_template: HevyExerciseTemplateSchema,
  sets: z.array(HevySetSchema),
  notes: z.string().optional(),
});

const HevyWorkoutSchema = z.object({
  id: z.string(),
  title: z.string(),
  start_time: z.string(),
  duration_seconds: z.number(),
  exercises: z.array(HevyExerciseSchema),
});

const HevyWorkoutsResponseSchema = z.object({
  workouts: z.array(HevyWorkoutSchema),
  page_count: z.number().optional(),
});

const HevyTemplatesResponseSchema = z.object({
  exercise_templates: z.array(HevyExerciseTemplateSchema),
});

// --- API METHODS ---

/**
 * Fetches the user's workout history from the external Hevy API.
 * This is safe to call from both server components and API routes.
 */
export const getHevyWorkouts = async (
  apiKey: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<{ workouts: HevyWorkout[]; page_count: number }> => {
  const effectivePageSize = Math.min(pageSize, 10);
  const url = `${EXTERNAL_BASE_URL}/workouts?page=${page}&pageSize=${effectivePageSize}`;

  try {
    const response = await fetch(url, {
      headers: {
        "api-key": apiKey,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hevy API Error [Workouts]: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();

    // Validate Response
    const result = HevyWorkoutsResponseSchema.safeParse(data);

    if (!result.success) {
      console.warn("Hevy Validation Warning (Workouts):", result.error);
      // We throw here to ensure data integrity for Oracle analysis
      throw new Error(`Hevy Data Invalid: ${result.error.message}`);
    }

    return {
      workouts: result.data.workouts,
      page_count: result.data.page_count || 1,
    };
  } catch (error: any) {
    console.error("getHevyWorkouts library error:", error.message);
    throw error;
  }
};

/**
 * Fetches all exercise templates from the external Hevy API (handles pagination).
 */
export const getHevyTemplates = async (
  apiKey: string,
): Promise<HevyExerciseTemplate[]> => {
  const url = `${EXTERNAL_BASE_URL}/exercise_templates`;
  let allExercises: HevyExerciseTemplate[] = [];
  let page = 1;
  let keepFetching = true;

  try {
    while (keepFetching) {
      const response = await fetch(`${url}?per_page=100&page=${page}`, {
        headers: {
          "api-key": apiKey,
          accept: "application/json",
        },
      });

      if (!response.ok) {
        // Hevy returns 404 when you exceed page range (sometimes)
        if (response.status === 404) {
          keepFetching = false;
          break;
        }
        const errorText = await response.text();
        throw new Error(
          `Hevy API Error [Templates]: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data = await response.json();

      // Validate Page Data
      const result = HevyTemplatesResponseSchema.safeParse(data);
      if (!result.success) {
        console.warn(`Hevy Validation Warning (Templates Page ${page}):`, result.error);
        throw new Error(`Hevy Template Data Invalid: ${result.error.message}`);
      }

      const exercises = result.data.exercise_templates;

      if (exercises && exercises.length > 0) {
        allExercises.push(...exercises);
        page++;
      } else {
        keepFetching = false;
      }
    }

    return allExercises;
  } catch (error: any) {
    console.error("getHevyTemplates library error:", error.message);
    throw error;
  }
};


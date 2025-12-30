import { HevyWorkout, HevyExerciseTemplate } from "@/types/hevy";

const EXTERNAL_BASE_URL = "https://api.hevyapp.com/v1";

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
  try {
    const response = await fetch(
      `${EXTERNAL_BASE_URL}/workouts?page=${page}&pageSize=${effectivePageSize}`,
      {
        headers: {
          "api-key": apiKey,
          accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hevy API Error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    return {
      workouts: data.workouts || [],
      page_count: data.page_count || 1,
    };
  } catch (error) {
    console.error("getHevyWorkouts library error:", error);
    throw error;
  }
};

/**
 * Fetches all exercise templates from the external Hevy API (handles pagination).
 */
export const getHevyTemplates = async (
  apiKey: string,
): Promise<HevyExerciseTemplate[]> => {
  try {
    const url = `${EXTERNAL_BASE_URL}/exercise_templates`;
    let allExercises: HevyExerciseTemplate[] = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      try {
        const response = await fetch(`${url}?per_page=100&page=${page}`, {
          headers: {
            "api-key": apiKey,
            accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          // Hevy returns 404 when you exceed page range
          if (response.status === 404) {
            keepFetching = false;
            break;
          }
          throw new Error(
            `Hevy API Error: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const data = await response.json();
        const exercises = data.exercise_templates;

        if (exercises && exercises.length > 0) {
          allExercises.push(...exercises);
          page++;
        } else {
          keepFetching = false;
        }
      } catch (error: any) {
        console.error(`Page ${page} fetch failed:`, error.message);
        keepFetching = false;
      }
    }

    return allExercises;
  } catch (error) {
    console.error("getHevyTemplates library error:", error);
    throw error;
  }
};

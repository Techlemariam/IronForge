
import api from './api';
import { HevyWorkout } from '../types/hevy';

/**
 * Fetches the user's routines from the Hevy API via the local proxy.
 */
export const getHevyRoutines = async (params: { page: number, pageSize: number } = { page: 1, pageSize: 10 }) => {
    try {
        const response = await api.get('/api/hevy/routines', { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch Hevy routines:", error);
        throw error;
    }
};

/**
 * Fetches the complete list of exercise templates (The Codex) from the backend proxy.
 * The proxy handles fetching all pages from the Hevy API.
 */
export const getHevyExerciseTemplates = async () => {
    try {
        // The backend endpoint is designed to fetch all templates, so no parameters are needed.
        const response = await api.get('/api/hevy/exercise-templates');

        // The backend returns a { exercise_templates: [...] } object.
        // We will reconstruct a response object that matches the previous structure for component compatibility.
        const allTemplates = response.data.exercise_templates || [];

        return {
            exercise_templates: allTemplates,
            page: 1,
            total_pages: 1, // Since we have all data, it's a single "page".
            total_records: allTemplates.length
        };

    } catch (error) {
        console.error("Failed to fetch Hevy Exercise Codex:", error);
        throw error;
    }
};

/**
 * Saves a workout to the Hevy API via the local proxy.
 * @param payload The workout data formatted for Hevy's API.
 */
export const saveWorkoutToHevy = async (payload: any) => {
    try {
        const response = await api.post('/api/hevy/workout', payload);
        return response.data;
    } catch (error) {
        console.error("Failed to save workout to Hevy:", error);
        // It's helpful to log the specific error from the API if available
        if (error.response) {
            console.error('Hevy Save Error:', error.response.data);
        }
        throw error;
    }
};

export interface HevyWorkoutResponse {
    page: number;
    page_count: number;
    workouts: HevyWorkout[];
}

/**
 * Fetches the user's workout history from the Hevy API.
 * It handles API pagination to retrieve the desired number of workouts.
 * @param desiredCount The total number of workouts to retrieve.
 */
export const getHevyWorkoutHistory = async (desiredCount: number = 30): Promise<{ workouts: HevyWorkout[] }> => {
    const pageSize = 10; // Max page size allowed by the Hevy API
    const numPagesToFetch = Math.ceil(desiredCount / pageSize);
    let allWorkouts: HevyWorkout[] = [];

    try {
        for (let page = 1; page <= numPagesToFetch; page++) {
            const response = await api.get(`/api/hevy/workouts?page=${page}&pageSize=${pageSize}`);
            
            if (response.status === 200 && response.data.workouts) {
                allWorkouts.push(...response.data.workouts);
                // If a page returns fewer items than the page size, it's the last page of results.
                if (response.data.workouts.length < pageSize) {
                    break;
                }
            } else {
                 // Log a warning instead of throwing an error to make the function more resilient.
                 console.warn(`Warning: Could not fetch page ${page} of Hevy workout history. Status: ${response.status}`);
            }
        }
        // Return a flat array of workouts, capped at the desired count.
        return { workouts: allWorkouts.slice(0, desiredCount) };

    } catch (error) {
        console.error("Hevy History Service Error:", error);
        // Re-throw the error to be handled by the calling component.
        throw error;
    }
};

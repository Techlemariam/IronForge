import axios from 'axios';
import { Exercise } from '../types/ironforge';

const API_BASE_URL = '/api';

// This is a PURE data transformation function. No API calls.
// It maps our internal Quest format to the format Hevy's API expects.
const transformToHevyPayload = (questTitle: string, exercises: Exercise[]) => {
    // We need to find the original Hevy ID for each exercise.
    // For now, we'll assume it's stored somewhere or use the name as a placeholder.
    // The architect mentioned: "Vi måste spara Hevy ID:t från början!"
    const hevyExercises = exercises.map(ex => ({
        // IMPORTANT: This needs the real exercise_template_id from Hevy
        // We will need to thread this through from the initial GET routines call.
        // Using ex.id for now, assuming it holds the hevyId.
        exercise_template_id: ex.id,
        sets: ex.sets.map((set, i) => ({
            type: "normal", // or "warmup", "drop", etc. in the future
            weight_kg: set.weight || 0,
            reps: set.completedReps || 0,
            // rpe: set.rpe, // Hevy API might support this later
            index: i
        }))
    }));

    return {
        workout: {
            title: questTitle,
            start_time: new Date(Date.now() - 3600 * 1000).toISOString(), // Placeholder: 1h ago
            end_time: new Date().toISOString(),
            exercises: hevyExercises
        }
    };
}


/**
 * Saves a completed quest to the Hevy Archive via our server.
 */
export const saveQuestToHevy = async (questTitle: string, exercises: Exercise[]): Promise<{ success: boolean; data?: any }> => {
    try {
        const payload = transformToHevyPayload(questTitle, exercises);

        console.log("Engraving Quest to Hevy Archive...", payload);

        const response = await axios.post(`${API_BASE_URL}/hevy/workout`, payload);
        
        console.log("Hevy Archive Response:", response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error("Failed to engrave quest:", error);
        // It's better to return a structured error
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, data: errorMessage };
    }
};

/**
 * Fetches the user's routines from the Hevy API via our proxy.
 */
export const getHevyRoutines = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/hevy/routines`, {
            params: {
                page: 1,
                pageSize: 10 // FIX: Corrected pageSize to be within API limits
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch Hevy routines:", error);
        throw error; // Re-throw to be caught by the UI component
    }
};

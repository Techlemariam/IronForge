
import api from './api';

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
 * Fetches the complete list of exercise templates (The Codex) from all pages.
 */
export const getHevyExerciseTemplates = async () => {
    try {
        // First, get the first page to determine pagination details
        const firstPageResponse = await api.get('/api/hevy/exercise-templates', { params: { page: 1, page_size: 100 } });
        const firstPageData = firstPageResponse.data;
        const totalPages = firstPageData.total_pages;
        
        let allTemplates = [...firstPageData.exercise_templates];

        // If there is more than one page, fetch the rest
        if (totalPages > 1) {
            const pagePromises = [];
            for (let i = 2; i <= totalPages; i++) {
                pagePromises.push(api.get('/api/hevy/exercise-templates', { params: { page: i, page_size: 100 } }));
            }
            
            const otherPageResponses = await Promise.all(pagePromises);
            
            for(const response of otherPageResponses) {
                allTemplates.push(...response.data.exercise_templates);
            }
        }

        // Return a single, consolidated object
        return {
            ...firstPageData,
            exercise_templates: allTemplates,
            page: 1,
            page_size: allTemplates.length,
            total_pages: 1,
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

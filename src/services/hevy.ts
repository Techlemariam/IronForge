
import axios from 'axios';

// --- Dynamic Configuration ---
// These values are now fetched from local storage, set via the ConfigModal.
const getApiKey = () => localStorage.getItem('hevy_api_key');
const getProxyUrl = () => {
    let url = localStorage.getItem('hevy_proxy_url');
    // Ensure the proxy URL doesn't end with a slash
    if (url && url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    return url;
}

// --- Axios Instance with Dynamic Headers ---
// An interceptor is used to dynamically insert the API key into every request.
const api = axios.create();

api.interceptors.request.use(config => {
    const proxyUrl = getProxyUrl();
    const apiKey = getApiKey();

    if (!proxyUrl || !apiKey) {
        return Promise.reject(new Error('API Key or Proxy URL is not configured.'));
    }

    // The full Hevy API URL is constructed by combining the proxy and the target path
    config.baseURL = `${proxyUrl}/https://api.hevyapp.com/v1/`;
    config.headers['x-api-key'] = apiKey;
    config.headers['Content-Type'] = 'application/json';
    
    // Remove the proxy part from the request URL if it's accidentally included
    if (config.url.startsWith(proxyUrl)) {
        config.url = config.url.substring(proxyUrl.length);
    }

    return config;
});

/**
 * Fetches the user's routines from the Hevy API.
 */
export const getHevyRoutines = async () => {
    try {
        // The request is now just the path, the base URL and headers are handled by the interceptor
        const response = await api.get('/routines', {
            params: { page: 1, pageSize: 20 } // Increased page size
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch Hevy routines:", error.message);
        throw error;
    }
};

/**
 * Fetches the complete list of exercise templates (The Codex).
 */
export const getHevyExerciseTemplates = async () => {
    try {
        const response = await api.get('/exercise_templates');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch Hevy Exercise Codex:", error.message);
        throw error;
    }
};

/**
 * Saves a workout to the Hevy API.
 * @param payload The workout data formatted for Hevy's API.
 */
export const saveWorkoutToHevy = async (payload: any) => {
    try {
        const response = await api.post('/workouts', payload);
        return response.data;
    } catch (error) {
        console.error("Failed to save workout to Hevy:", error.response?.data || error.message);
        throw error;
    }
};

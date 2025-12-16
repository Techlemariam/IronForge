
import axios from 'axios';

const api = axios.create();

// This interceptor runs before each request
api.interceptors.request.use(config => {
  // Get the latest api key from localStorage
  const apiKey = localStorage.getItem('hevy_api_key');

  if (apiKey) {
    // Add the key to a custom header to be used by the backend proxy
    config.headers['X-Hevy-API-Key'] = apiKey;
  } else {
    // It's better to cancel the request than to send a bad one
    console.error("Hevy API Key ('hevy_api_key') is not set in localStorage.");
    return Promise.reject(new Error("Hevy API Key is not configured. Please check your settings."));
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export interface IntervalActivity {
    id: number;
    type: string; // t.ex. 'Ride', 'Run'
    duration: number; // Sekunder
    tss: number;
    // zone_stats: en array av tid spenderad i olika HR-zoner.
    zone_stats?: { duration: number, percent: number }[];
    start_date_local: string;
}

export const getCardioHistory = async (): Promise<IntervalActivity[]> => {
    try {
        const response = await fetch(`http://localhost:3001/api/intervals/history`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch cardio history');
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error (Cardio History):", error);
        throw error;
    }
};

export default api;

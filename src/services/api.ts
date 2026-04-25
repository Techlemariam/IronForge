import axios from 'axios';
import { StorageService } from './storage';

const api = axios.create();

// This interceptor runs before each request
api.interceptors.request.use(
  async (config) => {
    // Get the latest api key from storage
    let apiKey: string | null = null;

    try {
      apiKey = await StorageService.getItem<string>('hevy_api_key');
      if (apiKey) {
        console.log('[API Interceptor] Retrieved Key: FOUND');
      }
    } catch (error) {
      console.error('[API Interceptor] Error retrieving Hevy API Key:', error);
    }

    if (apiKey) {
      // Add the key to a custom header to be used by the backend proxy
      config.headers['X-Hevy-API-Key'] = apiKey;
    } else {
      // Log warning if key is missing
      if (typeof window !== 'undefined') {
        console.warn("Hevy API Key ('hevy_api_key') is not set in StorageService.");
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface IntervalActivity {
  id: number;
  type: string; // t.ex. 'Ride', 'Run'
  duration: number; // Sekunder
  tss: number;
  // zone_stats: en array av tid spenderad i olika HR-zoner.
  zone_stats?: { duration: number; percent: number }[];
  start_date_local: string;
}

export const getCardioHistory = async (): Promise<IntervalActivity[]> => {
  try {
    const response = await fetch('/api/intervals/history');

    if (!response.ok) {
      throw new Error('Failed to fetch cardio history');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (Cardio History):', error);
    throw error;
  }
};

export default api;

import axios from "axios";

const api = axios.create();

// This interceptor runs before each request
api.interceptors.request.use(
  (config) => {
    // Get the latest api key from localStorage if in browser environment
    let apiKey: string | null = null;
    if (typeof window !== "undefined") {
      apiKey = localStorage.getItem("hevy_api_key");
      console.log(
        "[API Interceptor] Retrieved Key:",
        apiKey ? "FOUND" : "MISSING",
      );
    }

    if (apiKey) {
      // Add the key to a custom header to be used by the backend proxy
      config.headers["X-Hevy-API-Key"] = apiKey;
    } else {
      // If on client, warn. If on server, maybe we are calling a public endpoint or passing it differently.
      if (typeof window !== "undefined") {
        console.warn(
          "Hevy API Key ('hevy_api_key') is not set in localStorage.",
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
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
    const response = await fetch(`/api/intervals/history`);

    if (!response.ok) {
      throw new Error("Failed to fetch cardio history");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error (Cardio History):", error);
    throw error;
  }
};

export default api;

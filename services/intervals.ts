
import { IntervalsWellness, IntervalsActivity, IntervalsEvent } from '../types';

// Omdirigerad till Sentry Tower (Local Proxy)
// Detta eliminerar CORS-problem och döljer den verkliga API-nyckeln från nätverksfliken i webbläsaren.
const PROXY_URL = 'http://localhost:3001/api';

export const IntervalsService = {
  
  // Helper to handle proxy headers
  // We send the client key in a custom header. The proxy prefers the server-side env var if it exists.
  getProxyHeaders: (apiKey: string) => {
    return {
        'Content-Type': 'application/json',
        'x-client-key': apiKey // Proxy will use this if server-side env is empty
    };
  },

  // Helper to construct Basic Auth Header for direct calls (when not using Proxy for POSTs)
  getAuthHeader: (apiKey: string) => {
    return `Basic ${btoa('API_KEY:' + apiKey)}`;
  },

  /**
   * Fetches Wellness data via Proxy.
   */
  async getWellness(date: string, athleteId: string, apiKey: string): Promise<IntervalsWellness | null> {
    // Immediate Offline Check
    if (!navigator.onLine) {
        console.warn("Offline: Skipping Intervals API call.");
        return null;
    }

    try {
      // Call Proxy instead of direct URL
      const response = await fetch(`${PROXY_URL}/wellness?date=${date}&athleteId=${athleteId}`, {
        method: 'GET',
        headers: IntervalsService.getProxyHeaders(apiKey)
      });

      if (!response.ok) {
        throw new Error(`The Sentry Tower Reports: ${response.statusText}`);
      }

      const data = await response.json();
      return data as IntervalsWellness;

    } catch (error) {
      console.warn("Failed to fetch Intervals data via Proxy.", error);
      return null;
    }
  },

  /**
   * Fetches recent activities via Proxy.
   */
  async getRecentActivities(athleteId: string, apiKey: string): Promise<IntervalsActivity[]> {
    if (!navigator.onLine) return [];

    try {
      const response = await fetch(`${PROXY_URL}/activities?athleteId=${athleteId}`, {
        method: 'GET',
        headers: IntervalsService.getProxyHeaders(apiKey)
      });

      if (!response.ok) throw new Error("The Sentry Tower Reports: Failed to fetch activities");
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch Intervals activities via Proxy", error);
      return [];
    }
  },

  /**
   * Fetches Calendar Events via Proxy.
   */
  async getEvents(athleteId: string, apiKey: string, oldest: string, newest: string): Promise<IntervalsEvent[]> {
      if (!navigator.onLine) return [];

      try {
          const response = await fetch(`${PROXY_URL}/events?athleteId=${athleteId}&oldest=${oldest}&newest=${newest}`, {
              method: 'GET',
              headers: IntervalsService.getProxyHeaders(apiKey)
          });

          if (!response.ok) throw new Error("The Sentry Tower Reports: Failed to fetch events");
          const data = await response.json();
          
          // Filter logic remains on client to reduce server computation for MVP
          return data.filter((e: any) => e.category === 'RACE' || e.name.toLowerCase().includes('race') || e.name.toLowerCase().includes('lopp') || e.name.toLowerCase().includes('marathon'));
      } catch (error) {
          console.warn("Failed to fetch Intervals events via Proxy", error);
          return [];
      }
  },

  /**
   * Logic to convert Intervals Data to Titan RPG Stats
   * (Unchanged logic, safe to keep on client)
   */
  mapWellnessToTitanStats: (wellness: IntervalsWellness | null): IntervalsWellness | null => {
    if (!wellness) return null;

    const baselineHRV = 60; 
    let bodyBattery = 50; 
    
    if (wellness.hrv) {
        bodyBattery = Math.min(100, Math.round((wellness.hrv / baselineHRV) * 100));
    }

    let sleepScore = wellness.sleepScore || 0;
    
    if (!sleepScore && wellness.sleepSecs) {
        const hours = wellness.sleepSecs / 3600;
        sleepScore = Math.min(100, Math.round((hours / 8) * 100));
    }

    let vo2max = wellness.vo2max;
    if (!vo2max && wellness.restingHR) {
        vo2max = Math.round(15 * (190 / wellness.restingHR)); 
    }

    return {
      ...wellness, 
      bodyBattery,
      sleepScore,
      restingHR: wellness.restingHR,
      vo2max: vo2max || 55 
    };
  }
};

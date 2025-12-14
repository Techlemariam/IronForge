
import { IntervalsWellness, IntervalsActivity, IntervalsEvent } from '../types';

// In a real production app, these calls would go through a proxy to avoid CORS and hide the API Key.
// For this Client-Side RPG, we will attempt direct connection or fallback to simulation.

const BASE_URL = 'https://intervals.icu/api/v1';

export const IntervalsService = {
  
  getAuthHeader: (apiKey: string) => {
    return `Basic ${btoa('API_KEY:' + apiKey)}`;
  },

  /**
   * Fetches Wellness data (HRV, Sleep, RHR) for a specific date.
   */
  async getWellness(date: string, athleteId: string, apiKey: string): Promise<IntervalsWellness | null> {
    // Immediate Offline Check
    if (!navigator.onLine) {
        console.warn("Offline: Skipping Intervals API call.");
        return null;
    }

    if (!apiKey || !athleteId) return null;

    try {
      const response = await fetch(`${BASE_URL}/athlete/${athleteId}/wellness/${date}`, {
        method: 'GET',
        headers: {
          'Authorization': IntervalsService.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Intervals API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data as IntervalsWellness;

    } catch (error) {
      console.warn("Failed to fetch Intervals data (Likely CORS on localhost or Network Error).", error);
      return null;
    }
  },

  /**
   * Fetches recent activities to calculate Kinetic Shards.
   */
  async getRecentActivities(athleteId: string, apiKey: string): Promise<IntervalsActivity[]> {
    // Immediate Offline Check
    if (!navigator.onLine) {
        return [];
    }

    if (!apiKey || !athleteId) return [];

    try {
      const response = await fetch(`${BASE_URL}/athlete/${athleteId}/activities?limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': IntervalsService.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Failed to fetch activities");
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch Intervals activities", error);
      return [];
    }
  },

  /**
   * Fetches Calendar Events (Races, Goals) for a date range.
   */
  async getEvents(athleteId: string, apiKey: string, oldest: string, newest: string): Promise<IntervalsEvent[]> {
      if (!navigator.onLine || !apiKey || !athleteId) return [];

      try {
          const response = await fetch(`${BASE_URL}/athlete/${athleteId}/events?oldest=${oldest}&newest=${newest}`, {
              method: 'GET',
              headers: {
                  'Authorization': IntervalsService.getAuthHeader(apiKey),
                  'Content-Type': 'application/json'
              }
          });

          if (!response.ok) throw new Error("Failed to fetch events");
          const data = await response.json();
          // Filter for RACE category or explicit race names
          return data.filter((e: any) => e.category === 'RACE' || e.name.toLowerCase().includes('race') || e.name.toLowerCase().includes('lopp') || e.name.toLowerCase().includes('marathon'));
      } catch (error) {
          console.warn("Failed to fetch Intervals events", error);
          return [];
      }
  },

  /**
   * Logic to convert Intervals Data to Titan RPG Stats
   */
  mapWellnessToTitanStats: (wellness: IntervalsWellness | null): IntervalsWellness | null => {
    if (!wellness) {
      // Return null to indicate "No Data" -> Trigger Simulation
      return null;
    }

    // 1. Calculate Body Battery (Stamina)
    // HRV (rMSSD) is highly individual. We assume a baseline of 60ms for "100%".
    // In a full app, we would fetch the athlete's average HRV to normalize this.
    const baselineHRV = 60; 
    let bodyBattery = 50; // Default average
    
    if (wellness.hrv) {
        bodyBattery = Math.min(100, Math.round((wellness.hrv / baselineHRV) * 100));
    }

    // 2. Calculate Sleep Score (Rest)
    let sleepScore = wellness.sleepScore || 0;
    
    // If no score but we have duration, approximate: 8 hours = 100
    if (!sleepScore && wellness.sleepSecs) {
        const hours = wellness.sleepSecs / 3600;
        sleepScore = Math.min(100, Math.round((hours / 8) * 100));
    }

    // 3. Extract/Estimate VO2 Max
    // Intervals often puts VO2max in the 'ctl' object or custom fields, but we will mock extraction from main wellness
    // or estimate it from restingHR if missing for the demo.
    // VO2Max estimation (Uth-Sørensen-Overgaard-Pedersen estimation): 15 * (HRmax / HRrest)
    // Assume HRmax = 190 for elite athlete
    let vo2max = wellness.vo2max;
    if (!vo2max && wellness.restingHR) {
        vo2max = Math.round(15 * (190 / wellness.restingHR)); 
    }

    return {
      ...wellness, // Preserve ID and other original fields
      bodyBattery,
      sleepScore,
      restingHR: wellness.restingHR,
      vo2max: vo2max || 55 // Default fallback if no data
    };
  }
};

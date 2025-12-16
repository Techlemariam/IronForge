
import { IntervalsWellness, IntervalsActivity, IntervalsEvent, Session, BlockType, ExerciseLogic } from '../types';

// Omdirigerad till Sentry Tower (Local Proxy) via Vite Config
// Använder relativ path för att fungera både i dev (via proxy) och prod (samma origin)
const PROXY_URL = '/api';

// --- MOCK DATA FOR SIMULATION MODE ---
const MOCK_WELLNESS: IntervalsWellness = {
    id: 'sim_titan_01',
    bodyBattery: 85,
    sleepScore: 92,
    hrv: 65,
    restingHR: 48,
    vo2max: 58,
    ctl: 45,
    atl: 30,
    tsb: 15, // Fresh
    sleepSecs: 28800
};

const MOCK_ACTIVITIES: IntervalsActivity[] = [
    { id: 'act_1', moving_time: 3600, icu_intensity: 65 }, // Z2 Base
    { id: 'act_2', moving_time: 1800, icu_intensity: 90 }, // Z4 Threshold
    { id: 'act_3', moving_time: 2400, icu_intensity: 70 }, // Z2/Z3
];

const MOCK_EVENTS: IntervalsEvent[] = [
    { 
        id: 101, 
        start_date_local: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
        name: 'Grand Prix: Azeroth', 
        category: 'RACE',
        type: 'Ride'
    }
];

export const IntervalsService = {
  
  // Helper to handle proxy headers
  getProxyHeaders: (apiKey: string) => {
    return {
        'Content-Type': 'application/json',
        'x-client-key': apiKey 
    };
  },

  getAuthHeader: (apiKey: string) => {
    return `Basic ${btoa('API_KEY:' + apiKey)}`;
  },

  /**
   * Fetches Wellness data via Proxy.
   * FALLBACK: Returns Titan Simulation Data on failure.
   */
  async getWellness(date: string, athleteId: string, apiKey: string): Promise<IntervalsWellness | null> {
    if (!navigator.onLine) return MOCK_WELLNESS;

    try {
      const response = await fetch(`${PROXY_URL}/wellness?date=${date}&athleteId=${athleteId}`, {
        method: 'GET',
        headers: IntervalsService.getProxyHeaders(apiKey)
      });

      if (!response.ok) throw new Error("Proxy Error");
      const data = await response.json();
      return data as IntervalsWellness;

    } catch (error) {
      console.warn("Intervals Link Offline. Engaging Simulation Mode.", error);
      return MOCK_WELLNESS;
    }
  },

  /**
   * Fetches recent activities via Proxy.
   * FALLBACK: Returns Mock Activities.
   */
  async getRecentActivities(athleteId: string, apiKey: string): Promise<IntervalsActivity[]> {
    if (!navigator.onLine) return MOCK_ACTIVITIES;

    try {
      const response = await fetch(`${PROXY_URL}/activities?athleteId=${athleteId}`, {
        method: 'GET',
        headers: IntervalsService.getProxyHeaders(apiKey)
      });

      if (!response.ok) throw new Error("Proxy Error");
      return await response.json();
    } catch (error) {
      return MOCK_ACTIVITIES;
    }
  },

  /**
   * Fetches Calendar Events via Proxy.
   * FALLBACK: Returns Mock Events.
   */
  async getEvents(athleteId: string, apiKey: string, oldest: string, newest: string): Promise<IntervalsEvent[]> {
      if (!navigator.onLine) return MOCK_EVENTS;

      try {
          const response = await fetch(`${PROXY_URL}/events?athleteId=${athleteId}&oldest=${oldest}&newest=${newest}`, {
              method: 'GET',
              headers: IntervalsService.getProxyHeaders(apiKey)
          });

          if (!response.ok) throw new Error("Proxy Error");
          const data = await response.json();
          return data.filter((e: any) => e.category === 'RACE' || e.name.toLowerCase().includes('race') || e.name.toLowerCase().includes('lopp') || e.name.toLowerCase().includes('marathon'));
      } catch (error) {
          return MOCK_EVENTS;
      }
  },

  /**
   * Fetches today's planned workout.
   */
  async getPlannedWorkout(date: string, athleteId: string, apiKey: string): Promise<Session | null> {
    if (!navigator.onLine) return null;

    try {
        const response = await fetch(`${PROXY_URL}/planned-workout?date=${date}&athleteId=${athleteId}`, {
            method: 'GET',
            headers: IntervalsService.getProxyHeaders(apiKey)
        });

        if (!response.ok) return null;
        
        const event = await response.json();
        
        return {
            id: `intervals_${event.id}`,
            name: event.name,
            zoneName: `Daily Quest: ${event.type || 'Training'}`,
            difficulty: 'Normal', 
            isGenerated: true,
            blocks: [
                {
                    id: `blk_${event.id}`,
                    name: 'Planned Protocol',
                    type: BlockType.STATION,
                    exercises: [
                        {
                            id: `ex_${event.id}`,
                            name: event.name,
                            logic: ExerciseLogic.FIXED_REPS,
                            instructions: event.description ? event.description.split('\n') : ['Execute planned workout from device.'],
                            sets: [
                                { id: 's1', reps: '1 Session', completed: false, rarity: 'epic' }
                            ]
                        }
                    ]
                }
            ]
        };

    } catch (error) {
        return null;
    }
  },

  /**
   * Logic to convert Intervals Data to Titan RPG Stats
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
      bodyBattery: wellness.bodyBattery || bodyBattery,
      sleepScore: wellness.sleepScore || sleepScore,
      restingHR: wellness.restingHR,
      vo2max: vo2max || 55 
    };
  }
};

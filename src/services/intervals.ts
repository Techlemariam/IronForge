import { IntervalsWellness, IntervalsActivity, IntervalsEvent } from '../types';

export class IntervalsClient {

  // No longer need keys here, as they are on the server

  async getWellness(date: string): Promise<IntervalsWellness> {
    try {
      const response = await fetch(`/api/intervals/wellness?date=${date}`);

      if (!response.ok) {
        console.error(`Failed to fetch wellness data: ${response.statusText}`);
        return {} as IntervalsWellness;
      }

      const data = await response.json();

      // Handle empty object (404 from backend)
      if (!data || Object.keys(data).length === 0) return {} as IntervalsWellness;

      // Map API response to our type. Note: backend proxies the raw data.
      return {
        id: data.id,
        hrv: data.hrv,
        restingHR: data.restingHR,
        sleepScore: data.sleepScore,
        sleepSecs: data.sleepSecs,
        bodyBattery: data.readiness,
        vo2max: data.vo2max,
        ctl: data.ctl,
        atl: data.atl,
        tsb: data.tsb,
        ramp_rate: data.rampRate
      };
    } catch (e) {
      console.error("Error fetching wellness", e);
      return {} as IntervalsWellness;
    }
  }

  async getActivities(startDate: string, endDate: string): Promise<IntervalsActivity[]> {
    try {
      const response = await fetch(`/api/intervals/history?oldest=${startDate}&newest=${endDate}`);

      if (!response.ok) {
        console.error(`Failed to fetch activities: ${response.statusText}`);
        return [];
      }

      return response.json();
    } catch (e) {
      console.error("Error fetching activities", e);
      return [];
    }
  }

  async getEvents(startDate: string, endDate: string): Promise<IntervalsEvent[]> {
    try {
      const response = await fetch(`/api/intervals/events?oldest=${startDate}&newest=${endDate}`);

      if (!response.ok) {
        console.error(`Failed to fetch events: ${response.statusText}`);
        return [];
      }
      return response.json();
    } catch (e) {
      console.error("Error fetching events", e);
      return [];
    }
  }
}

export const intervalsClient = new IntervalsClient();

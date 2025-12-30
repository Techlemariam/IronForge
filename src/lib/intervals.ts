const BASE_URL = "https://intervals.icu/api/v1";

async function fetchIntervals(endpoint: string, apiKey: string) {
  if (!apiKey) {
    console.error("Intervals API Key missing");
    return null;
  }

  // Intervals.icu uses Basic Auth with "API_KEY" as username and the actual key as password
  const authHeader = `Basic ${btoa("API_KEY:" + apiKey)}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(
      `Intervals API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export interface WellnessData {
  id: string;
  date: string;
  hrv?: number;
  restingHR?: number;
  readiness?: number; // Body Battery
  sleepScore?: number;
  sleepSecs?: number;
  ctl?: number;
  atl?: number;
  tsb?: number;
  rampRate?: number;
  vo2max?: number;
}

export interface AthleteSettings {
  id: string;
  name: string;
  timezone: string;
  resting_hr?: number;
  max_hr?: number;
  lthr?: number;
  ftp?: number; // Cycling FTP
  run_ftp?: number; // Running FTP/Threshold
  heart_rate_zones?: any[];
  power_zones?: any[];
}

export async function getWellness(
  date: string,
  apiKey: string,
  athleteId: string,
): Promise<WellnessData | null> {
  try {
    return await fetchIntervals(
      `/athlete/${athleteId}/wellness/${date}`,
      apiKey,
    );
  } catch (error: any) {
    console.error("Failed to fetch wellness:", error.message);
    return null;
  }
}

export async function getAthleteSettings(
  apiKey: string,
  athleteId: string,
): Promise<AthleteSettings | null> {
  try {
    return await fetchIntervals(`/athlete/${athleteId}`, apiKey);
  } catch (error: any) {
    console.error("Failed to fetch athlete settings:", error.message);
    return null;
  }
}

export async function getActivities(
  startDate: string,
  endDate: string,
  apiKey: string,
  athleteId: string,
) {
  try {
    const data = await fetchIntervals(
      `/athlete/${athleteId}/activities?oldest=${startDate}&newest=${endDate}`,
      apiKey,
    );
    return data || [];
  } catch (error: any) {
    console.error("Failed to fetch activities:", error.message);
    return [];
  }
}

export async function getEvents(
  startDate: string,
  endDate: string,
  apiKey: string,
  athleteId: string,
) {
  try {
    const data = await fetchIntervals(
      `/athlete/${athleteId}/events?oldest=${startDate}&newest=${endDate}`,
      apiKey,
    );
    return data || [];
  } catch (error: any) {
    console.error("Failed to fetch events:", error.message);
    return [];
  }
}

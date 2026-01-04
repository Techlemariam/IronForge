import { z } from "zod";

const BASE_URL = "https://intervals.icu/api/v1";

// --- ZOD SCHEMAS ---

const WellnessDataSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  hrv: z.number().optional().nullable(),
  restingHR: z.number().optional().nullable(),
  readiness: z.number().optional().nullable(), // Body Battery
  sleepScore: z.number().optional().nullable(),
  sleepSecs: z.number().optional().nullable(), // Note: API might return sleep_secs
  ctl: z.number().optional().nullable(),
  atl: z.number().optional().nullable(),
  tsb: z.number().optional().nullable(),
  rampRate: z.number().optional().nullable(),
  vo2max: z.number().optional().nullable(),
  // Allow snake_case input keys to survive stripping
  resting_hr: z.number().optional().nullable(),
  sleep_score: z.number().optional().nullable(),
  sleep_secs: z.number().optional().nullable(),
  ramp_rate: z.number().optional().nullable(),
}).transform((data: any) => ({
  // Handle snake_case to camelCase mapping if API usage varies
  id: data.id,
  date: data.date,
  hrv: data.hrv,
  restingHR: data.restingHR || data.resting_hr,
  readiness: data.readiness,
  sleepScore: data.sleepScore || data.sleep_score,
  sleepSecs: data.sleepSecs || data.sleep_secs,
  ctl: data.ctl,
  atl: data.atl,
  tsb: data.tsb,
  rampRate: data.rampRate || data.ramp_rate,
  vo2max: data.vo2max,
}));

export type WellnessData = z.infer<typeof WellnessDataSchema>;

const AthleteSettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  resting_hr: z.number().optional().nullable(),
  max_hr: z.number().optional().nullable(),
  lthr: z.number().optional().nullable(),
  ftp: z.number().optional().nullable(),
  run_ftp: z.number().optional().nullable(),
  heart_rate_zones: z.array(z.any()).optional().nullable(),
  power_zones: z.array(z.any()).optional().nullable(),
});

export type AthleteSettings = z.infer<typeof AthleteSettingsSchema>;

// --- API CLIENT ---

/**
 * Standard fetch wrapper for Intervals.icu
 * Throws standard Error objects on failure.
 * Returns null ONLY on 404 (Not Found).
 */
async function fetchIntervals<T>(
  endpoint: string,
  apiKey: string,
  schema?: z.ZodType<any>
): Promise<T | null> {
  if (!apiKey) {
    throw new Error("Intervals API Key is missing");
  }

  const authHeader = `Basic ${btoa("API_KEY:" + apiKey)}`;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(
        `Intervals API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (schema) {
      // Validate array responses if schema is array
      if (Array.isArray(data) && schema instanceof z.ZodArray) {
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
          console.warn("Intervals Parsing Warning (Array):", parsed.error);
          // We might choose to return partial data or throw. For now, throw to detect drifts.
          throw new Error(`Intervals Data Validation Failed: ${parsed.error.message}`);
        }
        return parsed.data as T;
      }

      // Single object validation
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        console.warn("Intervals Parsing Warning:", parsed.error);
        throw new Error(`Intervals Data Validation Failed: ${parsed.error.message}`);
      }
      return parsed.data;
    }

    return data as T;
  } catch (error: any) {
    // Enhance error message with endpoint context
    throw new Error(`FetchIntervals Failed [${endpoint}]: ${error.message}`);
  }
}

// --- EXPORTED METHODS ---

export async function getWellness(
  date: string,
  apiKey: string,
  athleteId: string,
  endDate?: string,
): Promise<WellnessData | WellnessData[] | null> {
  if (endDate) {
    // Range Query - returns array
    return await fetchIntervals<WellnessData[]>(
      `/athlete/${athleteId}/wellness?oldest=${date}&newest=${endDate}`,
      apiKey,
      z.array(WellnessDataSchema)
    );
  }
  // Single Day
  return await fetchIntervals<WellnessData>(
    `/athlete/${athleteId}/wellness/${date}`,
    apiKey,
    WellnessDataSchema
  );
}

export async function getAthleteSettings(
  apiKey: string,
  athleteId: string,
): Promise<AthleteSettings | null> {
  return await fetchIntervals(
    `/athlete/${athleteId}`,
    apiKey,
    AthleteSettingsSchema
  );
}

const IntervalsActivitySchema = z.object({
  id: z.string().optional(),
  icu_intensity: z.number().optional().nullable(),
  icu_training_load: z.number().optional().nullable(),
  type: z.string().optional(),
  start_date_local: z.string(),
  moving_time: z.number(),
  distance: z.number().optional(), // Often useful
  zone_times: z.array(z.number()).optional(),
  average_heartrate: z.number().optional().nullable(),
  average_watts: z.number().optional().nullable(),
});

export type IntervalsActivity = z.infer<typeof IntervalsActivitySchema>;

const IntervalsEventSchema = z.object({
  id: z.number(), // API returns number for events
  start_date_local: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  category: z.enum(["RACE", "WORKOUT", "NOTE"]).or(z.string()), // Flexible enum
  type: z.string().optional().nullable(),
});

export type IntervalsEvent = z.infer<typeof IntervalsEventSchema>;

export async function getActivities(
  startDate: string,
  endDate: string,
  apiKey: string,
  athleteId: string,
): Promise<IntervalsActivity[]> {
  return (await fetchIntervals(
    `/athlete/${athleteId}/activities?oldest=${startDate}&newest=${endDate}`,
    apiKey,
    z.array(IntervalsActivitySchema)
  )) || [];
}

export async function getEvents(
  startDate: string,
  endDate: string,
  apiKey: string,
  athleteId: string,
): Promise<IntervalsEvent[]> {
  return (await fetchIntervals(
    `/athlete/${athleteId}/events?oldest=${startDate}&newest=${endDate}`,
    apiKey,
    z.array(IntervalsEventSchema)
  )) || [];
}

/**
 * Fetch GPS stream for an activity
 */
export async function getActivityStream(
  activityId: string,
  apiKey: string
): Promise<Array<{ lat: number; lng: number }> | null> {
  // We don't use strict schema here yet due to complex stream structure
  const data = await fetchIntervals<any[]>(
    `/activity/${activityId}/streams?types=latlng`,
    apiKey
  );

  if (!data) return null;

  const latlngStream = data.find((s: any) => s.type === "latlng");
  if (!latlngStream || !latlngStream.data) return null;

  return latlngStream.data.map((point: [number, number]) => ({
    lat: point[0],
    lng: point[1],
  }));
}


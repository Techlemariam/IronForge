"use server";

import {
  getWellness,
  getActivities,
  getEvents,
  getAthleteSettings,
} from "@/lib/intervals";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { IntervalsWellness, IntervalsActivity, IntervalsEvent } from "@/types";

async function getIntervalsCredentials() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { intervalsApiKey: true, intervalsAthleteId: true },
  });

  if (!dbUser?.intervalsApiKey || !dbUser?.intervalsAthleteId) {
    throw new Error("Intervals.icu not connected");
  }

  return {
    apiKey: dbUser.intervalsApiKey,
    athleteId: dbUser.intervalsAthleteId,
  };
}

export async function getWellnessAction(
  date: string,
): Promise<IntervalsWellness> {
  try {
    const { apiKey, athleteId } = await getIntervalsCredentials();
    const data = await getWellness(date, apiKey, athleteId);

    if (!data || Array.isArray(data)) return {} as IntervalsWellness;

    // Map Lib type (WellnessData) to App type (IntervalsWellness)
    // lib/intervals.ts uses 'readiness' for bodyBattery, type uses 'bodyBattery'
    return {
      id: data?.id,
      hrv: data?.hrv,
      restingHR: data?.restingHR,
      sleepScore: data?.sleepScore,
      sleepSecs: data?.sleepSecs,
      bodyBattery: data?.readiness,
      vo2max: data?.vo2max,
      ctl: data?.ctl,
      atl: data?.atl,
      tsb: data?.tsb,
      ramp_rate: data?.rampRate,
    } as IntervalsWellness;
  } catch (error: any) {
    console.warn("Server Action Intervals Wellness Error:", error.message);
    return {} as IntervalsWellness;
  }
}

export async function getWellnessRangeAction(
  startDate: string,
  endDate: string,
): Promise<IntervalsWellness[]> {
  try {
    const { apiKey, athleteId } = await getIntervalsCredentials();
    const data = await getWellness(startDate, apiKey, athleteId, endDate);

    if (!Array.isArray(data)) return [];

    return data.map(d => ({
      id: d.id,
      hrv: d.hrv,
      restingHR: d.restingHR,
      sleepScore: d.sleepScore,
      sleepSecs: d.sleepSecs,
      bodyBattery: d.readiness,
      vo2max: d.vo2max,
      ctl: d.ctl,
      atl: d.atl,
      tsb: d.tsb,
      ramp_rate: d.rampRate,
    } as IntervalsWellness));
  } catch (error: any) {
    console.error("Server Action Intervals Wellness Range Error:", error.message);
    return [];
  }
}

export async function getActivitiesAction(
  startDate: string,
  endDate: string,
): Promise<IntervalsActivity[]> {
  try {
    const { apiKey, athleteId } = await getIntervalsCredentials();
    const data = await getActivities(startDate, endDate, apiKey, athleteId);
    return data as unknown as IntervalsActivity[];
  } catch (error: any) {
    console.error("Server Action Intervals Activities Error:", error.message);
    return [];
  }
}

export async function getEventsAction(
  startDate: string,
  endDate: string,
): Promise<IntervalsEvent[]> {
  try {
    const { apiKey, athleteId } = await getIntervalsCredentials();
    const data = await getEvents(startDate, endDate, apiKey, athleteId);
    return data as unknown as IntervalsEvent[];
  } catch {
    return [];
  }
}

export async function getAthleteSettingsAction() {
  try {
    const { apiKey, athleteId } = await getIntervalsCredentials();
    const data = await getAthleteSettings(apiKey, athleteId);
    return data;
  } catch (error: any) {
    console.error("Server Action Intervals Settings Error:", error.message);
    return null;
  }
}

"use server";

import { getAthleteSettings, getWellness } from "@/lib/intervals";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncBiometrics(userId: string) {
  try {
    // Get credentials from environment
    const apiKey = process.env.INTERVALS_API_KEY;
    const athleteId = process.env.INTERVALS_ATHLETE_ID;

    if (!apiKey || !athleteId) {
      throw new Error("Missing Intervals.icu credentials in environment");
    }

    // 1. Fetch data from Intervals
    const [settings, wellness] = await Promise.all([
      getAthleteSettings(apiKey, athleteId),
      getWellness(new Date().toISOString().split("T")[0], apiKey, athleteId),
    ]);

    if (!settings) throw new Error("Could not fetch Athlete Settings");

    // 2. Prepare update payload
    const dataToUpdate: any = {
      ftpCycle: settings.ftp,
      ftpRun: settings.run_ftp,
      lthr: settings.lthr,
      // If Intervals provides zones in settings, we can save them.
      // Simplified mapping for now based on what we see in real payloads
      hrZones: settings.heart_rate_zones
        ? JSON.parse(JSON.stringify(settings.heart_rate_zones))
        : undefined,
    };

    if (wellness && !Array.isArray(wellness)) {
      dataToUpdate.hrv = wellness.hrv;
      dataToUpdate.restingHr = wellness.restingHR;
    }

    // 3. Update User
    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    revalidatePath("/dashboard");
    return { success: true, synced: dataToUpdate };
  } catch (error: any) {
    console.error("Biometric Sync Failed:", error.message);
    return { success: false, error: error.message };
  }
}

"use server";

/**
 * Strava Integration Server Actions
 *
 * Handles the OAuth2 flow, token management (exchange & refresh),
 * and data synchronization between Strava and IronForge.
 *
 * @module actions/strava
 */
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import axios from "axios";
import { revalidatePath } from "next/cache";
import {
  StravaTokenResponse,
  StravaActivity,
  mapStravaActivityToCardioLog,
} from "@/lib/strava";
import { processUserCardioActivity } from "@/actions/pvp/duel";

// Constants removed for lazy evaluation
// const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
// const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

/**
 * Generates the Strava OAuth2 authorization URL.
 *
 * dynamically determines the redirect URI based on the host header,
 * enabling support for both local development and production environments.
 *
 * @returns {Promise<string>} The full authorization URL.
 * @throws {Error} If STRAVA_CLIENT_ID is missing from environment variables.
 */
export async function getStravaAuthUrlAction() {
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  if (!STRAVA_CLIENT_ID) throw new Error("Missing STRAVA_CLIENT_ID");

  const scope = "read,activity:read_all,activity:write";
  // Dynamically determining host might be unreliable in server actions without headers(),
  // but we can try.
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/settings`;

  const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
  return url;
}

/**
 * Exchanges a Strava authorization code for an access token.
 *
 * Persists the access token, refresh token, and expiration time to the user's profile.
 *
 * @param {string} code - The authorization code returned from Strava.
 * @returns {Promise<{success: boolean, error?: string}>} Success status or error message.
 */
export async function exchangeStravaTokenAction(code: string) {
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    return {
      success: false,
      error: "Strava credentials not configured on server",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const response = await axios.post<StravaTokenResponse>(
      "https://www.strava.com/oauth/token",
      {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      },
    );

    const { access_token, refresh_token, expires_at, athlete } = response.data;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stravaAccessToken: access_token,
        stravaRefreshToken: refresh_token,
        stravaExpiresAt: expires_at,
        stravaAthleteId: athlete.id.toString(),
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Strava Token Exchange Error:", error.response?.data || error.message);
    } else {
      console.error("Strava Token Exchange Error:", error);
    }
    return { success: false, error: "Failed to exchange token with Strava" };
  }
}

export async function disconnectStravaAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (dbUser?.stravaAccessToken) {
      // Optional: Revoke token
      try {
        await axios.post("https://www.strava.com/oauth/deauthorize", {
          access_token: dbUser.stravaAccessToken,
        });
      } catch (e) {
        // Ignore deauth failure
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stravaAccessToken: null,
        stravaRefreshToken: null,
        stravaExpiresAt: null,
        stravaAthleteId: null,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function getValidAccessToken(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.stravaAccessToken) return null;

  const now = Math.floor(Date.now() / 1000);

  // If expired or expiring soon (within 5 mins), refresh
  if (user.stravaExpiresAt && user.stravaExpiresAt < now + 300) {
    if (!user.stravaRefreshToken) return null;

    try {
      const response = await axios.post<StravaTokenResponse>(
        "https://www.strava.com/oauth/token",
        {
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: user.stravaRefreshToken,
        },
      );

      const { access_token, refresh_token, expires_at } = response.data;

      await prisma.user.update({
        where: { id: userId },
        data: {
          stravaAccessToken: access_token,
          stravaRefreshToken: refresh_token,
          stravaExpiresAt: expires_at,
        },
      });

      return access_token;
    } catch (error) {
      console.error("RefreshToken Error:", error);
      return null;
    }
  }

  return user.stravaAccessToken;
}

/**
 * Syncs recent activities from Strava to IronForge.
 *
 * Fetches the last 30 activities. Checks for duplicates using `intervalsId` (prefixed with 'strava_').
 * Creates new `CardioLog` entries for new activities and awards rewards (XP, Gold, Kinetic Energy).
 *
 * @returns {Promise<{success: boolean, count?: number, error?: string}>} Sync result and count of new activities.
 */
export async function syncStravaActivitiesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const token = await getValidAccessToken(user.id);
  if (!token)
    return { success: false, error: "Strava not connected or token invalid" };

  try {
    // Fetch last 30 activities
    const response = await axios.get<StravaActivity[]>(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 30 },
      },
    );

    const activities = response.data;
    let syncedCount = 0;

    for (const activity of activities) {
      // Check if exists
      const existing = await prisma.cardioLog.findUnique({
        where: { intervalsId: `strava_${activity.id}` }, // Reusing this field for external ID
      });

      if (!existing) {
        const logData = mapStravaActivityToCardioLog(activity, user.id);

        // Create Log
        await prisma.cardioLog.create({
          data: logData,
        });

        // Trigger Duel Updates
        // distance is in meters in logData? mapStravaActivityToCardioLog likely returns it.
        // Assuming logData structure matches CardioLog which doesn't have distance? 
        // Wait, CardioLog schema doesn't have distance column (only type, duration, load).
        // Let me check schema again. CardioLog has duration. Duel needs distance.
        // I need to fetch distance from activity.
        const distanceKm = activity.distance / 1000;
        const durationMin = activity.moving_time / 60;
        await processUserCardioActivity(user.id, activity.type, distanceKm, durationMin);

        // Award Rewards (Simple: 1 XP per minute, 1 Gold per minute)
        // This logic should ideally be centralized in a 'RewardService'
        const minutes = Math.floor(logData.duration / 60);
        if (minutes > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              totalExperience: { increment: minutes },
              gold: { increment: minutes },
              kineticEnergy: { increment: Math.floor(minutes / 2) },
            },
          });
        }

        syncedCount++;
      }
    }

    revalidatePath("/");
    return { success: true, count: syncedCount };
  } catch (error: unknown) {
    console.error("Sync Error:", error);
    const message = error instanceof Error ? error.message : "Sync failed";
    return { success: false, error: message };
  }
}

export async function uploadToStravaAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const token = await getValidAccessToken(user.id);
  if (!token)
    return { success: false, error: "Strava not connected or token invalid" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    // Convert File to Blob/Buffer for Axios
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadData = new FormData();
    // Append raw data. Note: In Node environment with axios + form-data,
    // passing a buffer often requires a filename.
    // But since we are using native FormData in Next.js Server Actions (Node 18+),
    // we might need to handle the axios post carefully.
    // Actually, let's use standard fetch for the upload to handle FormData natively if possible,
    // or construct properly for axios.

    // Simpler approach with Axios:
    const form = new FormData();
    form.append("file", new Blob([buffer]), file.name);
    form.append("data_type", file.name.endsWith(".fit") ? "fit" : "gpx");

    // NOTE: Node's FormData (undici) might behave differently with axios.
    // Let's use the native fetch which Next.js polyfills/supports well.

    const stravaFormData = new FormData();
    stravaFormData.append("file", new Blob([buffer]), file.name);
    stravaFormData.append(
      "data_type",
      file.name.endsWith(".fit") ? "fit" : "gpx",
    );

    const response = await fetch("https://www.strava.com/api/v3/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: stravaFormData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Upload failed");
    }

    const result = await response.json();
    return { success: true, uploadId: result.id, status: result.status };
  } catch (error: any) {
    console.error("Upload Error:", error);
    return { success: false, error: error.message };
  }
}

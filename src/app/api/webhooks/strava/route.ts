import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processUserCardioActivity } from "@/actions/duel";
import { mapStravaActivityToCardioLog } from "@/lib/strava";
import axios from "axios";

// Constants
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN || "IRONFORGE_STRAVA_VERIFY";
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

/**
 * Handle Strava Webhook Verification (GET)
 * Strava sends a challenge to verify ownership of the callback URL.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === STRAVA_VERIFY_TOKEN) {
        console.log("Strava Webhook Verified");
        return NextResponse.json({ "hub.challenge": challenge });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Handle Strava Webhook Events (POST)
 * Updates: activity created, updated, or deleted.
 */
export async function POST(req: NextRequest) {
    try {
        const event = await req.json();
        console.log("Strava Webhook Event:", event);

        // event structure: { object_type: 'activity', object_id: 123, aspect_type: 'create', owner_id: 12345, updates: {} }

        if (event.object_type === "activity" && event.aspect_type === "create") {
            const stravaAthleteId = event.owner_id.toString();
            const activityId = event.object_id;

            // 1. Find User by Strava Athlete ID
            const user = await prisma.user.findFirst({
                where: { stravaAthleteId },
            });

            if (user) {
                // 2. Fetch full activity details from Strava
                // We need a valid token. If user has one, assume it's valid or refresh it.
                // Importing logic from actions/strava might be tricky if it uses headers().
                // Let's rely on stored token logic directly here or call an internal service (better).
                // For MVC simplicity in this route, we'll do:

                let token = user.stravaAccessToken;
                const now = Math.floor(Date.now() / 1000);

                // Refresh if needed
                if (user.stravaExpiresAt && user.stravaExpiresAt < now + 300 && user.stravaRefreshToken) {
                    try {
                        const refreshRes = await axios.post("https://www.strava.com/oauth/token", {
                            client_id: STRAVA_CLIENT_ID,
                            client_secret: STRAVA_CLIENT_SECRET,
                            grant_type: "refresh_token",
                            refresh_token: user.stravaRefreshToken,
                        });
                        token = refreshRes.data.access_token;
                        // Update DB
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                stravaAccessToken: token,
                                stravaRefreshToken: refreshRes.data.refresh_token,
                                stravaExpiresAt: refreshRes.data.expires_at
                            }
                        });
                    } catch (e) {
                        console.error("Failed to refresh token in webhook", e);
                        return NextResponse.json({ status: "ok" }); // Ack anyway
                    }
                }

                if (token) {
                    const activityRes = await axios.get(`https://www.strava.com/api/v3/activities/${activityId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const activity = activityRes.data;

                    // 3. Log Activity
                    const logData = mapStravaActivityToCardioLog(activity, user.id);
                    await prisma.cardioLog.upsert({
                        where: { intervalsId: `strava_${activityId}` },
                        create: logData,
                        update: logData
                    });

                    // 4. Update Duels
                    const distanceKm = activity.distance / 1000;
                    const durationMin = activity.moving_time / 60;
                    await processUserCardioActivity(user.id, activity.type, distanceKm, durationMin);

                    // 5. Award Rewards (Duplicated logic from sync action - should be centralized service)
                    // Just doing minimal here.
                    const minutes = Math.floor(durationMin);
                    if (minutes > 0) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                totalExperience: { increment: minutes },
                                gold: { increment: minutes },
                            },
                        });
                    }
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Handler Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { prisma } from "@/lib/prisma";
import { getWellnessAction } from "@/actions/intervals";

export interface GarminWellnessData {
    bodyBattery: number;
    stressLevel: number;
    sleepScore: number;
    restingHeartRate: number;
    lastSyncAt: Date;
    source: "DIRECT" | "AGGREGATOR";
}

export class GarminService {
    /**
     * Fetch the most recent wellness metrics for a titan.
     * Uses direct Garmin connection if available, falls back to Intervals.icu aggregator.
     */
    static async getTitanWellness(userId: string): Promise<GarminWellnessData | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                garminConnected: true,
                garminAccessToken: true,
                intervalsApiKey: true,
                intervalsAthleteId: true,
            }
        });

        if (!user) return null;

        // 1. Check Direct Garmin Connection (MVP placeholder for OAuth success)
        if (user.garminConnected && user.garminAccessToken) {
            // TODO: Implement direct Garmin Health API call here
            // For MVP, we might still fallback while the API approval is pending
        }

        // 2. Fallback to Aggregator (Intervals.icu)
        if (user.intervalsApiKey && user.intervalsAthleteId) {
            const today = new Date().toISOString().split("T")[0];
            const wellness = await getWellnessAction(today);

            if (Object.keys(wellness).length > 0) {
                return {
                    bodyBattery: wellness.bodyBattery || 0,
                    stressLevel: 0, // Intervals doesn't always have stress level mapped or available
                    sleepScore: wellness.sleepScore || 0,
                    restingHeartRate: wellness.restingHR || 0,
                    lastSyncAt: new Date(),
                    source: "AGGREGATOR"
                };
            }
        }

        return null;
    }

    /**
     * Start the OAuth flow process
     * (Called from Settings UI)
     */
    static async initiateOAuthFlow() {
        // Redirect to Garmin OAuth portal (Conceptual for MVP)
        // URL would be: https://connect.garmin.com/oauthConfirm?oauth_token=...
        const clientId = process.env.GARMIN_CLIENT_ID;
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/garmin`;

        console.log(`Initiating Garmin OAuth for client ${clientId} with callback ${callbackUrl}`);
        // In a real app, this would return the redirect URL
        return { url: "#" };
    }

    /**
     * Handle the OAuth callback
     */
    static async handleCallback(oauthToken: string, oauthVerifier: string, userId: string) {
        // logic to exchange verifier for access token
        // update User model with tokens and garminConnected = true
        await prisma.user.update({
            where: { id: userId },
            data: {
                garminConnected: true,
                // store tokens...
            }
        });
    }
}

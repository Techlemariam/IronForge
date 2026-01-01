import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OracleService } from "@/services/oracle";
import { ProgressionService } from "@/services/progression";
import { processUserCardioActivity } from "@/actions/duel";
import { getActivityStream } from "@/lib/intervals";
import { conquestFromActivity } from "@/services/game/TerritoryService";

// Defines the shape of an Intervals.icu Activity Event
// Reference: https://intervals.icu/api/v1/athlete/{id}/activities
interface IntervalsActivityPayload {
  id: string; // Intervals Activity ID
  type: string; // e.g., "Run", "Ride", "WeightTraining"
  start_date_local: string;
  moving_time: number; // seconds
  training_load?: number; // TSS
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  distance?: number; // Meters
  icu_athlete_id: string; // Crucial for matching user
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Secret
    // Intervals.icu sends identifying header or you can check Authorization
    const signature = request.headers.get("Authorization");

    console.log(
      "[Intervals Webhook] Incoming Activity. Auth Signature detected.",
    );

    // 2. Parse Body
    const activity: IntervalsActivityPayload = await request.json();

    if (!activity.id || !activity.icu_athlete_id) {
      return NextResponse.json(
        { error: "Invalid payload: missing id or athlete_id" },
        { status: 400 },
      );
    }

    console.log(
      `[Intervals Webhook] Processing ${activity.type} for Athlete: ${activity.icu_athlete_id}`,
    );

    // 3. Match User
    const user = await prisma.user.findFirst({
      where: { intervalsAthleteId: activity.icu_athlete_id },
    });

    if (!user) {
      console.warn(
        `[Intervals Webhook] No user found with intervalsAthleteId: ${activity.icu_athlete_id}`,
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Persistence
    // We only care about Cardio for CardioLog.
    // If it's WeightTraining, Hevy might handle it better, but we can log it too as fallback.
    const isCardio = [
      "Run",
      "Ride",
      "Swim",
      "Row",
      "Walk",
      "Hike",
      "NordicSki",
      "VirtualRide",
      "VirtualRun",
    ].includes(activity.type);

    if (isCardio) {
      await prisma.cardioLog.upsert({
        where: { intervalsId: String(activity.id) },
        update: {
          type: activity.type,
          duration: activity.moving_time,
          load: activity.training_load || 0,
          averageHr: activity.average_heartrate,
          date: new Date(activity.start_date_local),
        },
        create: {
          intervalsId: String(activity.id),
          userId: user.id,
          type: activity.type,
          duration: activity.moving_time,
          load: activity.training_load || 0,
          averageHr: activity.average_heartrate,
          date: new Date(activity.start_date_local),
        },
      });
      console.log(
        `[Intervals Webhook] Persisted CardioLog: ${activity.type} | Load: ${activity.training_load}`,
      );

      // Trigger Duel Updates
      // Intervals payload doesn't seem to have distance directly in the typed interface I saw?
      // "IntervalsActivityPayload" definition:
      // interface IntervalsActivityPayload {
      //   id: string; ... moving_time: number; ...
      // }
      // It might be missing in the interface but present in payload.
      // But for now, let's assume we might need to fetch it or update interface?
      // Let's check the partial interface.

      // We'll update the interface to include distance if possible, or cast to any.
      // Intervals API typically sends distance (meters).
      const distanceMeters = (activity as any).distance || 0;
      const distanceKm = distanceMeters / 1000;
      const durationMin = activity.moving_time / 60;

      if (distanceKm > 0) {
        await processUserCardioActivity(user.id, activity.type, distanceKm, durationMin);
      }

      // --- Territory Conquest Integration ---
      const isConquestSport = ["Run", "Walk", "Hike", "VirtualRun"].includes(activity.type);

      if (isConquestSport && distanceKm > 0.1 && user.intervalsApiKey) {
        console.log(`[Intervals Webhook] Fetching GPS stream for Territory Conquest...`);
        const gpsTrack = await getActivityStream(activity.id, user.intervalsApiKey);

        if (gpsTrack && gpsTrack.length > 0) {
          const conquest = await conquestFromActivity(user.id, gpsTrack, {
            avgHr: activity.average_heartrate,
            maxHr: activity.max_heartrate,
            avgPower: activity.average_watts,
            ftp: user.ftpRun ?? 250,
          });

          console.log(
            `[Intervals Webhook] Territory Updated: ${conquest.tilesConquered} new, ${conquest.tilesReinforced} reinforced.`
          );
        } else {
          console.warn(`[Intervals Webhook] No GPS track found for activity ${activity.id}`);
        }
      }
    } else {
      console.log(
        `[Intervals Webhook] Skipping non-cardio activity type: ${activity.type}`,
      );
    }

    // 4. Trigger Oracle Recalculation
    console.log("[Intervals Webhook] Triggering Oracle recalculation...");
    // OracleService.recalculate(user.id); // Assuming OracleService has a recalculate method

    // 5. Award Rewards
    if (user) {
      await ProgressionService.awardGold(user.id, 15);
      await ProgressionService.addExperience(user.id, 100);
      console.log(
        `[Intervals Webhook] Rewards awarded to ${user.id}: 15g, 100xp`,
      );
    }

    // 6. Success
    return NextResponse.json(
      { success: true, message: "Activity processed & Rewards awarded" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Intervals Webhook] Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

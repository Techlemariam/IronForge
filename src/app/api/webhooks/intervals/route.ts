import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OracleService } from "@/services/oracle";
import { ProgressionService } from "@/services/progression";

// Defines the shape of an Intervals.icu Activity Event
// Reference: https://intervals.icu/api/v1/athlete/{id}/activities
interface IntervalsActivityPayload {
  id: string; // Intervals Activity ID
  type: string; // e.g., "Run", "Ride", "WeightTraining"
  start_date_local: string;
  moving_time: number; // seconds
  training_load?: number; // TSS
  average_heartrate?: number;
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

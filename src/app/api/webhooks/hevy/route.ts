import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import axios from "axios";
import { ProgressionService } from "@/services/progression";

// Defines the shape of a Hevy Webhook Payload (Notification only)
interface HevyWebhookEvent {
  id: string; // Event ID
  payload: {
    workoutId: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Secret (Authorization Header from Hevy)
    // 1. Verify Secret (Authorization Header from Hevy)
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.HEVY_WEBHOOK_SECRET;

    // Only validate if secret is configured (to avoid breaking dev if not set)
    if (secret && authHeader !== secret) {
      logger.warn("[Hevy Webhook] Unauthorized attempt. Invalid Secret.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info(`[Hevy Webhook] Received request. Auth: ${authHeader}`);

    // 2. Parse Body to get Workout ID
    const body = await request.json();
    const event: HevyWebhookEvent = body;

    if (!event.payload || !event.payload.workoutId) {
      return NextResponse.json(
        { error: "Invalid payload: workoutId missing" },
        { status: 400 },
      );
    }

    const workoutId = event.payload.workoutId;
    logger.info(
      `[Hevy Webhook] Notification received for Workout ID: ${workoutId}`,
    );

    // 3. Fetch Full Workout Details from Hevy API
    // We need the full details (exercises, sets, weight) to update our DB.
    const hevyApiKey = process.env.HEVY_API_KEY;
    if (!hevyApiKey) {
      logger.error("HEVY_API_KEY not configured on server.");
      return NextResponse.json(
        { error: "Server Configuration Error" },
        { status: 500 },
      );
    }

    const response = await axios.get(
      `https://api.hevyapp.com/v1/workouts/${workoutId}`,
      {
        headers: { "api-key": hevyApiKey },
      },
    );

    const workoutData = response.data.workout; // Assuming structure is { workout: ... }

    if (!workoutData) {
      throw new Error("Hevy API returned no workout data.");
    }

    logger.info(
      `[Hevy Webhook] Fetched full workout: ${workoutData.title} (${workoutData.exercises?.length} exercises)`,
    );

    // 4. Upsert to DB
    // A. Identify User (Single Tenant Assumption for now, or use Auth Header to match User)
    const user = await prisma.user.findFirst();
    if (!user) {
      logger.error("No user found in database to attach workout to.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { exercises, start_time } = workoutData;
    let logsCreated = 0;

    for (const exercise of exercises) {
      // Calculate e1RM for this exercise session
      let maxE1rm = 0;
      let totalRpe = 0;
      let rpeCount = 0;

      // Iterate sets
      for (const set of exercise.sets) {
        if (set.weight_kg && set.reps) {
          // Epley Formula: 1RM = Weight * (1 + Reps/30)
          const e1rm = set.weight_kg * (1 + set.reps / 30);
          if (e1rm > maxE1rm) maxE1rm = e1rm;
        }
        if (set.rpe) {
          totalRpe += set.rpe;
          rpeCount++;
        }
      }

      const _avgRpe = rpeCount > 0 ? totalRpe / rpeCount : 0;

      // Create ExerciseLog
      // Use Template ID or Title as identifier
      await prisma.exerciseLog.create({
        data: {
          userId: user.id,
          date: new Date(start_time),
          exerciseId: exercise.title || "Unknown Exercise", // Fallback to title
          sets: exercise.sets.map(
            (set: { weight_kg?: number; reps?: number; rpe?: number }) => ({
              weight: set.weight_kg || 0,
              reps: set.reps || 0,
              rpe: set.rpe || null,
              isWarmup: false,
            }),
          ),
          isPersonalRecord: maxE1rm > 100, // Arbitrary threshold or based on user stats
        },
      });
      logsCreated++;
    }

    logger.info(
      `[Hevy Webhook] Successfully logged ${logsCreated} exercises for User ${user.heroName || user.id}`,
    );

    // 5. Award Rewards (Manager automation)
    // Fixed reward: 25 Gold per workout session + 50 XP per exercise
    await ProgressionService.awardGold(user.id, 25);
    await ProgressionService.addExperience(user.id, logsCreated * 50);

    const newWilks = await ProgressionService.updateWilksScore(user.id);

    logger.info(
      `[Hevy Webhook] Automated rewards granted: 25g, ${logsCreated * 50}xp. New Wilks: ${newWilks.toFixed(2)}`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Workout processed & Rewards granted",
        logs: logsCreated,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error(
      { err: error.response?.data || error },
      "[Hevy Webhook] Error",
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

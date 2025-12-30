import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PlannerService } from "@/services/planner";

export const maxDuration = 300; // 5 minutes max for Cron Jobs (Pro plan limits apply)
export const dynamic = "force-dynamic";

import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  return await Sentry.withMonitor("generate-plans", async () => {
    // 1. Authenticate Cron Request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow local testing without secret if strictly needed, or stick to strict auth
      // For now, strict auth.
      // Return 401
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      console.log("Cron: Starting Weekly Plan Generation...");

      // 2. Fetch Eligible Users
      // Ideally only users with active subscriptions or who have logged in recently
      // For MVP, all users who have an active path set.
      const users = await prisma.user.findMany({
        where: {
          activePath: { not: null },
        },
        select: { id: true, heroName: true },
      });

      console.log(`Cron: Found ${users.length} users to process.`);

      const results = [];
      const errors = [];

      // 3. Process Each User
      // Run in parallel with Promise.allSettled? Or sequential to avoid API rate limits (Intervals/Hevy/Gemini)?
      // Gemini has rate limits. Intervals has strict rate limits.
      // Sequential is safer for rate limits.
      for (const user of users) {
        try {
          console.log(`Cron: Processing user ${user.heroName} (${user.id})...`);
          await PlannerService.triggerWeeklyPlanGeneration(user.id);
          results.push(user.id);
        } catch (e: any) {
          console.error(`Cron: Failed for user ${user.id}:`, e);
          errors.push({ userId: user.id, error: e.message });
        }
      }

      return NextResponse.json({
        success: true,
        processed: results.length,
        failed: errors.length,
        errors,
      });
    } catch (error: any) {
      console.error("Cron: Critical failure:", error);
      return new NextResponse(`Internal Error: ${error.message}`, {
        status: 500,
      });
    }
  });
}

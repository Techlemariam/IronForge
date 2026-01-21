import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PowerRatingService } from "@/services/game/PowerRatingService";
import { applyDecay } from "@/lib/powerRating";
import { withCronMonitor } from "@/lib/sentry-cron";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Weekly Power Rating Recalculation Cron
 * - Calculates Power Score via PowerRatingService
 * - Applies decay for inactive users (Calculated logic delegates to active metrics, 
 *   but decay is applied for strictly inactive users).
 */
const handler = async (request: NextRequest) => {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET || "dev_secret";
    if (authHeader !== `Bearer ${secret}`) {
        logger.warn("Power Rating Cron: Unauthorized attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    try {
        const titans = await prisma.titan.findMany({
            where: {
                isInjured: false,
                lastActive: { gte: sixtyDaysAgo }, // Skip totally dead accounts
            },
            select: { userId: true, lastActive: true, powerRating: true }
        });

        logger.info({ count: titans.length }, "[Power Rating Cron] Processing Titans");

        let processed = 0;
        let decayed = 0;
        let recalculated = 0;
        const errors: string[] = [];

        for (const titan of titans) {
            try {
                const daysSinceActive = Math.floor(
                    (now.getTime() - titan.lastActive.getTime()) / (24 * 60 * 60 * 1000)
                );

                if (daysSinceActive >= 7) {
                    // Inactive: Apply Decay
                    // Decay logic: 5% per week of inactivity.
                    // We simply reduce their current rating.
                    const newRating = applyDecay(titan.powerRating, daysSinceActive);

                    if (newRating !== titan.powerRating) {
                        await prisma.titan.update({
                            where: { userId: titan.userId },
                            data: { powerRating: newRating, lastPowerCalcAt: now }
                        });
                        decayed++;
                    }
                } else {
                    // Active: Recalculate based on metrics
                    await PowerRatingService.syncPowerRating(titan.userId);
                    recalculated++;
                }

                processed++;
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                errors.push(`User ${titan.userId}: ${errorMsg}`);
                logger.error({ userId: titan.userId, err }, "[Power Rating Cron] Error processing user");
            }
        }

        logger.info({ processed, recalculated, decayed, errorsCount: errors.length }, "[Power Rating Cron] Completed");

        return NextResponse.json({
            success: true,
            processed,
            recalculated,
            decayed,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        logger.error({ err: error }, "[Power Rating Cron] Critical Error");
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
};

export const GET = withCronMonitor(handler as any, {
    slug: "power-rating",
    schedule: "0 3 * * 0",
});

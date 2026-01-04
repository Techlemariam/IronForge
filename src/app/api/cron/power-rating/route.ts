import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePowerRating, applyDecay, TrainingPath } from "@/lib/powerRating";
import { withCronMonitor } from "@/lib/sentry-cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Weekly Power Rating Recalculation Cron
 * - Calculates adherence from ExerciseLog/CardioLog
 * - Applies decay for inactive users
 * - Updates Titan powerRating, strengthIndex, cardioIndex
 * 
 * Schedule: Sundays 03:00 UTC (configured in vercel.json)
 */
const handler = async (request: NextRequest) => {
    // 1. Authorization Check
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET || "dev_secret";
    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    try {
        // 2. Fetch active Titans (not injured, active within 60 days)
        const titans = await prisma.titan.findMany({
            where: {
                isInjured: false,
                lastActive: { gte: sixtyDaysAgo },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        activePath: true,
                        bodyWeight: true,
                        ftpCycle: true,
                        ftpRun: true,
                        pvpProfile: {
                            select: { highestWilksScore: true }
                        }
                    }
                }
            }
        });

        console.log(`[Power Rating Cron] Processing ${titans.length} Titans...`);

        let processed = 0;
        let decayed = 0;
        let recalculated = 0;
        const errors: string[] = [];

        for (const titan of titans) {
            try {
                const userId = titan.userId;

                // 3. Calculate Adherence (last 7 days)
                const [strengthSessions, cardioSessions] = await Promise.all([
                    prisma.exerciseLog.count({
                        where: {
                            userId,
                            date: { gte: sevenDaysAgo }
                        }
                    }),
                    prisma.cardioLog.count({
                        where: {
                            userId,
                            date: { gte: sevenDaysAgo }
                        }
                    })
                ]);

                // Adherence: 4 strength sessions/week = 100%, 3 cardio sessions/week = 100%
                const mrvAdherence = Math.min(1.0, strengthSessions / 4);
                const cardioAdherence = Math.min(1.0, cardioSessions / 3);

                // 4. Check for decay
                const daysSinceActive = Math.floor(
                    (now.getTime() - titan.lastActive.getTime()) / (24 * 60 * 60 * 1000)
                );

                // 5. Get user metrics
                const wilks = titan.user.pvpProfile?.highestWilksScore || 0;
                let wkg = 0;
                const bodyWeight = titan.user.bodyWeight || 75;

                if (titan.user.ftpCycle && bodyWeight > 0) {
                    wkg = titan.user.ftpCycle / bodyWeight;
                } else if (titan.user.ftpRun && bodyWeight > 0) {
                    wkg = titan.user.ftpRun / bodyWeight;
                }

                const path = (titan.user.activePath as TrainingPath) || "WARDEN";

                // 6. Calculate new Power Rating
                const result = calculatePowerRating(
                    wilks,
                    wkg,
                    path,
                    mrvAdherence,
                    cardioAdherence
                );

                // 7. Apply decay if inactive
                let finalPowerRating = result.powerRating;
                if (daysSinceActive >= 7) {
                    finalPowerRating = applyDecay(result.powerRating, daysSinceActive);
                    decayed++;
                }

                // 8. Update Titan
                await prisma.titan.update({
                    where: { userId },
                    data: {
                        powerRating: finalPowerRating,
                        strengthIndex: result.strengthIndex,
                        cardioIndex: result.cardioIndex,
                        mrvAdherence: 1.0 + (mrvAdherence * 0.15),
                        lastPowerCalcAt: now,
                    }
                });

                recalculated++;
                processed++;
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                errors.push(`User ${titan.userId}: ${errorMsg}`);
                console.error(`[Power Rating Cron] Error for ${titan.userId}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            recalculated,
            decayed,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error("[Power Rating Cron] Critical Error:", error);
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

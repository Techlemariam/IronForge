import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runWeeklySettlement } from "@/services/game/TerritoryService";
import { calculatePowerRating, applyDecay, TrainingPath } from "@/lib/powerRating";
// import { runSeasonTransition } from "@/services/game/SeasonService"; // If exists

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for weekly heavy tasks

/**
 * WEEKLY MAINTENANCE CRON
 * - Territory Settlement
 * - Power Rating Recalculation & Decay
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const report: any = {
        timestamp: new Date().toISOString(),
        tasks: {}
    };

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Territory Settlement
    try {
        const result = await runWeeklySettlement();
        report.tasks.settlement = { success: true, ...result };
    } catch (e) {
        report.tasks.settlement = { success: false, error: String(e) };
    }

    // 2. Power Rating
    try {
        const titans = await prisma.titan.findMany({
            where: { isInjured: false, lastActive: { gte: sixtyDaysAgo } },
            include: { user: { select: { id: true, activePath: true, bodyWeight: true, ftpCycle: true, ftpRun: true, pvpProfile: { select: { highestWilksScore: true } } } } }
        });

        let recalculated = 0;
        for (const titan of titans) {
            try {
                const [strengthSessions, cardioSessions] = await Promise.all([
                    prisma.exerciseLog.count({ where: { userId: titan.userId, date: { gte: sevenDaysAgo } } }),
                    prisma.cardioLog.count({ where: { userId: titan.userId, date: { gte: sevenDaysAgo } } })
                ]);

                const mrvAdherence = Math.min(1.0, strengthSessions / 4);
                const cardioAdherence = Math.min(1.0, cardioSessions / 3);
                const daysSinceActive = Math.floor((now.getTime() - titan.lastActive.getTime()) / (24 * 60 * 60 * 1000));

                const wilks = titan.user.pvpProfile?.highestWilksScore || 0;
                let wkg = 0;
                const bodyWeight = titan.user.bodyWeight || 75;
                if (titan.user.ftpCycle && bodyWeight > 0) wkg = titan.user.ftpCycle / bodyWeight;
                else if (titan.user.ftpRun && bodyWeight > 0) wkg = titan.user.ftpRun / bodyWeight;

                const path = (titan.user.activePath as TrainingPath) || "WARDEN";
                const result = calculatePowerRating(wilks, wkg, path, mrvAdherence, cardioAdherence);

                let finalPowerRating = result.powerRating;
                if (daysSinceActive >= 7) {
                    finalPowerRating = applyDecay(result.powerRating, daysSinceActive);
                }

                await prisma.titan.update({
                    where: { userId: titan.userId },
                    data: {
                        powerRating: finalPowerRating,
                        strengthIndex: result.strengthIndex,
                        cardioIndex: result.cardioIndex,
                        mrvAdherence: 1.0 + (mrvAdherence * 0.15),
                        lastPowerCalcAt: now,
                    }
                });
                recalculated++;
            } catch (e) {
                console.error(`Power rating failed for ${titan.userId}`, e);
            }
        }
        report.tasks.powerRating = { success: true, processed: titans.length, recalculated };
    } catch (e) {
        report.tasks.powerRating = { success: false, error: String(e) };
    }

    return NextResponse.json(report);
}

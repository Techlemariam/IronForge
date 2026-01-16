import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runWeeklySettlement } from "@/services/game/TerritoryService";


export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for weekly heavy tasks

/**
 * WEEKLY MAINTENANCE CRON
 * - Territory Settlement
 * - Power Rating Recalculation & Decay
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET || "dev_secret";
    if (authHeader !== `Bearer ${secret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const report: any = {
        timestamp: new Date().toISOString(),
        tasks: {}
    };

    const now = new Date();

    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Territory Settlement (Individual User Tiles)
    try {
        const result = await runWeeklySettlement();
        report.tasks.settlement = { success: true, ...result };
    } catch (e) {
        report.tasks.settlement = { success: false, error: String(e) };
    }

    // 2. Guild Territory Claims (Guild Competition)
    try {
        const { processWeeklyTerritoryClaimsAction } = await import("@/actions/systems/territories");
        const guildClaimResults = await processWeeklyTerritoryClaimsAction();
        report.tasks.guildTerritories = {
            success: true,
            territoriesProcessed: guildClaimResults.length,
            ownershipChanges: guildClaimResults.filter(r => r.previousOwner !== r.newOwner).length,
        };
    } catch (e) {
        report.tasks.guildTerritories = { success: false, error: String(e) };
    }

    // 3. Power Rating (Recalculate & Decay)
    try {
        const { PowerRatingService } = await import("@/services/game/PowerRatingService");
        const { applyDecay } = await import("@/lib/powerRating");

        // Fetch titans active in last 60 days
        const titans = await prisma.titan.findMany({
            where: { isInjured: false, lastActive: { gte: sixtyDaysAgo } },
            select: { userId: true, lastActive: true, powerRating: true }
        });

        let recalculated = 0;
        for (const titan of titans) {
            try {
                // 1. Recalculate based on recent performance
                // This updates the titan with the new 'performance' rating
                const result = await PowerRatingService.syncPowerRating(titan.userId);
                let newRating = result.powerRating;

                // 2. Apply Inactivity Decay
                // If user hasn't opened app/logged workout in > 7 days, apply additional decay penalty
                const daysSinceActive = Math.floor((now.getTime() - titan.lastActive.getTime()) / (24 * 60 * 60 * 1000));

                if (daysSinceActive >= 7) {
                    newRating = applyDecay(newRating, daysSinceActive);

                    // Update if decay changed it (syncPowerRating already saved the non-decayed value)
                    if (newRating !== result.powerRating) {
                        await prisma.titan.update({
                            where: { userId: titan.userId },
                            data: { powerRating: newRating }
                        });
                    }
                }
                recalculated++;
            } catch (e) {
                console.error(`Power rating failed for ${titan.userId}`, e);
            }
        }
        report.tasks.powerRating = { success: true, processed: titans.length, recalculated };
    } catch (e) {
        report.tasks.powerRating = { success: false, error: String(e) };
    }

    // 4. PvP Season Transition
    try {
        const { SeasonService } = await import("@/services/game/SeasonService");
        const result = await SeasonService.checkSeasonTransition();
        report.tasks.seasonTransition = { success: true, ...result };
    } catch (e) {
        report.tasks.seasonTransition = { success: false, error: String(e) };
    }

    return NextResponse.json(report);
}

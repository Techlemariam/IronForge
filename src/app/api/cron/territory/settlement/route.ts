import { NextRequest, NextResponse } from "next/server";
import { runWeeklySettlement } from "@/services/game/TerritoryService";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5min for settlement (heavy operation)

/**
 * Weekly Settlement Cron Job
 * Runs Sundays at 23:59 to determine tile ownership.
 */
export async function GET(request: NextRequest) {
    // Authorization Check
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("[Territory Cron] Starting Weekly Settlement...");
        const result = await runWeeklySettlement();

        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Territory Cron] Settlement Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

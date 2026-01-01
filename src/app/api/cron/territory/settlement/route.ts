import { NextRequest, NextResponse } from "next/server";
import { runWeeklySettlement } from "@/services/game/TerritoryService";

export const dynamic = "force-dynamic";

/**
 * Weekly Territory Settlement Cron Job
 * Runs Sundays at 23:59 UTC.
 * Schedule: "59 23 * * 0" (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("[Cron: Territory Settlement] Starting weekly settlement...");
        const result = await runWeeklySettlement();
        return NextResponse.json({
            success: true,
            message: "Weekly settlement complete",
            stats: result
        });
    } catch (error) {
        console.error("[Cron: Territory Settlement] Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

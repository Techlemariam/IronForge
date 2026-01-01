import { NextRequest, NextResponse } from "next/server";
import { runWeeklySettlement, distributeDailyIncome } from "@/services/game/TerritoryService";

export const dynamic = "force-dynamic";

/**
 * Daily Territory Income Cron Job
 * Runs daily at 00:05 UTC.
 * Schedule: "5 0 * * *" (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("[Cron: Territory Income] Starting distribution...");
        await distributeDailyIncome();
        return NextResponse.json({ success: true, message: "Income distributed" });
    } catch (error) {
        console.error("[Cron: Territory Income] Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

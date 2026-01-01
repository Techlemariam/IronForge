import { NextRequest, NextResponse } from "next/server";
import { distributeDailyIncome } from "@/services/game/TerritoryService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily Income Cron Job
 * Runs daily (e.g. 00:05) to distribute Gold/XP from owned territories.
 */
export async function GET(request: NextRequest) {
    // Authorization Check
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("[Territory Cron] Distributing Daily Income...");
        await distributeDailyIncome();

        return NextResponse.json({
            success: true,
            message: "Daily income distributed",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Territory Cron] Income Distribution Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

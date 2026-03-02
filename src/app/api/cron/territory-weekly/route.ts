import { NextRequest, NextResponse } from "next/server";
import { TerritoryService } from "@/services/game/TerritoryService";

/**
 * Weekly Territory Resolution Cron
 * Triggered on Sundays (usually) to resolve all expired contests.
 * 
 * Authorization: Requires CRON_SECRET header
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await TerritoryService.runWeeklySettlement();

        return NextResponse.json({
            success: true,
            message: "Territory resolution completed successfully.",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Territory Cron Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { SeasonService } from "@/services/pvp/SeasonService";

export const dynamic = 'force-dynamic';

/**
 * PvP Season Transition Cron
 * Runs weekly to check if season has ended and transition to next season.
 * Distributes rewards to top 100 players.
 */
export async function GET(request: NextRequest) {
    // 1. Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 2. Attempt season transition
        const result = await SeasonService.transitionSeason();

        if (!result.success) {
            // Not an error - season just hasn't ended yet
            return NextResponse.json({
                success: true,
                message: result.message
            });
        }

        return NextResponse.json({
            success: true,
            endedSeason: result.endedSeason,
            newSeason: result.newSeason,
            rewardsDistributed: result.rewardsDistributed,
            message: "Season transitioned successfully"
        });
    } catch (error) {
        console.error("Season transition error:", error);
        return NextResponse.json(
            { success: false, message: "Season transition failed" },
            { status: 500 }
        );
    }
}

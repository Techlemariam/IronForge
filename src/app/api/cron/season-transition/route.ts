import { NextRequest, NextResponse } from "next/server";
import { awardSeasonRewardsAction } from "@/actions/iron-leagues";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: NextRequest) {
    // 1. Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Logic: Award Rewards
    const result = await awardSeasonRewardsAction();

    if (!result.success) {
        return NextResponse.json({ success: false, message: "Failed to award rewards" }, { status: 500 });
    }

    // 3. Logic: Transition Season (Future)
    // For now, season is calculated by date in getter, so it auto-transitions.
    // We just needed to trigger the rewards for the *previous* season?
    // Actually, this cron should run on the 1st of every quarter.

    return NextResponse.json({
        success: true,
        rewardedCount: result.rewarded,
        message: "Season rewards processed successfully"
    });
}

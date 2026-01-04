import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentSeasonAction, getPlayerRatingAction, getLeaderboardAction } from "@/actions/pvp-ranked";
import { RankedArenaClient } from "@/features/pvp/components/ranked/RankedArenaClient";

export default async function RankedArenaPage() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/auth");
    }

    const [season, playerRating, leaderboard] = await Promise.all([
        getCurrentSeasonAction(),
        getPlayerRatingAction(session.user.id),
        getLeaderboardAction(),
    ]);

    return (
        <div className="container py-8">
            <RankedArenaClient
                season={season}
                playerRating={playerRating}
                leaderboard={leaderboard}
                userId={session.user.id} // Passing ID to highlight user in leaderboard, simpler than heroName match
            />
        </div>
    );
}

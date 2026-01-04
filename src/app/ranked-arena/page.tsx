import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentSeasonAction, getPlayerRatingAction } from "@/actions/pvp-ranked";
import { getLeaderboardAction } from "@/actions/leaderboards";
import { RankedArenaClient } from "@/features/pvp/components/ranked/RankedArenaClient";
import { prisma } from "@/lib/prisma";
import { Faction } from "@/lib/pvpRanks";

export default async function RankedArenaPage() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/auth");
    }

    const [season, playerRating, leaderboardResult, user] = await Promise.all([
        getCurrentSeasonAction(),
        getPlayerRatingAction(session.user.id),
        getLeaderboardAction("PVP", { userId: session.user.id }),
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { faction: true }
        }),
    ]);

    const faction: Faction = (user?.faction as Faction) || "HORDE";

    return (
        <div className="container py-8">
            <RankedArenaClient
                season={season}
                playerRating={playerRating}
                leaderboard={leaderboardResult.leaderboard}
                userId={session.user.id}
                faction={faction}
            />
        </div>
    );
}


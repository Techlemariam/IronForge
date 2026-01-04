import { getDuelStatusAction } from "@/actions/pvp/duel";
import { getLeagueInfoAction, getCurrentSeasonAction, getLeagueLeaderboardAction } from "@/actions/pvp/leagues";
import { getSession } from "@/lib/auth";
import { ArenaClient } from "./ArenaClient";
import { DuelLeaderboard } from "@/features/pvp/components/duel/DuelLeaderboard";

export default async function IronArenaPage() {
  const session = await getSession();
  if (!session?.user) {
    return <div>Please login to access the Iron Arena.</div>;
  }

  const [duelStatus, leagueInfo, seasonInfo] = await Promise.all([
    getDuelStatusAction(),
    getLeagueInfoAction(session.user.id),
    getCurrentSeasonAction()
  ]);

  const activeDuel = duelStatus.success ? (duelStatus.duel ?? null) : null;

  // Fetch leaderboard for the user's current league (or default to Bronze)
  const currentLeagueId = leagueInfo?.tier.id || "bronze";
  const leaderboard = await getLeagueLeaderboardAction(currentLeagueId, 10);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-red-600 bg-clip-text text-transparent">
          Iron Arena
        </h1>
        <p className="text-slate-400">
          Ranked Seasons are live! Prove your dominance.
        </p>
      </header>

      <ArenaClient
        activeDuel={activeDuel ?? null}
        currentUserId={session.user.id}
        leagueInfo={leagueInfo}
        seasonInfo={seasonInfo}
        leaderboard={leaderboard}
      />

      {/* Duel Leaderboard Section */}
      <div className="mt-12">
        <DuelLeaderboard currentUserId={session.user.id} />
      </div>
    </div>
  );
}

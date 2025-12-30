import { getDuelStatusAction } from "@/actions/duel";
import { DuelCard } from "@/components/duel/DuelCard";
import { ChallengeModal } from "@/components/duel/ChallengeModal";
import { getSession } from "@/lib/auth"; // Ensure this path is correct
import { ArenaClient } from "./ArenaClient";

export default async function IronArenaPage() {
  const session = await getSession();
  if (!session?.user) {
    return <div>Please login to access the Iron Arena.</div>;
  }

  const duelStatus = await getDuelStatusAction();
  const activeDuel = duelStatus.success ? duelStatus.duel : null;
  // pending is available in duelStatus.pending if needed

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-red-600 bg-clip-text text-transparent">
          Iron Arena
        </h1>
        <p className="text-slate-400">
          Prove your Titan&apos;s dominance in 7-day training duels.
        </p>
      </header>

      <ArenaClient activeDuel={activeDuel} currentUserId={session.user.id} />
    </div>
  );
}

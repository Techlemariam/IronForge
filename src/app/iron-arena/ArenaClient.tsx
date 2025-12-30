"use client";

import { useState } from "react";
import { DuelCard } from "@/components/duel/DuelCard";
import { DuelVictoryScreen } from '@/components/duel/DuelVictoryScreen';
import { ChallengeModal } from "@/components/duel/ChallengeModal";
import { CardioDuelModal } from "@/components/duel/CardioDuelModal";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";
import { toast } from "sonner";

interface ArenaClientProps {
  activeDuel: any; // Type strictly with Prisma types ideally
  currentUserId: string;
}

export function ArenaClient({ activeDuel, currentUserId }: ArenaClientProps) {
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(
    null,
  );

  if (activeDuel?.status === 'COMPLETED') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">
            Arena Results
          </h1>
          <p className="text-slate-400">The dust has settled.</p>
        </div>
        <DuelVictoryScreen
          duel={activeDuel}
          currentUserId={currentUserId}
          onClose={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Duel Section */}
      <section>
        {activeDuel ? (
          <DuelCard
            duel={activeDuel}
            currentUserId={currentUserId}
            onTaunt={async () => {
              const { sendTauntAction } = await import('@/actions/duel');
              const res = await sendTauntAction(activeDuel.id);
              if (res.success) toast.success("Taunt sent to your rival!");
              else toast.error("Failed to taunt.");
            }}
          />
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Swords className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200">
              No Active Duel
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              The arena is quiet. Challenge a rival Titan to ignite the flames
              of competition.
            </p>
            <Button
              onClick={() => setIsChallengeOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 mt-4"
            >
              Find Opponent
            </Button>
          </div>
        )}
      </section>

      {/* Step 1: Find Opponent */}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        onSelectOpponent={(id) => {
          setIsChallengeOpen(false);
          setSelectedOpponentId(id);
        }}
      />

      {/* Step 2: Configure Duel */}
      {selectedOpponentId && (
        <div className="fixed inset-0 z-50">
          {/* Using key to reset state if needed */}
          <CardioDuelModal
            key={selectedOpponentId}
            isOpen={!!selectedOpponentId}
            onClose={() => setSelectedOpponentId(null)}
            opponentId={selectedOpponentId}
          />
        </div>
      )}
    </div>
  );
}

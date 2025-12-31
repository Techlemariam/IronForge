"use client";

import { useState } from "react";
import { DuelCard } from "@/components/duel/DuelCard";
import { DuelVictoryScreen } from '@/components/duel/DuelVictoryScreen';
import { ChallengeModal } from "@/components/duel/ChallengeModal";
import { CardioDuelModal } from "@/components/duel/CardioDuelModal";
import { Button } from "@/components/ui/button";
import { Swords, Trophy, Crown, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { SeasonInfo } from "@/actions/iron-leagues";
import { LeagueInfo } from "@/lib/game/tier-data";
import { motion, AnimatePresence } from "framer-motion";

import { DuelChallenge, User } from '@prisma/client';

// Extended type matches what we return from getDuelStatusAction
export type ExtendedDuel = DuelChallenge & {
  challenger: Pick<User, "id" | "heroName" | "level" | "image" | "faction">;
  defender: Pick<User, "id" | "heroName" | "level" | "image" | "faction">;
};

interface ArenaClientProps {
  activeDuel: ExtendedDuel | null;
  currentUserId: string;
  leagueInfo: LeagueInfo | null;
  seasonInfo: SeasonInfo;
  leaderboard: { entries: any[], totalPlayers: number };
}

export function ArenaClient({ activeDuel, currentUserId, leagueInfo, seasonInfo, leaderboard }: ArenaClientProps) {
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ARENA' | 'LEADERBOARD'>('ARENA');

  // Victory Screen Loop
  if (activeDuel?.status === 'COMPLETED') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <DuelVictoryScreen
          duel={activeDuel}
          currentUserId={currentUserId}
          onClose={() => window.location.reload()}
        />
      </div>
    );
  }

  // League Display Data
  const currentTier = leagueInfo?.tier || { name: "Unranked", color: "#666", icon: "🛡️", minRating: 0 };
  const nextTier = leagueInfo?.nextTier;
  const points = leagueInfo?.seasonPoints || 0;
  const progressPercent = nextTier
    ? Math.min(100, Math.max(0, ((points - currentTier.minRating) / (nextTier.minRating - currentTier.minRating)) * 100))
    : 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* --- SEASON HEADER --- */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Crown className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Left: League Info */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-zinc-950 border-4 shadow-xl"
              style={{ borderColor: currentTier.color }}
            >
              {currentTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                  {currentTier.name}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Rank #{leagueInfo?.rank || '-'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  {points} SR
                </span>
                <span>•</span>
                <span className="text-zinc-500">
                  {leagueInfo?.seasonWins || 0}W - {leagueInfo?.seasonLosses || 0}L
                </span>
              </div>
            </div>
          </div>

          {/* Right: Season Timer */}
          <div className="flex flex-col items-end">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Season</div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              {seasonInfo.name}
            </div>
            <div className="flex items-center gap-2 text-amber-500 text-sm font-mono mt-1">
              <Calendar className="w-4 h-4" />
              {seasonInfo.daysRemaining} days remaining
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">
              <span>Progress to {nextTier.name}</span>
              <span>{points} / {nextTier.minRating}</span>
            </div>
            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* --- TABS --- */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('ARENA')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm border-b-2 transition-colors ${activeTab === 'ARENA' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          My Arena
        </button>
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm border-b-2 transition-colors ${activeTab === 'LEADERBOARD' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          Leaderboard
        </button>
      </div>

      {/* --- CONTENT --- */}
      <div className="min-h-[400px]">
        {activeTab === 'ARENA' ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeDuel ? (
              <DuelCard
                duel={activeDuel}
                currentUserId={currentUserId}
                onTaunt={async () => {
                  try {
                    const { sendTauntAction } = await import('@/actions/duel');
                    const res = await sendTauntAction(activeDuel.id);
                    if (res.success) toast.success("Taunt sent!");
                    else toast.error("Taunt failed.");
                  } catch (e) { toast.error("Error sending taunt"); }
                }}
              />
            ) : (
              <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Swords className="w-10 h-10 text-zinc-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Battle Ready?
                  </h2>
                  <p className="text-zinc-400 max-w-md mx-auto">
                    Challenge a rival Titan to a 7-day duel. Wins grant SR and propel you up the leagues.
                  </p>
                </div>
                <Button
                  onClick={() => setIsChallengeOpen(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest px-8 py-6 rounded-lg text-lg shadow-lg shadow-amber-900/20 hover:scale-105 transition-all"
                >
                  Find Opponent
                </Button>
              </div>
            )}
          </section>
        ) : (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 text-zinc-500 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Titan</th>
                    <th className="p-4 text-center">Rating</th>
                    <th className="p-4 text-right">W/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {leaderboard.entries.map((entry) => (
                    <tr key={entry.userId} className={`hover:bg-zinc-800/50 transition-colors ${entry.userId === currentUserId ? 'bg-amber-950/20' : ''}`}>
                      <td className="p-4 font-mono text-zinc-400">#{entry.rank}</td>
                      <td className="p-4 font-bold text-slate-200">{entry.heroName}</td>
                      <td className="p-4 text-center font-mono text-amber-500">{entry.rating}</td>
                      <td className="p-4 text-right text-zinc-400">
                        <span className="text-green-500">{entry.wins}W</span> - <span className="text-red-500">{entry.losses}L</span>
                      </td>
                    </tr>
                  ))}
                  {leaderboard.entries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500 italic">
                        No gladiators found in this league yet. Be the first!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        onSelectOpponent={(id) => {
          setIsChallengeOpen(false);
          setSelectedOpponentId(id);
        }}
      />

      {selectedOpponentId && (
        <div className="fixed inset-0 z-50">
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

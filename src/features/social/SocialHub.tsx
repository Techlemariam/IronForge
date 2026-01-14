"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getLeaderboard,
  getSocialFeed,
  getFactionStatsAction,
} from "@/actions/social/core";
import { FeedCard } from "@/features/social/components/FeedCard";
import { Users, Swords, X } from "lucide-react";
import { toast } from "sonner";
import { LeaderboardEntry } from "@/features/leaderboard/types";
import { LeaderboardHub } from "@/features/leaderboard/components/LeaderboardHub";

interface SocialHubProps {
  onClose: () => void;
  currentUserId?: string;
}

export const SocialHub: React.FC<SocialHubProps> = ({
  onClose,
  currentUserId,
}) => {
  const [view, setView] = useState<"FEED" | "LEADERBOARD" | "ARENA">("FEED");
  const [feed, setFeed] = useState<any[]>([]);

  // Leaderboard Data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [factionStats, setFactionStats] = useState({
    alliance: { members: 0, totalXp: 0 },
    horde: { members: 0, totalXp: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (view === "FEED") {
          const data = await getSocialFeed();
          setFeed(data);
        } else if (view === "LEADERBOARD") {
          // Parallel fetch for leaderboard and stats
          const [lbData, statsData] = await Promise.all([
            getLeaderboard(),
            getFactionStatsAction(),
          ]);

          setLeaderboard(lbData);
          if (statsData.success && statsData.data) {
            setFactionStats(statsData.data);
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to connect to the Iron Network.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [view]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in font-sans text-zinc-100">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white">
              Social Hub
            </h2>
            <p className="text-xs text-zinc-500 font-mono">
              CONNECTED TO IRON NETWORK
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setView("FEED")}
          className={`flex-1 py-4 text-center font-bold uppercase text-sm border-b-2 transition-all ${view === "FEED" ? "border-indigo-500 text-indigo-400 bg-indigo-900/10" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setView("LEADERBOARD")}
          className={`flex-1 py-4 text-center font-bold uppercase text-sm border-b-2 transition-all ${view === "LEADERBOARD" ? "border-yellow-500 text-yellow-400 bg-yellow-900/10" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          Leaderboards
        </button>
        <button
          onClick={() => setView("ARENA")}
          className={`flex-1 py-4 text-center font-bold uppercase text-sm border-b-2 transition-all ${view === "ARENA" ? "border-red-500 text-red-500 bg-red-900/10" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          PvP Arena
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {view === "FEED" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activity yet. Follow more Titans!</p>
                </div>
              ) : (
                feed.map((item, i) => <FeedCard key={i} item={item} />)
              )}
            </div>
          )}

          {view === "LEADERBOARD" && (
            <LeaderboardHub
              pvpPlayers={leaderboard}
              factionPlayers={leaderboard} // Assuming same for now, or filter by XP
              factionStats={factionStats}
              currentUserId={currentUserId}
            />
          )}

          {view === "ARENA" && (
            <div className="text-center py-20 text-zinc-500 max-w-2xl mx-auto">
              <Swords className="w-16 h-16 mx-auto mb-4 text-red-900" />
              <h3 className="text-xl text-red-500 font-bold mb-2">
                Arena Under Construction
              </h3>
              <p>The architects are still building the dueling grounds.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

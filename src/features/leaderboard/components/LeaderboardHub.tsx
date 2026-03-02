"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Globe, MapPin, Swords, Users, Trophy } from "lucide-react";
import { LeaderboardEntry, LeaderboardScope } from "@/features/leaderboard/types";
import { LeaderboardPlayerCard } from "./LeaderboardPlayerCard";

interface FactionStats {
    members: number;
    totalXp: number;
}

interface LeaderboardHubProps {
    pvpPlayers: LeaderboardEntry[];
    factionPlayers: LeaderboardEntry[];
    factionStats: {
        alliance: FactionStats;
        horde: FactionStats;
    };
    currentUserId?: string;
    currentCity?: string;
    initialScope?: LeaderboardScope;
    initialTab?: "PVP" | "FACTION" | "FRIENDS";
}

export const LeaderboardHub: React.FC<LeaderboardHubProps> = ({
    pvpPlayers,
    factionPlayers,
    factionStats,
    currentUserId,
    currentCity,
    initialScope = "GLOBAL",
    initialTab = "PVP",
}) => {
    const [activeTab, setActiveTab] = useState<"PVP" | "FACTION" | "FRIENDS">(initialTab);
    const [scope, setScope] = useState<LeaderboardScope>(initialScope);

    const totalXp = (factionStats?.alliance?.totalXp || 0) + (factionStats?.horde?.totalXp || 0);
    const alliancePercentage = totalXp > 0 ? ((factionStats?.alliance?.totalXp || 0) / totalXp) * 100 : 50;
    const hordePercentage = 100 - alliancePercentage;

    const currentPlayers = activeTab === "PVP" ? pvpPlayers : factionPlayers;

    return (
        <div className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/50 p-4 border-b border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-heading text-[#ffd700] uppercase tracking-widest flex items-center gap-2">
                        <Crown className="w-6 h-6" /> {activeTab === "PVP" ? "Champions of the Arena" : "Iron Network Rankings"}
                    </h3>
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-tighter">Season 1: The Awakening</div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4" role="tablist" aria-label="Leaderboard categories">
                    <button
                        onClick={() => setActiveTab("PVP")}
                        role="tab"
                        aria-selected={activeTab === "PVP"}
                        className={`flex-1 px-4 py-3 rounded font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "PVP"
                            ? "bg-[#ffd700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                            : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-700"
                            }`}
                    >
                        <Swords className="w-4 h-4 inline mr-2" /> PvP
                    </button>
                    <button
                        onClick={() => setActiveTab("FACTION")}
                        role="tab"
                        aria-selected={activeTab === "FACTION"}
                        className={`flex-1 px-4 py-3 rounded font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "FACTION"
                            ? "bg-[#ffd700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                            : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-700"
                            }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" /> Faction
                    </button>
                    <button
                        disabled
                        className="flex-1 px-4 py-3 rounded font-bold text-xs uppercase tracking-widest bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
                    >
                        <Trophy className="w-4 h-4" /> Friends
                        <span className="text-[8px] bg-zinc-800 px-1 rounded">Soon</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest" role="group" aria-label="Leaderboard scope filter">
                    <button
                        onClick={() => setScope("GLOBAL")}
                        className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${scope === "GLOBAL"
                            ? "bg-magma text-black border-magma"
                            : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                            }`}
                    >
                        <Globe className="w-3 h-3" /> Global
                    </button>
                    {currentCity && (
                        <button
                            onClick={() => setScope("CITY")}
                            className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${scope === "CITY"
                                ? "bg-magma text-black border-magma"
                                : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                                }`}
                        >
                            <MapPin className="w-3 h-3" /> {currentCity}
                        </button>
                    )}
                </div>
            </div>

            {/* Faction War Banner (only in Faction tab) */}
            {activeTab === "FACTION" && factionStats && (
                <div className="p-4 bg-black/50 border-b border-zinc-800">
                    <div className="relative h-20 bg-black/50 rounded-lg overflow-hidden border border-white/10 flex">
                        {/* Alliance Bar */}
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${alliancePercentage}%` }}
                            className="h-full bg-gradient-to-r from-blue-900 to-blue-600 relative flex items-center pl-6"
                        >
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-black italic text-white leading-none">ALLIANCE</h3>
                                <p className="font-mono text-[10px] opacity-70">
                                    {factionStats.alliance.totalXp.toLocaleString()} XP
                                </p>
                            </div>
                        </motion.div>

                        {/* Horde Bar */}
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${hordePercentage}%` }}
                            className="h-full bg-gradient-to-l from-red-900 to-red-600 relative flex items-center justify-end pr-6"
                        >
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                            <div className="relative z-10 text-right">
                                <h3 className="text-xl font-black italic text-white leading-none">HORDE</h3>
                                <p className="font-mono text-[10px] opacity-70">
                                    {factionStats.horde.totalXp.toLocaleString()} XP
                                </p>
                            </div>
                        </motion.div>

                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 rounded-full border-2 border-zinc-800 flex items-center justify-center font-black text-white italic z-20 shadow-xl">
                            VS
                        </div>
                    </div>
                </div>
            )}

            {/* Player List */}
            <div className="divide-y divide-zinc-900 max-h-[500px] overflow-y-auto custom-scrollbar">
                {currentPlayers.length > 0 ? (
                    currentPlayers.map((player, index) => (
                        <LeaderboardPlayerCard
                            key={player.userId}
                            player={player}
                            rank={index + 1}
                            currentUserId={currentUserId}
                            showPvpStats={activeTab === "PVP"}
                            showFactionStats={activeTab === "FACTION"}
                        />
                    ))
                ) : (
                    <div className="p-16 text-center text-zinc-600 italic">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        No champions have risen yet. Be the first.
                    </div>
                )}
            </div>
        </div>
    );
};

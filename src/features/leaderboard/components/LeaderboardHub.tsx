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

    const totalXp = factionStats.alliance.totalXp + factionStats.horde.totalXp;
    const alliancePercentage = totalXp > 0 ? (factionStats.alliance.totalXp / totalXp) * 100 : 50;
    const hordePercentage = 100 - alliancePercentage;

    const currentPlayers = activeTab === "PVP" ? pvpPlayers : factionPlayers;

    return (
        <div className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-zinc-900/50 p-4 border-b border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-heading text-[#ffd700] uppercase tracking-widest flex items-center gap-2">
                        <Crown className="w-6 h-6" /> Leaderboards
                    </h3>
                    <div className="text-xs font-mono text-zinc-500 uppercase">Season 1</div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4" role="tablist" aria-label="Leaderboard categories">
                    <button
                        onClick={() => setActiveTab("PVP")}
                        role="tab"
                        aria-selected={activeTab === "PVP"}
                        aria-label="View PvP leaderboard"
                        className={`flex-1 px-4 py-2 rounded font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === "PVP"
                            ? "bg-[#ffd700] text-black"
                            : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-700"
                            }`}
                    >
                        <Swords className="w-4 h-4" /> PvP
                    </button>
                    <button
                        onClick={() => setActiveTab("FACTION")}
                        role="tab"
                        aria-selected={activeTab === "FACTION"}
                        aria-label="View Faction leaderboard"
                        className={`flex-1 px-4 py-2 rounded font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === "FACTION"
                            ? "bg-[#ffd700] text-black"
                            : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-700"
                            }`}
                    >
                        <Users className="w-4 h-4" /> Faction
                    </button>
                    <button
                        onClick={() => setActiveTab("FRIENDS")}
                        disabled
                        role="tab"
                        aria-selected={activeTab === "FRIENDS"}
                        aria-label="View Friends leaderboard - Coming soon"
                        className="flex-1 px-4 py-2 rounded font-bold text-sm uppercase tracking-wider bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Trophy className="w-4 h-4" /> Friends
                        <span className="text-[8px] bg-zinc-800 px-1 rounded">Soon</span>
                    </button>
                </div>

                {/* Filters (only for PVP) */}
                {activeTab === "PVP" && (
                    <div className="flex gap-2 text-xs font-bold uppercase tracking-wider" role="group" aria-label="Leaderboard scope filter">
                        <button
                            onClick={() => setScope("GLOBAL")}
                            aria-pressed={scope === "GLOBAL"}
                            aria-label="Filter by global rankings"
                            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1 ${scope === "GLOBAL"
                                ? "bg-[#ffd700] text-black border-[#ffd700]"
                                : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                                }`}
                        >
                            <Globe className="w-3 h-3" /> Global
                        </button>
                        {currentCity && (
                            <button
                                onClick={() => setScope("CITY")}
                                aria-pressed={scope === "CITY"}
                                aria-label={`Filter by ${currentCity} rankings`}
                                className={`px-3 py-1 rounded border transition-colors flex items-center gap-1 ${scope === "CITY"
                                    ? "bg-[#ffd700] text-black border-[#ffd700]"
                                    : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                                    }`}
                            >
                                <MapPin className="w-3 h-3" /> {currentCity}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Faction War Banner (only in Faction tab) */}
            {activeTab === "FACTION" && (
                <div className="p-4 bg-black/50 border-b border-zinc-800">
                    <div className="relative h-24 bg-black/50 rounded-full overflow-hidden border-2 border-white/10 flex">
                        {/* Alliance Bar */}
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${alliancePercentage}%` }}
                            className="h-full bg-gradient-to-r from-blue-900 to-blue-600 relative flex items-center pl-8"
                        >
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black italic text-white drop-shadow-lg">ALLIANCE</h3>
                                <p className="font-mono text-xs opacity-80">
                                    {factionStats.alliance.totalXp.toLocaleString()} XP
                                </p>
                            </div>
                        </motion.div>

                        {/* Horde Bar */}
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${hordePercentage}%` }}
                            className="h-full bg-gradient-to-l from-red-900 to-red-600 relative flex items-center justify-end pr-8"
                        >
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                            <div className="relative z-10 text-right">
                                <h3 className="text-2xl font-black italic text-white drop-shadow-lg">HORDE</h3>
                                <p className="font-mono text-xs opacity-80">
                                    {factionStats.horde.totalXp.toLocaleString()} XP
                                </p>
                            </div>
                        </motion.div>

                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900 rounded-full border-4 border-zinc-800 flex items-center justify-center font-black text-white italic z-20">
                            VS
                        </div>
                    </div>
                </div>
            )}

            {/* Player List */}
            <div className="divide-y divide-zinc-900 max-h-[600px] overflow-y-auto">
                {currentPlayers.map((player, index) => (
                    <LeaderboardPlayerCard
                        key={player.userId}
                        player={player}
                        rank={index + 1}
                        currentUserId={currentUserId}
                        showPvpStats={activeTab === "PVP"}
                        showFactionStats={activeTab === "FACTION"}
                    />
                ))}
            </div>

            {currentPlayers.length === 0 && (
                <div className="p-12 text-center text-zinc-600 italic">
                    No champions have risen yet. Be the first.
                </div>
            )}
        </div>
    );
};

import React from "react";
import { Shield, Trophy, Swords, Skull, MapPin, Zap } from "lucide-react";
import { LeaderboardEntry } from "@/features/leaderboard/types";
import { getPvpRank, getRankTitle } from "@/lib/pvpRanks";

interface LeaderboardPlayerCardProps {
    player: LeaderboardEntry;
    rank: number;
    currentUserId?: string;
    showPvpStats?: boolean;
    showFactionStats?: boolean;
    showPowerRating?: boolean;
}

export const LeaderboardPlayerCard: React.FC<LeaderboardPlayerCardProps> = ({
    player,
    rank,
    currentUserId,
    showPvpStats = false,
    showFactionStats = false,
    showPowerRating = false,
}) => {
    const isMe = player.userId === currentUserId;
    const rankColor =
        rank === 1
            ? "text-yellow-400"
            : rank === 2
                ? "text-zinc-300"
                : rank === 3
                    ? "text-amber-600"
                    : "text-zinc-600";

    const pvpRank = showPvpStats ? getPvpRank(player.rankScore || 0) : null;
    const rankTitle = showPvpStats
        ? getRankTitle(player.rankScore || 0, player.faction || "HORDE")
        : null;

    return (
        <div
            className={`flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors ${isMe ? "bg-blue-900/10 border-l-2 border-blue-500" : ""
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`text-2xl font-black italic ${rankColor} w-8 text-center`}>
                    {rank}
                </div>

                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-bold text-lg ${isMe ? "text-blue-400" : "text-zinc-200"}`}>
                            {player.heroName || "Unknown Warrior"}
                        </h4>
                        <span className="bg-zinc-800 text-zinc-500 text-[10px] px-1 rounded border border-zinc-700">
                            Lvl {player.level}
                        </span>

                        {/* Power Rating Badge (New) */}
                        {(showPowerRating || player.powerRating !== undefined) && (
                            <span className="bg-purple-900/30 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-900/50 uppercase tracking-widest font-black flex items-center gap-1">
                                <Zap className="w-3 h-3" /> {player.powerRating || 0}
                            </span>
                        )}

                        {/* Faction Badge */}
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-black ${player.faction === "ALLIANCE"
                                ? "bg-blue-900/30 text-blue-400 border-blue-900/50"
                                : "bg-red-900/30 text-red-400 border-red-900/50"
                                }`}
                        >
                            {player.faction}
                        </span>

                        {/* PvP Rank (if enabled) */}
                        {showPvpStats && pvpRank && rankTitle && (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-black flex items-center gap-1 ${player.faction === "ALLIANCE"
                                    ? "bg-blue-900/30 text-blue-400 border-blue-900/50"
                                    : "bg-red-900/30 text-red-400 border-red-900/50"
                                    }`}
                            >
                                <Shield className="w-3 h-3" />
                                <span className="text-zinc-500">R{pvpRank.rank}</span>
                                {rankTitle}
                            </span>
                        )}

                        {/* Title */}
                        {player.title && (
                            <span className="bg-amber-900/30 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-900/50 uppercase tracking-widest font-black flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> {player.title}
                            </span>
                        )}

                        {/* Guild */}
                        {player.guildName && (
                            <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                                &lt;{player.guildName}&gt;
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mt-1">
                        {showPvpStats && (
                            <>
                                <span className="flex items-center gap-1">
                                    <Swords className="w-3 h-3" /> {player.wins || 0} Wins
                                </span>
                                <span className="flex items-center gap-1">
                                    <Skull className="w-3 h-3" /> Wilks: {(player.highestWilksScore || 0).toFixed(2)}
                                </span>
                            </>
                        )}
                        {showFactionStats && (
                            <span className="flex items-center gap-1">
                                {player.totalExperience?.toLocaleString() || 0} XP
                            </span>
                        )}
                        {player.city && (
                            <span className="flex items-center gap-1 text-zinc-600">
                                <MapPin className="w-3 h-3" /> {player.city}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-right">
                {showPvpStats && (
                    <>
                        <div className="text-2xl font-black text-white tracking-tighter">
                            {player.rankScore || 0}
                        </div>
                        <div className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">
                            Rating
                        </div>
                    </>
                )}
                {showFactionStats && (
                    <div className="text-lg font-bold text-white">
                        {player.totalExperience?.toLocaleString() || 0}
                    </div>
                )}
                {showPowerRating && (
                    <div className="text-lg font-bold text-purple-400">
                        {player.powerRating || 0}
                    </div>
                )}
            </div>
        </div>
    );
};

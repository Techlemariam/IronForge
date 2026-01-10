import React from "react";
import { LeaderboardEntry } from "@/actions/social/leaderboards";
import { Trophy } from "lucide-react";
import Link from "next/link";

interface StrengthLeaderboardPanelProps {
    entries: LeaderboardEntry[];
}

export const StrengthLeaderboardPanel: React.FC<StrengthLeaderboardPanelProps> = ({ entries }) => {
    return (
        <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Strength League
                </h3>
                <Link
                    href="/social/leaderboards"
                    className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-wider font-bold"
                >
                    View All
                </Link>
            </div>

            <div className="space-y-2">
                {entries.length === 0 ? (
                    <div className="text-zinc-500 text-sm text-center py-4">
                        No Titans ranked yet.
                        <br />
                        Be the first.
                    </div>
                ) : (
                    entries.map((entry, idx) => (
                        <div
                            key={entry.userId}
                            className="flex items-center gap-3 p-2 rounded bg-black/20 border border-white/5"
                        >
                            {/* Rank */}
                            <div className={`
                w-6 text-center font-mono font-bold text-sm
                ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-zinc-300" : idx === 2 ? "text-amber-700" : "text-zinc-600"}
              `}>
                                {idx + 1}
                            </div>

                            {/* Avatar Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-xs font-bold text-zinc-400">
                                    {entry.heroName.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                    {entry.heroName}
                                </div>
                            </div>

                            {/* Value (Strength Index) */}
                            <div className="text-right">
                                <div className="text-sm font-mono font-bold text-magma">
                                    {entry.value.toFixed(1)}
                                </div>
                                <div className="text-[10px] text-zinc-600 uppercase">
                                    Wilks
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

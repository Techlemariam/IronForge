import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, Swords } from 'lucide-react';
import { LeaderboardEntry } from '@/features/leaderboard/types';

interface FactionStats {
    members: number;
    totalXp: number;
}

interface FactionLeaderboardProps {
    stats: {
        alliance: FactionStats;
        horde: FactionStats;
    };
    leaderboard: LeaderboardEntry[];
    currentUserId?: string;
}

export const FactionLeaderboard: React.FC<FactionLeaderboardProps> = ({ stats, leaderboard, currentUserId }) => {
    const [view, setView] = useState<'GLOBAL' | 'FACTION'>('GLOBAL');

    const totalXp = stats.alliance.totalXp + stats.horde.totalXp;
    const alliancePercentage = totalXp > 0 ? (stats.alliance.totalXp / totalXp) * 100 : 50;
    const hordePercentage = 100 - alliancePercentage;

    return (
        <div className="space-y-8 p-4 md:p-6 bg-forge-900 min-h-[50vh] text-white rounded-xl border border-white/5">
            {/* Header: The War */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-widest text-magma">Faction War</h2>
                <div className="flex items-center justify-center gap-2 text-forge-muted text-sm">
                    <Swords className="w-4 h-4" />
                    <span>Season 1: The Awakening</span>
                </div>
            </div>

            {/* Faction Scoreboard */}
            <div className="relative h-24 bg-black/50 rounded-full overflow-hidden border-2 border-white/10 flex">
                {/* Alliance Bar */}
                <motion.div
                    initial={{ width: '50%' }}
                    animate={{ width: `${alliancePercentage}%` }}
                    className="h-full bg-linear-to-r from-blue-900 to-blue-600 relative flex items-center pl-8"
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black italic text-white drop-shadow-lg">ALLIANCE</h3>
                        <p className="font-mono text-xs opacity-80">{stats.alliance.totalXp.toLocaleString()} XP</p>
                    </div>
                </motion.div>

                {/* Horde Bar */}
                <motion.div
                    initial={{ width: '50%' }}
                    animate={{ width: `${hordePercentage}%` }}
                    className="h-full bg-linear-to-l from-red-900 to-red-600 relative flex items-center justify-end pr-8"
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                    <div className="relative z-10 text-right">
                        <h3 className="text-2xl font-black italic text-white drop-shadow-lg">HORDE</h3>
                        <p className="font-mono text-xs opacity-80">{stats.horde.totalXp.toLocaleString()} XP</p>
                    </div>
                </motion.div>

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900 rounded-full border-4 border-zinc-800 flex items-center justify-center font-black text-white italic z-20">
                    VS
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Champions
                    </h3>
                    <div className="flex bg-black/50 rounded p-1">
                        <button
                            onClick={() => setView('GLOBAL')}
                            className={`px-4 py-1 rounded text-xs font-bold transition-colors ${view === 'GLOBAL' ? 'bg-magma text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            GLOBAL
                        </button>
                        {/* More filters later */}
                    </div>
                </div>

                <div className="space-y-2">
                    {leaderboard.map((entry, idx) => (
                        <div
                            key={entry.userId}
                            className={`flex items-center gap-4 p-3 rounded border transition-colors ${entry.userId === currentUserId ? 'bg-magma/10 border-magma/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                        >
                            <span className={`font-mono font-bold w-6 text-center ${idx < 3 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                                #{idx + 1}
                            </span>

                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs ring-1 ring-white/10">
                                {entry.level}
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-bold text-sm ${entry.userId === currentUserId ? 'text-magma' : 'text-white'}`}>
                                    {entry.heroName}
                                </h4>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{entry.title || 'Novice'}</p>
                            </div>

                            <div className="text-right">
                                <div className={`text-xs font-bold px-2 py-0.5 rounded ${entry.faction === 'ALLIANCE' ? 'text-blue-400 bg-blue-900/20' : 'text-red-400 bg-red-900/20'}`}>
                                    {entry.faction}
                                </div>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                                    {entry.totalExperience.toLocaleString()} XP
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { Crown, Swords, Skull, Globe, MapPin, Trophy, Shield } from 'lucide-react';
import { getPvpRank, getRankTitle } from '@/lib/pvpRanks';
import Link from 'next/link';

import { LeaderboardEntry, LeaderboardScope } from '@/features/leaderboard/types';

interface LeaderboardProps {
    players: LeaderboardEntry[];
    currentUserId?: string;
    scope: LeaderboardScope;
    currentCity?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentUserId, scope, currentCity }) => {
    return (
        <div className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-heading text-[#ffd700] uppercase tracking-widest flex items-center gap-2">
                        <Crown className="w-6 h-6" /> Champions of the Arena
                    </h3>
                    <div className="text-xs font-mono text-zinc-500 uppercase">Season 1</div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
                    <Link
                        href="/colosseum?scope=GLOBAL"
                        className={`px-3 py-1 rounded border transition-colors ${scope === 'GLOBAL' ? 'bg-[#ffd700] text-black border-[#ffd700]' : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}
                    >
                        <Globe className="w-3 h-3 inline mr-1" /> Global
                    </Link>
                    {currentCity && (
                        <Link
                            href={`/colosseum?scope=CITY&city=${currentCity}`}
                            className={`px-3 py-1 rounded border transition-colors ${scope === 'CITY' ? 'bg-[#ffd700] text-black border-[#ffd700]' : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}
                        >
                            <MapPin className="w-3 h-3 inline mr-1" /> {currentCity}
                        </Link>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-zinc-900 max-h-[600px] overflow-y-auto">
                {players.map((player, index) => {
                    const isMe = player.userId === currentUserId;
                    const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-600';
                    const pvpRank = getPvpRank(player.rankScore);
                    const rankTitle = getRankTitle(player.rankScore, player.faction || 'HORDE');

                    return (
                        <div key={player.userId} className={`flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors ${isMe ? 'bg-blue-900/10 border-l-2 border-blue-500' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`text-2xl font-black italic ${rankColor} w-8 text-center`}>
                                    {index + 1}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold text-lg ${isMe ? 'text-blue-400' : 'text-zinc-200'}`}>
                                            {player.heroName || 'Unknown Gladiator'}
                                        </h4>
                                        <span className="bg-zinc-800 text-zinc-500 text-[10px] px-1 rounded border border-zinc-700">Lvl {player.level}</span>
                                        {/* PvP Rank Title */}
                                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-black flex items-center gap-1 ${player.faction === 'ALLIANCE'
                                            ? 'bg-blue-900/30 text-blue-400 border-blue-900/50'
                                            : 'bg-red-900/30 text-red-400 border-red-900/50'
                                            }`}>
                                            <Shield className="w-3 h-3" />
                                            <span className="text-zinc-500">R{pvpRank.rank}</span>
                                            {rankTitle}
                                        </span>
                                        {player.title && (
                                            <span className="bg-amber-900/30 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-900/50 uppercase tracking-widest font-black flex items-center gap-1">
                                                <Trophy className="w-3 h-3" /> {player.title}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                                        <span className="flex items-center gap-1"><Swords className="w-3 h-3" /> {player.wins} Wins</span>
                                        <span className="flex items-center gap-1"><Skull className="w-3 h-3" /> Wilks: {player.highestWilksScore.toFixed(2)}</span>
                                        {player.city && (
                                            <span className="flex items-center gap-1 text-zinc-600"><MapPin className="w-3 h-3" /> {player.city}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-black text-white tracking-tighter">
                                    {player.rankScore}
                                </div>
                                <div className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">
                                    Rating
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {players.length === 0 && (
                <div className="p-12 text-center text-zinc-600 italic">
                    No champions have risen yet. Be the first.
                </div>
            )}
        </div>
    );
};

export default Leaderboard;

import React from 'react';
import { Crown, Swords, Shield, Skull } from 'lucide-react';

interface PvPPlayer {
    userId: string;
    heroName: string;
    rankScore: number;
    highestWilksScore: number;
    wins: number;
    level: number;
}

interface LeaderboardProps {
    players: PvPPlayer[];
    currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentUserId }) => {
    return (
        <div className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-heading text-[#ffd700] uppercase tracking-widest flex items-center gap-2">
                    <Crown className="w-6 h-6" /> Champions of the Arena
                </h3>
                <div className="text-xs font-mono text-zinc-500 uppercase">Season 1</div>
            </div>

            {/* List */}
            <div className="divide-y divide-zinc-900">
                {players.map((player, index) => {
                    const isMe = player.userId === currentUserId;
                    const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-600';

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
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                                        <span className="flex items-center gap-1"><Swords className="w-3 h-3" /> {player.wins} Wins</span>
                                        <span className="flex items-center gap-1"><Skull className="w-3 h-3" /> Wilks: {player.highestWilksScore.toFixed(2)}</span>
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

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard, getSocialFeed } from '@/actions/social';
import { FeedCard } from '@/components/social/FeedCard';
import { Users, Trophy, Swords, Crown, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

interface SocialHubProps {
    onClose: () => void;
}

export const SocialHub: React.FC<SocialHubProps> = ({ onClose }) => {
    const [view, setView] = useState<'FEED' | 'LEADERBOARD' | 'ARENA'>('FEED');
    const [feed, setFeed] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (view === 'FEED') {
                    const data = await getSocialFeed();
                    setFeed(data);
                } else if (view === 'LEADERBOARD') {
                    const data = await getLeaderboard();
                    setLeaderboard(data);
                }
            } catch (e) {
                toast.error("Failed to connect to the network.");
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
                        <h2 className="text-xl font-black uppercase tracking-widest text-white">Social Hub</h2>
                        <p className="text-xs text-zinc-500 font-mono">CONNECTED TO IRON NETWORK</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Nav */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setView('FEED')}
                    className={`flex-1 py-4 text-center font-bold uppercase text-sm border-b-2 transition-all ${view === 'FEED' ? 'border-indigo-500 text-indigo-400 bg-indigo-900/10' : 'border-transparent text-zinc-500 hover:text-white'}`}
                >
                    Activity Feed
                </button>
                <button
                    onClick={() => setView('LEADERBOARD')}
                    className={`flex-1 py-4 text-center font-bold uppercase text-sm border-b-2 transition-all ${view === 'LEADERBOARD' ? 'border-yellow-500 text-yellow-400 bg-yellow-900/10' : 'border-transparent text-zinc-500 hover:text-white'}`}
                >
                    Leaderboards
                </button>
                <button
                    onClick={() => setView('ARENA')}
                    className={`flex-1 py-4 text-center font-bold uppercase text-sm border-b-2 transition-all ${view === 'ARENA' ? 'border-red-500 text-red-500 bg-red-900/10' : 'border-transparent text-zinc-500 hover:text-white'}`}
                >
                    PvP Arena
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto space-y-4"
                    >
                        {view === 'FEED' && (
                            <div className="space-y-4">
                                {feed.length === 0 ? (
                                    <div className="text-center py-20 text-zinc-500">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No activity yet. Follow more Titans!</p>
                                    </div>
                                ) : (
                                    feed.map((item, i) => <FeedCard key={i} item={item} />)
                                )}
                            </div>
                        )}

                        {view === 'LEADERBOARD' && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                {leaderboard.map((user, idx) => (
                                    <div key={user.id} className="flex items-center p-4 border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <div className="w-8 font-mono text-zinc-500">{idx + 1}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{user.heroName || "Anonymous"}</span>
                                                {user.activeTitle && (
                                                    <span className="text-[10px] px-1.5 rounded border border-yellow-800 text-yellow-600 bg-yellow-900/20">{user.activeTitle.name}</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-zinc-500">Level {user.level} Titan</div>
                                        </div>
                                        <div className="font-mono text-indigo-400 font-bold">
                                            {user.totalExperience.toLocaleString()} XP
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {view === 'ARENA' && (
                            <div className="text-center py-20 text-zinc-500">
                                <Swords className="w-16 h-16 mx-auto mb-4 text-red-900" />
                                <h3 className="text-xl text-red-500 font-bold mb-2">Arena Under Construction</h3>
                                <p>The architects are still building the dueling grounds.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

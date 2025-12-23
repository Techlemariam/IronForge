
import React, { useState, useEffect } from 'react';
import { GrimoireEntry, GrimoireEntryType, Rarity } from '../../types';
import { StorageService } from '../../services/storage';
import { ACHIEVEMENTS } from '../../data/static';
import { Book, History, Trophy, TrendingUp, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface GrimoireProps {
    onClose: () => void;
}

export const Grimoire: React.FC<GrimoireProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<GrimoireEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch persistent entries
                let grimoireEntries = await StorageService.getGrimoireEntries();

                // 2. Backfill if empty but we have achievements (Migration Logic)
                if (grimoireEntries.length === 0) {
                    const unlockedAchievementIds = await StorageService.getState<string[]>('achievements') || [];
                    const history = await StorageService.getHistory();

                    const newEntries: GrimoireEntry[] = [];

                    // Backfill Achievements
                    unlockedAchievementIds.forEach((id) => {
                        const ach = ACHIEVEMENTS.find(a => a.id === id);
                        if (ach) {
                            newEntries.push({
                                id: `grimoire_ach_${id}`,
                                date: new Date().toISOString(), // Fallback for legacy
                                type: 'ACHIEVEMENT',
                                title: ach.title,
                                description: ach.description,
                                rarity: 'epic',
                            });
                        }
                    });

                    // Backfill PRs
                    history.filter(log => log.isEpic).forEach((log, idx) => {
                        newEntries.push({
                            id: `grimoire_pr_${idx}`,
                            date: log.date,
                            type: 'PR',
                            title: `New Personal Record set!`,
                            description: `Achieved an e1RM of ${log.e1rm}kg on ${log.exerciseId}.`,
                            rarity: 'rare',
                            metadata: { exerciseId: log.exerciseId, weight: log.e1rm }
                        });
                    });

                    if (newEntries.length > 0) {
                        // Batch save (await all)
                        await Promise.all(newEntries.map(e => StorageService.saveGrimoireEntry(e)));
                        grimoireEntries = newEntries;
                    }
                }

                setEntries(grimoireEntries);
            } catch (error) {
                console.error("Grimoire Load Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntries();
    }, []);

    const getTypeIcon = (type: GrimoireEntryType) => {
        switch (type) {
            case 'ACHIEVEMENT': return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 'PR': return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'LEVEL_UP': return <Sparkles className="w-5 h-5 text-cyan-400" />;
            case 'BOSS_DEFEAT': return <History className="w-5 h-5 text-red-500" />;
            default: return <Book className="w-5 h-5 text-zinc-400" />;
        }
    };

    return (
        <div className="h-full bg-[#050505] p-6 overflow-y-auto font-serif text-zinc-200">
            <div className="flex justify-between items-center mb-8 border-b border-[#222] pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-full">
                        <Book className="w-8 h-8 text-rarity-legendary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">The Grimoire</h1>
                        <p className="text-rarity-common text-xs italic">&quot;A chronicles of feats, failures, and far-reaching potential.&quot;</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="bg-forge-800 border-2 border-forge-border px-4 py-2 rounded font-bold uppercase text-xs hover:bg-forge-700 transition-colors"
                >
                    Close Archives
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
                    <History className="w-16 h-16 mb-4 opacity-10" />
                    <p className="uppercase tracking-widest font-black text-sm">The pages are blank...</p>
                    <p className="text-xs italic mt-2">Go forth and forge your legend.</p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-[#0f0f12] border border-zinc-800/50 hover:border-zinc-700 rounded-lg p-5 flex gap-5 transition-all group cursor-default"
                        >
                            {/* Date Column */}
                            <div className="shrink-0 flex flex-col items-center justify-center w-16 border-r border-zinc-900 pr-5">
                                <span className="text-[10px] uppercase font-bold text-zinc-600">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                <span className="text-xl font-black text-zinc-300">{new Date(entry.date).getDate()}</span>
                                <span className="text-[10px] text-zinc-600">{new Date(entry.date).getFullYear()}</span>
                            </div>

                            {/* Icon Column */}
                            <div className="shrink-0 pt-1">
                                <div className="p-2 bg-black rounded-full border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                                    {getTypeIcon(entry.type)}
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-rarity-legendary transition-colors">
                                        {entry.title}
                                    </h3>
                                    <span className="text-[9px] font-black uppercase text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                        {entry.type}
                                    </span>
                                </div>
                                <p className="text-sm text-rarity-common leading-relaxed italic">
                                    &quot;{entry.description}&quot;
                                </p>

                                {entry.metadata && (
                                    <div className="mt-3 flex gap-4 text-[10px] font-mono text-zinc-500">
                                        {Object.entries(entry.metadata).map(([key, val]) => (
                                            <span key={key} className="flex items-center gap-1">
                                                <span className="text-zinc-700">{key.toUpperCase()}:</span>
                                                <span className="text-rarity-legendary">{val}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Arrow */}
                            <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-5 h-5 text-zinc-700" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Footer */}
            <div className="mt-12 flex justify-center pb-8">
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
                    <span className="p-1 cursor-default opacity-50">Older Records</span>
                    <div className="w-12 h-px bg-zinc-900"></div>
                    <span className="p-1 cursor-default opacity-50">Newer Records</span>
                </div>
            </div>
        </div>
    );
};

export default Grimoire;

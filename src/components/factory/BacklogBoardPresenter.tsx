'use client';

import React from 'react';
import { ClipboardList, AlertCircle, Play, Loader2, CheckCircle2 } from 'lucide-react';

export interface BacklogItem {
    id: string;
    source: 'ROADMAP' | 'DEBT';
    title: string;
}

interface BacklogBoardPresenterProps {
    items: BacklogItem[];
    loading: boolean;
    processingId: string | null;
    onStartTask: (item: BacklogItem) => Promise<void>;
}

export function BacklogBoardPresenter({
    items,
    loading,
    processingId,
    onStartTask
}: BacklogBoardPresenterProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 border border-slate-800 rounded-2xl bg-slate-900/20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider">Enterprise Backlog</h2>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                    SOURCE: ROADMAP & DEBT
                </span>
            </div>

            <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm italic">All items in production or cleared.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="group relative flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 cursor-default"
                        >
                            <div className="flex items-center gap-4 flex-1 mr-4">
                                <div className={`p-2 rounded-lg ${item.source === 'ROADMAP' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                    {item.source === 'ROADMAP' ? <ClipboardList className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-200 line-clamp-1">{item.title}</p>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase">{item.source}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => onStartTask(item)}
                                disabled={!!processingId}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 transition-all duration-200 disabled:opacity-50"
                            >
                                {processingId === item.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                )}
                                <span className="text-xs font-bold uppercase tracking-tight">Kör</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

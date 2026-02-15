'use client';

import React from 'react';
import { ShieldAlert, Zap, TrendingUp, DollarSign, Power, Loader2, AlertTriangle, BrainCircuit } from 'lucide-react';
import { ModelQuota } from '@/services/game/FactoryService';
import { QuotaGauges } from './QuotaGauges';

export interface FactoryStats {
    totalTokensToday: number;
    costSekToday: number;
    activeTasks: number;
    pvsScore: number;
    factoryMode: 'ON' | 'OFF';
    quotas: ModelQuota[];
}

interface CommandCenterPresenterProps {
    stats: FactoryStats | null;
    loading: boolean;
    isEmergencyStop: boolean;
    onToggleEmergencyStop: () => void;
}

export function CommandCenterPresenter({
    stats,
    loading,
    isEmergencyStop,
    onToggleEmergencyStop
}: CommandCenterPresenterProps) {
    if (loading || !stats) {
        return (
            <div className="h-32 flex items-center justify-center border border-slate-800 rounded-2xl bg-slate-900/40">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Daily Consumption */}
                <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Load</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white font-mono">
                            {(stats.totalTokensToday / 1000).toFixed(1)}k <span className="text-slate-500 text-sm">TK</span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span>{stats.costSekToday} SEK (Est.)</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-transparent w-full opacity-30" />
                </div>

                {/* Active Production */}
                <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md group hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Assembly</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white font-mono">
                            {stats.activeTasks} <span className="text-slate-500 text-sm">TASKS</span>
                        </h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Operative Mode: Level 4
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-transparent w-full opacity-30" />
                </div>

                {/* Strategic Yield (PVS) */}
                <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md group hover:border-violet-500/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Factory Yield</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white font-mono">
                            {stats.pvsScore}% <span className="text-slate-500 text-sm">PVS</span>
                        </h3>
                        <div className="text-xs text-violet-400 font-bold uppercase tracking-tighter">
                            Passive Viability Target: 95%
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-transparent w-full opacity-30" />
                </div>

                {/* Emergency Protocols */}
                <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 ${isEmergencyStop ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-900/40'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onToggleEmergencyStop}
                            aria-label={isEmergencyStop ? 'Resume Factory Line' : 'Emergency Stop'}
                            className={`p-2 rounded-lg transition-all duration-300 ${isEmergencyStop ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-red-400'}`}
                        >
                            <Power className="w-5 h-5" />
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isEmergencyStop ? 'text-red-400' : 'text-slate-500'}`}>
                            {isEmergencyStop ? 'Line Frozen' : 'System Guard'}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className={`text-2xl font-black font-mono ${isEmergencyStop ? 'text-red-500' : 'text-white'}`}>
                            {isEmergencyStop ? 'STOPPED' : 'ACTIVE'}
                        </h3>
                        <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                            {isEmergencyStop && <AlertTriangle className="w-3 h-3 text-red-500" />}
                            {isEmergencyStop ? 'Manual Intervention Required' : 'Factory Mode: Orchestration'}
                        </div>
                    </div>
                    {isEmergencyStop && (
                        <div className="absolute top-0 right-0 p-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 opacity-50" />
                        </div>
                    )}
                </div>
            </div>

            {/* Quota Section (Intelligence Distribution) */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                            <BrainCircuit className="w-6 h-6 text-cyan-400" />
                            Intelligence Quota Dashboard
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Real-time GPU allocation & Token consumption monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
                            REFRESH: 60s
                        </div>
                    </div>
                </div>

                <QuotaGauges quotas={stats.quotas} />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 group-hover:bg-cyan-500/10 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
            </div>
        </div>
    );
}

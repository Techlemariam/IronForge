"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TrainingContext } from "@/services/data/TrainingContextService";
import { Activity, Battery, Brain, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { JargonTooltip } from "@/components/ui/JargonTooltip";

interface BioStatusWidgetProps {
    context: TrainingContext;
}

export default function BioStatusWidget({ context }: BioStatusWidgetProps) {
    const { readiness, cnsFatigue, volume, warnings } = context;

    // Redesigned Color Map for Cyber-Physical
    const readinessColor = {
        HIGH: "text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        MODERATE: "text-teal-400 border-teal-500/50",
        LOW: "text-amber-500 border-amber-500/50",
        RECOVERY_NEEDED: "text-red-500 border-red-500/50 animate-pulse",
    }[readiness];

    const cnsColor = {
        LOW: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
        MODERATE: "bg-teal-500",
        HIGH: "bg-amber-600",
        CRITICAL: "bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
    }[cnsFatigue];

    const muscles = Object.values(volume);
    const globalLoad = muscles.reduce((acc, m) => acc + m.weeklySets, 0);
    const globalMrv = muscles.reduce((acc, m) => acc + m.mrv, 0);
    const capacityPct = globalMrv > 0 ? Math.min(100, (globalLoad / globalMrv) * 100) : 0;

    return (
        <div className="mechanical-panel p-5 space-y-5 group overflow-hidden">
            {/* Background Texture Intercept */}
            <div className="absolute inset-0 carbon-fiber opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />

            <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-emerald-400 text-glow-emerald" />
                    <h3 className="text-sm font-mono tracking-widest text-slate-400 uppercase">
                        Life-Support: <span className="text-slate-100">Status</span>
                    </h3>
                </div>
                <div className={cn("text-[10px] font-mono px-2 py-0.5 border bg-black/40 tracking-tighter", readinessColor)}>
                    {readiness.replace("_", " ")}
                </div>
            </div>

            {/* Neural Load Index */}
            <div className="relative space-y-2 z-10">
                <div className="flex justify-between items-end">
                    <span className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                        <Brain className="h-3.5 w-3.5 text-teal-400" />
                        <JargonTooltip term="CNS">Neural Load Index</JargonTooltip>
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-900 px-1.5 border border-slate-800">
                        {cnsFatigue}
                    </span>
                </div>
                <div className="h-3 w-full bg-slate-950 border border-slate-800 p-[1px]">
                    <div
                        className={cn("h-full transition-all duration-1000 ease-out", cnsColor)}
                        style={{ width: cnsFatigue === 'LOW' ? '25%' : cnsFatigue === 'MODERATE' ? '50%' : cnsFatigue === 'HIGH' ? '75%' : '100%' }}
                    />
                </div>
            </div>

            {/* System Capacity */}
            <div className="relative space-y-2 z-10">
                <div className="flex justify-between items-end">
                    <span className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                        <Battery className="h-3.5 w-3.5 text-emerald-400" />
                        <JargonTooltip term="MRV">System Capacity</JargonTooltip>
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                        {globalLoad} <span className="text-slate-600">/</span> {globalMrv} <span className="text-slate-600">SETS</span>
                    </span>
                </div>
                <div className="relative h-6 w-full bg-slate-950 border border-slate-800 overflow-hidden">
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-grid-titan opacity-20 pointer-events-none" />

                    <div
                        className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-out border-r border-white/20",
                            capacityPct > 100 ? "bg-red-950/60" : capacityPct > 80 ? "bg-amber-500/40" : "bg-emerald-500/30"
                        )}
                        style={{ width: `${capacityPct}%` }}
                    />

                    {/* The "Ghost" Warning */}
                    {globalMrv < 150 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[8px] font-mono text-orange-500/50 animate-pulse tracking-[0.2em]">CONSTRAINT ACTIVE</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Integrity Threats */}
            {warnings.length > 0 && (
                <div className="relative pt-4 border-t border-slate-800 z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                        <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                            Integrity Threats
                        </p>
                    </div>
                    <ul className="space-y-1.5">
                        {warnings.slice(0, 3).map((w, i) => (
                            <li key={i} className="flex gap-2 text-[9px] font-mono text-slate-500 leading-tight">
                                <span className="text-red-500">[{i + 1}]</span>
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}


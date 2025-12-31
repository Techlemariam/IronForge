"use client";

import React from "react";
import ForgeCard from "@/components/ui/ForgeCard";
import { TrainingContext } from "@/services/data/TrainingContextService";
import { Activity, Battery, Brain, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface BioStatusWidgetProps {
    context: TrainingContext;
}

export default function BioStatusWidget({ context }: BioStatusWidgetProps) {
    const { readiness, cnsFatigue, volume, warnings } = context;

    // Readiness Color Map
    const readinessColor = {
        HIGH: "text-green-400",
        MODERATE: "text-amber-400",
        LOW: "text-orange-500",
        RECOVERY_NEEDED: "text-red-500 animate-pulse",
    }[readiness];

    // CNS Color Map
    const cnsColor = {
        LOW: "bg-green-500",
        MODERATE: "bg-amber-500",
        HIGH: "bg-orange-600",
        CRITICAL: "bg-red-600",
    }[cnsFatigue];

    // Calculate aggregated volume load for the "Ghost Bars"
    // We want to show "Global Load" vs "Global Capacity"
    const muscles = Object.values(volume);
    const globalLoad = muscles.reduce((acc, m) => acc + m.weeklySets, 0);
    const globalMrv = muscles.reduce((acc, m) => acc + m.mrv, 0);
    const capacityPct = globalMrv > 0 ? Math.min(100, (globalLoad / globalMrv) * 100) : 0;

    return (
        <ForgeCard className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    Bio-Status
                </h3>
                <span className={cn("text-xs font-mono px-2 py-1 rounded bg-zinc-900 border", readinessColor, "border-current")}>
                    {readiness.replace("_", " ")}
                </span>
            </div>

            {/* Neural Load Index (The Heat Gauge) */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> Neural Load</span>
                    <span>{cnsFatigue}</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-500", cnsColor)}
                        style={{ width: cnsFatigue === 'LOW' ? '25%' : cnsFatigue === 'MODERATE' ? '50%' : cnsFatigue === 'HIGH' ? '75%' : '100%' }}
                    />
                </div>
            </div>

            {/* MRV Capacity (The Silent Killer Visualizer) */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Battery className="h-3 w-3" /> System Capacity</span>
                    <span>{globalLoad} / {globalMrv} Sets</span>
                </div>
                <div className="relative h-4 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                    {/* The Load Bar */}
                    <div
                        className={cn("absolute top-0 left-0 h-full transition-all duration-500",
                            capacityPct > 100 ? "bg-red-600" : capacityPct > 80 ? "bg-amber-500" : "bg-blue-500"
                        )}
                        style={{ width: `${capacityPct}%` }}
                    />
                </div>
                {globalMrv < 150 && ( // Heuristic: If global MRV is surprisingly low
                    <p className="text-[10px] text-orange-400 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Capacity reduced by Bio-Constraint
                    </p>
                )}
            </div>

            {/* Critical Warnings */}
            {warnings.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/50">
                    <p className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Integrity Threats
                    </p>
                    <ul className="space-y-1">
                        {warnings.slice(0, 3).map((w, i) => ( // Show max 3 warnings
                            <li key={i} className="text-[10px] text-zinc-400 leading-tight">
                                • {w}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </ForgeCard>
    );
}

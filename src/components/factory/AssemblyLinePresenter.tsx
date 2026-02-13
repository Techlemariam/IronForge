"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Palette,
    Code2,
    ShieldCheck,
    Rocket,
    ArrowRight
} from "lucide-react";
import { AssemblyLineTask } from "@/services/game/FactoryService";
import { AssemblyLineCard } from "./AssemblyLineCard";

interface AssemblyLinePresenterProps {
    tasks: AssemblyLineTask[];
}

const STAGES = [
    { id: "DESIGN", label: "Design Studio", icon: Palette, color: "text-pink-400", bg: "bg-pink-500/10" },
    { id: "FABRICATION", label: "Fabrication", icon: Code2, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "VERIFICATION", label: "Quality Control", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "SHIPPING", label: "Distribution", icon: Rocket, color: "text-orange-400", bg: "bg-orange-500/10" },
] as const;

export const AssemblyLinePresenter: React.FC<AssemblyLinePresenterProps> = ({ tasks }) => {
    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-4 min-w-[800px]">
                {STAGES.map((stage, index) => {
                    const stageTasks = tasks.filter(t => t.stage === stage.id);

                    return (
                        <div key={stage.id} className="flex-1 flex gap-4 items-start">
                            <div className="flex-1 space-y-4">
                                {/* Stage Header */}
                                <div className={`flex items-center gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-md`}>
                                    <div className={`p-2 rounded-lg ${stage.bg}`}>
                                        <stage.icon className={`w-4 h-4 ${stage.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-tight">{stage.label}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {stageTasks.length} Active Unit{stageTasks.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Task Container */}
                                <div className="min-h-[200px] p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {stageTasks.map((task) => (
                                            <AssemblyLineCard key={task.id} task={task} />
                                        ))}
                                    </AnimatePresence>

                                    {stageTasks.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center pt-10 pb-10 opacity-20 group">
                                            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
                                                <stage.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Station Idle</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Connector */}
                            {index < STAGES.length - 1 && (
                                <div className="flex items-center pt-8">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-px h-10 bg-gradient-to-b from-slate-800 to-transparent" />
                                        <ArrowRight className="w-4 h-4 text-slate-700" />
                                        <div className="w-px h-10 bg-gradient-to-t from-slate-800 to-transparent" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

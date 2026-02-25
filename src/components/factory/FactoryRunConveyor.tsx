"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layout,
    Code2,
    ShieldCheck,
    Rocket,
    Zap,
    Cpu,
    Activity
} from "lucide-react";
import { AssemblyLineTask } from "@/services/game/FactoryService";

interface FactoryRunConveyorProps {
    activeRun: AssemblyLineTask | null;
}

const STAGES = [
    { id: "DESIGN", label: "Spec Planning", icon: Layout, color: "text-pink-400", bg: "bg-pink-500/10", glow: "shadow-pink-500/20" },
    { id: "FABRICATION", label: "Fabrication", icon: Code2, color: "text-blue-400", bg: "bg-blue-500/10", glow: "shadow-blue-500/20" },
    { id: "VERIFICATION", label: "Quality Control", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20" },
    { id: "SHIPPING", label: "Distribution", icon: Rocket, color: "text-orange-400", bg: "bg-orange-500/10", glow: "shadow-orange-500/20" },
] as const;

export const FactoryRunConveyor: React.FC<FactoryRunConveyorProps> = ({ activeRun }) => {
    const activeStageIndex = useMemo(() => {
        if (!activeRun) return -1;
        return STAGES.findIndex(s => s.id === activeRun.stage);
    }, [activeRun]);

    return (
        <div className="relative w-full p-8 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-50" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">
                            Feature Assembly Line
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Processing Run:
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-400">
                                {activeRun ? `#${activeRun.id.substring(0, 8)}` : "STANDBY"}
                            </span>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {activeRun && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">
                                Active Unit Engaged: {activeRun.description.substring(0, 30)}...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Conveyor Belt Path (SVG) */}
            <div className="relative h-32 flex items-center justify-between px-4">
                <svg className="absolute inset-0 w-full h-full -z-0 pointer-events-none overflow-visible">
                    <defs>
                        <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 50 64 H 950"
                        fill="none"
                        stroke="url(#powerGradient)"
                        strokeWidth="2"
                        strokeDasharray="8 12"
                        className="opacity-20 animate-[dash_20s_linear_infinite]"
                    />
                </svg>

                {STAGES.map((stage, idx) => {
                    const isActive = activeStageIndex === idx;
                    const isCompleted = activeStageIndex > idx;
                    const _isUpcoming = activeStageIndex < idx && activeStageIndex !== -1;

                    return (
                        <div key={stage.id} className="relative z-10 flex flex-col items-center gap-4 flex-1">
                            {/* Connector Line */}
                            {idx > 0 && (
                                <div className={`absolute right-1/2 top-8 w-full h-[1px] -z-10 transition-colors duration-700 ${isCompleted ? "bg-emerald-500/50" : "bg-slate-800"
                                    }`} />
                            )}

                            {/* Station Node */}
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    borderColor: isActive ? "rgba(99, 102, 241, 0.5)" : "rgba(30, 41, 59, 0.5)",
                                }}
                                className={`relative w-16 h-16 rounded-2xl border bg-slate-900 flex items-center justify-center transition-all duration-500 ${isActive ? `${stage.glow} border-indigo-500/50 ring-4 ring-indigo-500/5` : ""
                                    } ${isCompleted ? "border-emerald-500/30" : "border-slate-800"}`}
                            >
                                <stage.icon className={`w-7 h-7 transition-colors duration-500 ${isActive ? stage.color : isCompleted ? "text-emerald-500/50" : "text-slate-600"
                                    }`} />

                                {/* Active Pulse */}
                                {isActive && (
                                    <>
                                        <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 animate-pulse" />
                                        <div className="absolute -bottom-1 -right-1">
                                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                                        </div>
                                    </>
                                )}
                            </motion.div>

                            {/* Label */}
                            <div className="text-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? "text-white" : "text-slate-500"
                                    }`}>
                                    {stage.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[8px] font-mono text-indigo-400 uppercase font-bold"
                                    >
                                        Processing...
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats/Agent Info */}
            <div className="relative z-10 mt-10 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Throughput</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-mono text-white">94.2%</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Agent</span>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-indigo-400" />
                            <span className="text-xs font-bold text-slate-300">
                                {activeRun ? (activeStageIndex === 0 ? "Analyst" : activeStageIndex === 1 ? "Coder" : "QA") : "IDLE"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 h-3 rounded-full transition-colors duration-700 ${activeRun ? "bg-indigo-500/50" : "bg-slate-800"
                                }`}
                            style={{ opacity: 0.2 + (i * 0.2), animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -1000;
                    }
                }
            `}</style>
        </div>
    );
};

// Internal icon for throughput
function TrendingUp({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

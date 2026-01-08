"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shield, Swords, Zap, Activity } from "lucide-react";

interface TvHudProps {
    heartRate?: number;
    questTitle?: string;
    questProgress?: number;
    bossHp?: number;
    bossMaxHp?: number;
    bossName?: string;
    playerName?: string;
    playerHp?: number;
    playerMaxHp?: number;
}

export const TvHud: React.FC<TvHudProps> = ({
    heartRate = 0,
    questTitle,
    questProgress = 0,
    bossHp,
    bossMaxHp = 100,
    bossName = "Colossal Boss",
    playerName = "Titan",
    playerHp = 100,
    playerMaxHp = 100,
}) => {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 font-mono">
            {/* Top Left: Player Stats (Compacted) */}
            <div
                role="status"
                aria-label="Player Status"
                className="absolute top-12 left-12 flex items-center gap-4 bg-black/60 backdrop-blur-xl border-2 border-white/10 p-4 rounded-2xl shadow-2xl"
            >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-400/50">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                    <div className="text-white/60 text-xl uppercase tracking-widest">Titan</div>
                    <div className="text-4xl font-black text-white">{playerName}</div>
                    <div className="w-64 h-4 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6 ml-8">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                    >
                        <Heart className="w-12 h-12 text-red-500 fill-current" />
                    </motion.div>
                    <div>
                        <div className="text-6xl font-black text-white leading-none">
                            {heartRate > 0 ? heartRate : "--"}
                        </div>
                        <div className="text-white/40 text-sm uppercase tracking-widest mt-1">BPM / V-Sync</div>
                    </div>
                </div>
            </div>

            {/* Top Right: Quest Progress */}
            <AnimatePresence>
                {questTitle && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        role="status"
                        aria-label="Quest Progress"
                        className="absolute top-12 right-12 text-right"
                    >
                        <div className="bg-black/60 backdrop-blur-xl border-2 border-warrior/20 p-4 rounded-2xl shadow-2xl">
                            <div className="flex items-center justify-end gap-3 mb-2">
                                <span className="text-warrior text-xl uppercase tracking-tighter font-bold">Active Quest</span>
                                <Swords className="w-6 h-6 text-warrior" />
                            </div>
                            <div className="text-4xl font-black text-white mb-4 uppercase">{questTitle}</div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 w-80 h-3 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${questProgress}%` }}
                                        className="h-full bg-warrior shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                                    />
                                </div>
                                <div className="text-2xl font-bold text-warrior">{Math.round(questProgress)}%</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Center: Boss HP (Visible only during combat) */}
            <AnimatePresence>
                {bossHp !== undefined && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        role="status"
                        aria-label="Boss Status"
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-12"
                    >
                        <div className="bg-black/80 backdrop-blur-xl border-2 border-red-500/30 p-8 rounded-3xl shadow-[0_-20px_50px_rgba(255,0,0,0.1)]">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="text-red-500 text-xl uppercase tracking-widest font-black mb-1 flex items-center gap-2">
                                        <Activity className="w-5 h-5" /> Threat Level: Critical
                                    </div>
                                    <div className="text-5xl font-black text-white tracking-tight uppercase italic">{bossName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-6xl font-black text-white tabular-nums">
                                        {Math.round((bossHp / bossMaxHp) * 100)}%
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-6 bg-red-950/50 rounded-full border-2 border-red-500/20 overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-400"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:40px_40px] animate-[slide_2s_linear_infinite]" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle Scanlines overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
        </div>
    );
};

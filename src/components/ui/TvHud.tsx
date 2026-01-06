
import { GarminWellnessData } from "@/services/bio/GarminService";

interface GarminStartData { // Simplified interface to avoid circular dependency if needed, or import
    bodyBattery: number;
    stressLevel: number;
    restingHeartRate?: number;
}

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shield, Swords, Zap, Activity } from "lucide-react";
import { GarminWidget } from "@/features/bio/components/GarminWidget";

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
    garminData?: GarminWellnessData;
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
    garminData,
}) => {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 font-mono">
            {/* Top Left: Player Stats (Compacted) */}
            <div className="absolute top-12 left-12 flex items-center gap-4 bg-black/60 backdrop-blur-xl border-2 border-white/10 p-4 rounded-2xl shadow-2xl">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <Shield className="w-7 h-7 text-white" />
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-black text-white lowercase tracking-tight">{playerName}</div>
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                            <span className="text-lg font-mono font-bold text-white tabular-nums leading-none">{heartRate > 0 ? heartRate : "--"}</span>
                        </div>
                    </div>

                    <div className="w-48 h-2 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        />
                    </div>
                </div>
            </div>

            {/* Top Right: Quest Progress (Compacted) */}
            <AnimatePresence>
                {questTitle && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-12 right-12 text-right"
                    >
                        <div className="bg-black/60 backdrop-blur-xl border-2 border-warrior/20 p-4 rounded-2xl shadow-2xl">
                            <div className="text-2xl font-black text-white mb-2 uppercase tracking-wide text-right">{questTitle}</div>
                            <div className="flex items-center justify-end gap-3">
                                <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${questProgress}%` }}
                                        className="h-full bg-warrior shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                                    />
                                </div>
                                <div className="text-xl font-bold text-warrior tabular-nums">{Math.round(questProgress)}%</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Center: Garmin Data */}
            {garminData && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2">
                    <GarminWidget data={garminData} variant="compact" />
                </div>
            )}

            {/* Bottom Center: Boss HP (Visible only during combat) */}
            <AnimatePresence>
                {bossHp !== undefined && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
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

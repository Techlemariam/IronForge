"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trophy, Skull, Footprints, Zap } from "lucide-react";
import { ChaseState, ChaseDifficulty } from "@/types/chase";
import { ChaseEngine } from "@/services/game/ChaseEngine";
import { cn } from "@/lib/utils";

interface ChaseOverlayProps {
    chaseState: ChaseState;
    difficulty: ChaseDifficulty;
    currentPaceKph: number;
    onCaughtConfirm: () => void;
    onEscapedConfirm: () => void;
}

/**
 * ChaseOverlay - Visual HUD for chase mode
 *
 * Shows:
 * - Distance gap progress bar
 * - Monster approaching indicator
 * - Status messages
 * - Victory/defeat states
 */
export function ChaseOverlay({
    chaseState,
    difficulty,
    currentPaceKph,
    onCaughtConfirm,
    onEscapedConfirm,
}: ChaseOverlayProps) {
    const dangerLevel = ChaseEngine.getDangerLevel(chaseState);
    const statusMessage = ChaseEngine.getStatusMessage(chaseState);
    const requiredPace = ChaseEngine.getRequiredPace(chaseState, difficulty);

    // Color based on danger level
    const dangerColor = useMemo(() => {
        if (dangerLevel < 0.3) return "from-green-500 to-green-600";
        if (dangerLevel < 0.6) return "from-yellow-500 to-orange-500";
        if (dangerLevel < 0.85) return "from-orange-500 to-red-500";
        return "from-red-600 to-red-800";
    }, [dangerLevel]);

    const bgPulse = dangerLevel > 0.7 && !chaseState.isCaught && !chaseState.hasEscaped;

    // Gap percentage for progress bar (0-100)
    const gapPercentage = Math.max(
        0,
        Math.min(100, (chaseState.distanceGapMeters / chaseState.escapeDistanceMeters) * 100)
    );

    return (
        <div
            className={cn(
                "absolute inset-x-0 top-0 z-50 pointer-events-none",
                bgPulse && "animate-pulse"
            )}
        >
            {/* Main Chase HUD */}
            <div className="pointer-events-auto mx-auto mt-4 max-w-2xl px-4">
                <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-2xl">
                    {/* Header: Monster Info */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{chaseState.chaser.image}</span>
                            <div>
                                <h3 className="font-bold text-white text-lg">
                                    {chaseState.chaser.name}
                                </h3>
                                <p className="text-xs text-zinc-400 uppercase tracking-wider">
                                    {chaseState.chaser.type} • Lvl {chaseState.chaser.level}
                                </p>
                            </div>
                        </div>

                        {/* Required Pace Indicator */}
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase">Required Pace</p>
                            <p className="font-mono text-lg font-bold text-cyan-400">
                                {requiredPace.toFixed(1)} km/h
                            </p>
                        </div>
                    </div>

                    {/* Status Message */}
                    <motion.div
                        key={statusMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "text-center py-2 mb-3 rounded-lg font-bold uppercase tracking-wider text-sm",
                            dangerLevel > 0.85
                                ? "bg-red-900/50 text-red-300"
                                : dangerLevel > 0.6
                                    ? "bg-orange-900/50 text-orange-300"
                                    : "bg-zinc-800/50 text-zinc-300"
                        )}
                    >
                        {statusMessage}
                    </motion.div>

                    {/* Distance Gap Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                                <Skull className="w-3 h-3" />
                                CAUGHT
                            </span>
                            <span className="font-mono text-white">
                                {Math.round(chaseState.distanceGapMeters)}m gap
                            </span>
                            <span className="flex items-center gap-1">
                                ESCAPE
                                <Trophy className="w-3 h-3" />
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                            {/* Danger zone indicator */}
                            <div className="absolute inset-y-0 left-0 w-[15%] bg-red-900/30" />

                            {/* Safe zone indicator */}
                            <div className="absolute inset-y-0 right-0 w-[15%] bg-green-900/30" />

                            {/* Player position indicator */}
                            <motion.div
                                className={cn(
                                    "h-full bg-gradient-to-r transition-all duration-300",
                                    dangerColor
                                )}
                                style={{ width: `${gapPercentage}%` }}
                                animate={{ width: `${gapPercentage}%` }}
                                transition={{ type: "spring", stiffness: 100 }}
                            />

                            {/* Player icon */}
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 text-lg"
                                style={{ left: `${Math.min(95, Math.max(2, gapPercentage))}%` }}
                                animate={{ left: `${Math.min(95, Math.max(2, gapPercentage))}%` }}
                            >
                                <Footprints className="w-4 h-4 text-white drop-shadow-lg" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Current Pace Display */}
                    <div className="mt-3 flex justify-center gap-6 text-center">
                        <div>
                            <p className="text-xs text-zinc-500">Your Pace</p>
                            <p
                                className={cn(
                                    "font-mono text-xl font-bold",
                                    currentPaceKph >= requiredPace ? "text-green-400" : "text-red-400"
                                )}
                            >
                                {currentPaceKph.toFixed(1)} km/h
                            </p>
                        </div>
                        <div className="border-l border-zinc-800 pl-6">
                            <p className="text-xs text-zinc-500">Time</p>
                            <p className="font-mono text-xl font-bold text-white">
                                {Math.floor(chaseState.elapsedSeconds / 60)}:
                                {String(Math.floor(chaseState.elapsedSeconds % 60)).padStart(2, "0")}
                            </p>
                        </div>
                        <div className="border-l border-zinc-800 pl-6">
                            <p className="text-xs text-zinc-500">Distance</p>
                            <p className="font-mono text-xl font-bold text-cyan-400">
                                {(chaseState.playerDistanceMeters / 1000).toFixed(2)} km
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Victory/Defeat Overlays */}
            <AnimatePresence>
                {chaseState.hasEscaped && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-green-900/80 backdrop-blur-sm flex items-center justify-center z-[100] pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center p-8"
                        >
                            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold text-white mb-2">ESCAPED!</h2>
                            <p className="text-xl text-green-200 mb-6">
                                You outran {chaseState.chaser.name}!
                            </p>
                            <button
                                onClick={onEscapedConfirm}
                                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
                            >
                                Claim Rewards
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {chaseState.isCaught && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center z-[100] pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center p-8"
                        >
                            <div className="text-6xl mb-4">{chaseState.chaser.image}</div>
                            <h2 className="text-4xl font-bold text-white mb-2">CAUGHT!</h2>
                            <p className="text-xl text-red-200 mb-6">
                                {chaseState.chaser.name} has caught up!
                            </p>
                            <button
                                onClick={onCaughtConfirm}
                                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                                <Zap className="w-5 h-5" />
                                Fight Back!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

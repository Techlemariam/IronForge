"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { AlertTriangle, Trophy, Skull, Footprints, Zap, HeartPulse } from "lucide-react";
import { ChaseState, ChaseDifficulty } from "@/types/chase";
import { ChaseEngine } from "@/services/game/ChaseEngine";
import { cn } from "@/lib/utils";
import { playSound } from "@/utils/root_utils";

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

    // Heartbeat Effect
    React.useEffect(() => {
        if (dangerLevel > 0.8 && !chaseState.isCaught && !chaseState.hasEscaped) {
            const interval = setInterval(() => {
                playSound("heartbeat");
            }, 1000 * (1 - dangerLevel * 0.5)); // Faster heartbeat as danger increases
            return () => clearInterval(interval);
        }
    }, [dangerLevel, chaseState.isCaught, chaseState.hasEscaped]);

    // Gap percentage for progress bar (0-100)
    const gapPercentage = Math.max(
        0,
        Math.min(100, (chaseState.distanceGapMeters / chaseState.escapeDistanceMeters) * 100)
    );

    const paceDelta = currentPaceKph - requiredPace;

    // Screen Shake Animation Control
    const shakeControls = useAnimation();

    React.useEffect(() => {
        if (dangerLevel > 0.8) {
            shakeControls.start({
                x: [0, -5, 5, -5, 5, 0],
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
            });
        } else {
            shakeControls.stop();
            shakeControls.set({ x: 0 });
        }
    }, [dangerLevel, shakeControls]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">

            {/* 1. Dynamic Vignette (Red/Black gradient on edges) */}
            <div
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(circle, transparent 50%, rgba(0,0,0,${dangerLevel * 0.8}) 90%, rgba(${dangerLevel > 0.8 ? '100,0,0' : '0,0,0'}, ${dangerLevel * 0.6}) 100%)`,
                    opacity: 0.8 + (dangerLevel * 0.2)
                }}
            />

            {/* 2. Looming Monster Background Presence */}
            <motion.div
                animate={{
                    scale: 1 + (dangerLevel * 0.5),
                    opacity: 0.1 + (dangerLevel * 0.2),
                    y: (1 - dangerLevel) * 100
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            >
                <div className="text-[40vh] filter blur-sm transform transition-all duration-1000 select-none opacity-20">
                    {chaseState.chaser.image}
                </div>
            </motion.div>

            {/* 3. Main HUD Layer (with Screen Shake) */}
            <motion.div
                animate={shakeControls}
                className={cn(
                    "relative w-full h-full flex flex-col pt-4",
                    bgPulse && "animate-pulse" // Keep pulse on container if critically low
                )}
            >
                <div className="pointer-events-auto mx-auto max-w-2xl px-4 w-full">
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
                                <p className="text-xs text-zinc-400 uppercase">Required Pace</p>
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

                            {/* Styled Progress Track */}
                            <div className="h-6 bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800 relative shadow-inner">
                                {/* Danger zone indicator (Gradient) */}
                                <div className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-red-900/60 to-transparent" />

                                {/* Track Ticks */}
                                <div className="absolute inset-0 flex justify-between px-2 items-center opacity-20">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="w-px h-2 bg-white" />
                                    ))}
                                </div>

                                {/* Monster Position (Left Side / 0%) */}
                                <motion.div
                                    className="absolute left-1 top-1/2 -translate-y-1/2 text-lg z-10 filter drop-shadow-md"
                                    animate={{
                                        scale: dangerLevel > 0.8 ? [1, 1.2, 1] : 1,
                                        rotate: dangerLevel > 0.8 ? [0, -10, 10, 0] : 0
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }} // Breathing effect
                                >
                                    {chaseState.chaser.image}
                                </motion.div>

                                {/* Player Position Indicator - Moves Right -> Left as gap shrinks */}
                                {/* Wait, gap percentage: 100% = Safe, 0% = Caught. 
                                Visual logic: 
                                - Monster is at LEFT (0%). 
                                - Player is at RIGHT (100%) if safe?
                                - Usually: Distance Gap. 
                                Let's visualize: 
                                |[M]---------[P]-------| 
                                If gap shrinks, P moves closer to M.
                                Gap % = (CurrentGap / EscapeGap) * 100.
                                100% gap = Max distance (Start).
                                0% gap = Caught.
                                
                                So: 
                                Player should be at `GapPercentage` from Left? 
                                If Gap=100%, Player at 100% (Right).
                                If Gap=0%, Player at 0% (Left/Caught).
                            */}

                                <motion.div
                                    className="absolute top-0 bottom-0 bg-white/10"
                                    style={{
                                        left: 0,
                                        right: `${100 - gapPercentage}%`
                                        // This fills the space BETWEEN Monster (0) and Player (gap%)
                                        // Giving visual context to the "Gap"
                                    }}
                                />

                                {/* Player Icon */}
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                                    style={{ left: `${Math.min(96, Math.max(4, gapPercentage))}%` }}
                                    animate={{ left: `${Math.min(96, Math.max(4, gapPercentage))}%` }}
                                >
                                    <div className="relative">
                                        <Footprints className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500/50 blur-sm rounded-full" />
                                    </div>
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
                                <p className={cn("text-xs font-mono", paceDelta >= 0 ? "text-green-500" : "text-red-500")}>
                                    {paceDelta >= 0 ? "+" : ""}{paceDelta.toFixed(1)}
                                </p>
                            </div>
                            <div className="border-l border-zinc-700 pl-6">
                                <p className="text-xs text-zinc-400">Time</p>
                                <p className="font-mono text-xl font-bold text-white">
                                    {Math.floor(chaseState.elapsedSeconds / 60)}:
                                    {String(Math.floor(chaseState.elapsedSeconds % 60)).padStart(2, "0")}
                                </p>
                            </div>
                            <div className="border-l border-zinc-700 pl-6">
                                <p className="text-xs text-zinc-400">Distance</p>
                                <p className="font-mono text-xl font-bold text-cyan-400">
                                    {(chaseState.playerDistanceMeters / 1000).toFixed(2)} km
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Danger Overlay Flash (When damaged/caught imminent) */}
            <div className={cn(
                "absolute inset-0 z-40 bg-red-500/0 transition-all duration-300 pointer-events-none mix-blend-overlay",
                dangerLevel > 0.9 && "animate-pulse bg-red-500/20"
            )} />

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

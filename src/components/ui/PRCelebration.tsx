// src/components/ui/PRCelebration.tsx
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import { fireConfetti, playSound } from "@/utils";

interface PRCelebrationProps {
    isVisible: boolean;
    newReps: number;
    previousReps: number | null;
    exerciseName?: string;
    onClose: () => void;
}

/**
 * Full-screen celebration overlay when a new rep PR is achieved.
 * Auto-dismisses after 3 seconds.
 */
export const PRCelebration: React.FC<PRCelebrationProps> = ({
    isVisible,
    newReps,
    previousReps,
    exerciseName,
    onClose,
}) => {
    useEffect(() => {
        if (isVisible) {
            // Fire celebration effects
            fireConfetti();
            playSound("loot_epic");

            // Auto-dismiss after 3 seconds
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const delta = previousReps !== null ? newReps - previousReps : null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="text-center p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Trophy Icon */}
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="relative mb-6"
                        >
                            <Trophy className="w-24 h-24 text-gold mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                            <Sparkles className="w-8 h-8 text-gold/80 absolute -top-2 -right-2 animate-pulse" />
                            <Sparkles className="w-6 h-6 text-gold/80 absolute -bottom-1 -left-1 animate-pulse" />
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight"
                        >
                            🎉 NEW PR! 🎉
                        </motion.h1>

                        {/* Exercise Name */}
                        {exerciseName && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-steel text-lg mb-4 uppercase tracking-widest"
                            >
                                {exerciseName}
                            </motion.p>
                        )}

                        {/* New Record */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-7xl md:text-8xl font-black text-gold mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        >
                            {newReps}
                        </motion.div>

                        {/* Delta */}
                        {delta !== null && delta > 0 && (
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-venom"
                            >
                                +{delta} reps!
                            </motion.div>
                        )}

                        {/* XP Bonus teaser */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex items-center justify-center gap-4 text-sm text-steel"
                        >
                            <span className="bg-gold/10 text-gold px-3 py-1 rounded-full border border-gold/20">
                                +50 XP
                            </span>
                            <span className="bg-warp/10 text-warp px-3 py-1 rounded-full border border-warp/20">
                                🏆 Achievement
                            </span>
                        </motion.div>

                        {/* Tap to dismiss hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1 }}
                            className="text-xs text-zinc-600 mt-8"
                        >
                            Tap anywhere to dismiss
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PRCelebration;

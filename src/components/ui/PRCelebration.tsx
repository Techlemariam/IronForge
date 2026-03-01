
// src/components/ui/PRCelebration.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Video, CheckCircle, AlertTriangle } from "lucide-react";
import { fireConfetti, playSound } from "@/utils";
import { getISOWeek } from 'date-fns';
import { Button } from "./button";

interface PRCelebrationProps {
    isVisible: boolean;
    newReps: number;
    previousReps: number | null;
    exerciseName?: string;
    username: string; // Added to pass to video API
    onClose: () => void;
}

type VideoState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Full-screen celebration overlay when a new rep PR is achieved.
 * Now includes a button to generate a Remotion video of the achievement.
 */
export const PRCelebration: React.FC<PRCelebrationProps> = ({
    isVisible,
    newReps,
    previousReps,
    exerciseName,
    username,
    onClose,
}) => {
    const [videoState, setVideoState] = useState<VideoState>('idle');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            fireConfetti();
            playSound("loot_epic");
            setVideoState('idle'); // Reset state when modal becomes visible
            setVideoUrl(null);
        }
    }, [isVisible]);

    const handleGenerateVideo = async () => {
        setVideoState('loading');

        // Prepare props for the Remotion video
        const videoProps = {
            username: username,
            weekNumber: getISOWeek(new Date()), // Example: Get current week number
            strengthGains: newReps, // Using newReps as a proxy for strength gains
        };

        try {
            const response = await fetch('/api/factory/render-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ props: videoProps }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server rendering error.');
            }

            setVideoUrl(data.videoPath);
            setVideoState('success');

        } catch (error) {
            console.error("Video generation failed:", error);
            setVideoState('error');
        }
    };


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
                        className="text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-700 w-[90%] max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="relative mb-6" >
                            <Trophy className="w-24 h-24 text-gold mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                            <Sparkles className="w-8 h-8 text-gold/80 absolute -top-2 -right-2 animate-pulse" />
                        </motion.div>

                        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight" >
                            🎉 NEW PR! 🎉
                        </motion.h1>

                        {exerciseName && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-steel text-lg mb-4 uppercase tracking-widest" >
                                {exerciseName}
                            </motion.p>
                        )}

                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-7xl md:text-8xl font-black text-gold mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]" >
                            {newReps}
                        </motion.div>

                        {delta !== null && delta > 0 && (
                            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-bold text-venom" >
                                +{delta} reps!
                            </motion.div>
                        )}

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 space-y-4" >
                            {videoState === 'idle' && (
                                <Button onClick={handleGenerateVideo} className="w-full" size="lg">
                                    <Video className="mr-2 h-5 w-5" />
                                    Skapa video-replay
                                </Button>
                            )}
                            {videoState === 'loading' && (
                                <Button className="w-full" size="lg" disabled>
                                    <motion.div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></motion.div>
                                    Renderar video...
                                </Button>
                            )}
                            {videoState === 'success' && videoUrl && (
                                <a href={`/${videoUrl}`} target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Visa video
                                    </Button>
                                </a>
                            )}
                            {videoState === 'error' && (
                                <Button className="w-full bg-red-600 hover:bg-red-700" size="lg" onClick={handleGenerateVideo}>
                                    <AlertTriangle className="mr-2 h-5 w-5" />
                                    Försök igen
                                </Button>
                            )}
                            <Button variant="ghost" onClick={onClose} className="w-full text-slate-400">Stäng</Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};



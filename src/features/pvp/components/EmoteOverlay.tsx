'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

interface EmoteEvent {
    senderId: string;
    senderName: string;
    gifPath: string;
    emoteName: string;
}

interface EmoteOverlayProps {
    matchId: string;
    currentUserId: string;
    isMuted?: boolean;
}

export function EmoteOverlay({
    matchId,
    currentUserId,
    isMuted = false,
}: EmoteOverlayProps) {
    const [currentEmote, setCurrentEmote] = useState<EmoteEvent | null>(null);

    const showEmote = useCallback((emote: EmoteEvent) => {
        setCurrentEmote(emote);
        // Auto-dismiss after 2.5 seconds
        setTimeout(() => {
            setCurrentEmote(null);
        }, 2500);
    }, []);

    useEffect(() => {
        if (isMuted) return;

        const supabase = createClient();

        // Subscribe to emote broadcasts on this match's channel
        const channel = supabase
            .channel(`match-emotes-${matchId}`)
            .on('broadcast', { event: 'emote' }, ({ payload }) => {
                // Only show emotes from opponent
                if (payload.senderId !== currentUserId) {
                    showEmote(payload as EmoteEvent);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId, currentUserId, isMuted, showEmote]);

    return (
        <AnimatePresence>
            {currentEmote && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40"
                    />

                    {/* Emote Display */}
                    <motion.div
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        exit={{ y: -50 }}
                        className="relative z-10 flex flex-col items-center gap-4"
                    >
                        {/* Sender name */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg font-bold text-amber-400 drop-shadow-lg"
                        >
                            {currentEmote.senderName} says:
                        </motion.div>

                        {/* GIF Container */}
                        <motion.div
                            initial={{ rotate: -5 }}
                            animate={{ rotate: [null, 3, -3, 0] }}
                            transition={{ duration: 0.3, times: [0, 0.3, 0.6, 1] }}
                            className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-amber-500 shadow-2xl shadow-amber-500/30"
                        >
                            <Image
                                src={currentEmote.gifPath}
                                alt={currentEmote.emoteName}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </motion.div>

                        {/* Emote name */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm text-white/70 uppercase tracking-wider"
                        >
                            {currentEmote.emoteName}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Hook to broadcast emotes to opponent
 */
export function useBroadcastEmote(matchId: string, senderName: string) {
    const supabase = createClient();

    const broadcastEmote = useCallback(
        async (emote: { id: string; name: string; gifPath: string }, senderId: string) => {
            const channel = supabase.channel(`match-emotes-${matchId}`);

            await channel.send({
                type: 'broadcast',
                event: 'emote',
                payload: {
                    senderId,
                    senderName,
                    gifPath: emote.gifPath,
                    emoteName: emote.name,
                },
            });
        },
        [matchId, senderName, supabase]
    );

    return { broadcastEmote };
}

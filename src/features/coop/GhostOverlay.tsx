import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GhostEvent } from "@/services/coop/CoOpService";
import { Ghost, Dumbbell, Zap, FlameKindling } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostOverlayProps {
    events: GhostEvent[];
    currentUserId?: string; // Filter out own events
}

// Maximum events to display
const MAX_VISIBLE_EVENTS = 5;

/**
 * Displays real-time "Ghost" activity from Co-Op squad members.
 * Semi-transparent overlay showing set completions, PRs, etc.
 */
export const GhostOverlay: React.FC<GhostOverlayProps> = ({ events, currentUserId }) => {
    // Filter out own events and take most recent
    const visibleEvents = events
        .filter(e => e.userId !== currentUserId)
        .slice(0, MAX_VISIBLE_EVENTS);

    if (visibleEvents.length === 0) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {visibleEvents.map((event, i) => (
                    <motion.div
                        key={`${event.userId}-${event.timestamp}`}
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 0.85, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg backdrop-blur-md border shadow-lg",
                            event.type === 'PR'
                                ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/50"
                                : event.type === 'BERSERKER'
                                    ? "bg-gradient-to-r from-red-500/20 to-orange-500/10 border-red-500/50"
                                    : "bg-zinc-900/80 border-cyan-500/30"
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "p-2 rounded-full",
                            event.type === 'PR' ? "bg-yellow-500/20" :
                                event.type === 'BERSERKER' ? "bg-red-500/20" : "bg-cyan-500/20"
                        )}>
                            {event.type === 'SET_COMPLETE' && <Dumbbell className="w-4 h-4 text-cyan-400" />}
                            {event.type === 'REP' && <Zap className="w-4 h-4 text-cyan-400" />}
                            {event.type === 'PR' && <FlameKindling className="w-4 h-4 text-yellow-400" />}
                            {event.type === 'BERSERKER' && <Ghost className="w-4 h-4 text-red-400" />}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                                {event.heroName}
                            </span>
                            <span className="text-xs font-bold text-white">
                                {event.type === 'SET_COMPLETE' && `Logged ${event.reps} @ ${event.weight}kg`}
                                {event.type === 'REP' && `Rep!`}
                                {event.type === 'PR' && `🎉 NEW PR! ${event.reps} reps`}
                                {event.type === 'BERSERKER' && `BERSERKER MODE!`}
                            </span>
                        </div>

                        {/* Damage */}
                        {event.damage && (
                            <span className="text-xs font-black text-red-400 ml-2">
                                +{event.damage} DMG
                            </span>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GhostOverlay;

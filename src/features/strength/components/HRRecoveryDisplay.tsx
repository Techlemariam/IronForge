import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, ArrowDown } from "lucide-react";
import { useHRRecoveryTimer } from "@/features/strength/hooks/useHRRecoveryTimer";

export const HRRecoveryDisplay = () => {
    const { recoveryStatus, currentHR, recoveryStartHR } = useHRRecoveryTimer();

    if (recoveryStatus === "none") return null;

    const drop = recoveryStartHR ? recoveryStartHR - currentHR : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-zinc-800"
            >
                <div className="bg-red-500/20 p-2 rounded-full">
                    <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" />
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                        {recoveryStatus === "recovering" ? "Recovering..." : "Ready"}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-heading text-white">{currentHR}</span>
                        {drop > 0 && (
                            <span className="text-xs text-green-400 flex items-center">
                                <ArrowDown className="w-3 h-3" />
                                {drop}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

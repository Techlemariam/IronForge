import React from "react";
import { AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardiacDriftProps {
    driftPercentage: number;
}

export const CardiacDriftWarning: React.FC<CardiacDriftProps> = ({ driftPercentage }) => {
    if (driftPercentage < 5) return null;

    // Intensity levels
    const opacity = Math.min((driftPercentage - 5) / 10, 0.8); // 5% -> 0, 15% -> 0.8
    const pulseSpeed = driftPercentage > 10 ? "duration-1000" : "duration-2000";

    return (
        <>
            {/* Full Screen Vignette */}
            <div
                className={cn(
                    "fixed inset-0 pointer-events-none z-50 transition-opacity flex items-center justify-center",
                    pulseSpeed
                )}
                style={{ opacity }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(239,68,68,0.4)_100%)] animate-pulse" />

                {/* Diegetic Text Prompt */}
                <div className="relative z-60 text-center animate-bounce-slow">
                    <h2 className="font-heading text-3xl text-red-500 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                        The Air Grows Heavy
                    </h2>
                    <p className="text-zinc-400 text-xs font-mono mt-2 tracking-widest bg-black/50 px-2 py-1 inline-block rounded">
                        CARDIAC DRIFT DETECTED • RECOV REQUIRED
                    </p>
                </div>
            </div>

            {/* Existing Small Alert (optional, maybe keep for clarity) */}
            <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur border border-red-500/30 rounded-lg p-3 flex items-center gap-3 animate-slide-up">
                <Zap className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                    <div className="text-xs text-red-400 font-bold uppercase">System Warning</div>
                    <div className="text-[10px] text-zinc-500">Efficiency drops by {driftPercentage.toFixed(0)}%</div>
                </div>
            </div>
        </>
    );
};

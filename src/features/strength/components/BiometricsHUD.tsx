import React from 'react';
import { Heart, Timer, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useHRRecoveryTimer } from '@/features/strength/hooks/useHRRecoveryTimer';

export const BiometricsHUD = () => {
    const { timeLeft, isActive: isTimerActive } = useRestTimer();
    const { currentHR, metrics } = useHRRecoveryTimer();

    // Determine HR Color based on Zone
    const getHRColor = () => {
        if (metrics.zone >= 4) return "text-red-500";
        if (metrics.zone === 3) return "text-orange-500";
        if (metrics.zone === 2) return "text-green-500";
        return "text-blue-500";
    };

    return (
        <div className={cn(
            "fixed top-20 right-4 z-40 flex flex-col items-end gap-2 transition-all duration-500",
            (isTimerActive || currentHR > 0) ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        )}>
            {/* Main Holographic Container */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden w-48 group">
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20" />

                {/* Glossy Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-10 pointer-events-none" />

                <div className="relative z-20 space-y-4">

                    {/* HR Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Heart className={cn("w-4 h-4 animate-pulse", getHRColor())} />
                            <span className="text-xs text-zinc-400 font-bold tracking-wider">HR MON</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-white tabular-nums">
                            {currentHR} <span className="text-xs text-zinc-600 font-sans font-normal">BPM</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Rest Timer Section */}
                    <div className={cn(
                        "flex items-center justify-between transition-opacity duration-300",
                        isTimerActive ? "opacity-100" : "opacity-30 grayscale"
                    )}>
                        <div className="flex items-center gap-2">
                            <Timer className={cn("w-4 h-4", isTimerActive ? "text-magma animate-spin-slow" : "text-zinc-600")} />
                            <span className="text-xs text-zinc-400 font-bold tracking-wider">REST</span>
                        </div>
                        <div className={cn(
                            "text-xl font-mono font-bold tabular-nums",
                            isTimerActive ? "text-magma" : "text-zinc-600"
                        )}>
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    </div>

                    {/* Recovery/Drift Indicator */}
                    {metrics.drift > 5 && (
                        <div className="flex items-center gap-2 justify-end mt-1 animate-pulse">
                            <span className="text-[10px] text-orange-400 uppercase font-bold">Cardiac Drift Detected</span>
                            <Zap className="w-3 h-3 text-orange-400" />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

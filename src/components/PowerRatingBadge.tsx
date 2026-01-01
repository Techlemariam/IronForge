import React from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface PowerRatingBadgeProps {
    rating: number; // 0-1000
    className?: string;
}

export function PowerRatingBadge({ rating, className }: PowerRatingBadgeProps) {
    // Determine Tier Color
    const getTierColor = (r: number) => {
        if (r >= 900) return "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"; // Diamond/Cyber
        if (r >= 750) return "text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"; // Gold
        if (r >= 500) return "text-zinc-300 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]"; // Silver
        return "text-amber-700"; // Bronze
    };

    const getTierLabel = (r: number) => {
        if (r >= 900) return "CYBER-TITAN";
        if (r >= 750) return "ELITE";
        if (r >= 500) return "VANGUARD";
        return "INITIATE";
    };

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="flex items-center gap-1.5">
                <Zap className={cn("w-4 h-4", getTierColor(rating))} fill="currentColor" />
                <span className={cn("text-2xl font-black font-mono tracking-tighter", getTierColor(rating))}>
                    {rating}
                </span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                {getTierLabel(rating)}
            </div>
        </div>
    );
}

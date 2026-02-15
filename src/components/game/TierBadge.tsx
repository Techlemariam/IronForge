"use client";

import React from "react";
import { Shield, Zap, Sword, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
    score: number;
    showScore?: boolean;
    className?: string;
}

const getTierDetails = (score: number) => {
    if (score >= 2000) return { name: "Titan", color: "text-gold", bg: "bg-gold/10", border: "border-gold", icon: Crown };
    if (score >= 1500) return { name: "Elite", color: "text-plasma", bg: "bg-plasma/10", border: "border-plasma", icon: Zap };
    if (score >= 1001) return { name: "Adept", color: "text-warp", bg: "bg-warp/10", border: "border-warp", icon: Shield };
    if (score >= 501) return { name: "Apprentice", color: "text-clay", bg: "bg-clay/10", border: "border-clay", icon: Sword };
    return { name: "Novice", color: "text-steel", bg: "bg-steel/10", border: "border-steel", icon: User };
};

export function TierBadge({ score, showScore = true, className }: TierBadgeProps) {
    const tier = getTierDetails(score);
    const Icon = tier.icon;

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider",
            tier.bg,
            tier.color,
            tier.border,
            className
        )}>
            <Icon className="w-3 h-3" />
            <span>{tier.name}</span>
            {showScore && <span className="opacity-50 ml-0.5">| {score}</span>}
        </div>
    );
}

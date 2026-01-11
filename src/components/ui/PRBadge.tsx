// src/components/ui/PRBadge.tsx
"use client";

import React from "react";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PRBadgeProps {
    maxReps: number | null;
    exerciseName?: string;
    weight?: number;
    size?: "sm" | "md" | "lg" | "xl";
    isLoading?: boolean;
    className?: string;
}

/**
 * Displays the current rep PR to beat.
 * Different sizes for Mobile, Desktop, and TV Mode.
 */
export const PRBadge: React.FC<PRBadgeProps> = ({
    maxReps,
    exerciseName,
    weight,
    size = "md",
    isLoading = false,
    className,
}) => {
    const sizeClasses = {
        sm: "text-xs px-2 py-1 gap-1",
        md: "text-sm px-3 py-1.5 gap-2",
        lg: "text-lg px-4 py-2 gap-2",
        xl: "text-4xl px-6 py-4 gap-3 font-bold", // TV Mode
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
        xl: "w-10 h-10",
    };

    if (isLoading) {
        return (
            <div
                className={cn(
                    "flex items-center bg-zinc-800/50 border border-zinc-700 rounded-lg animate-pulse",
                    sizeClasses[size],
                    className
                )}
            >
                <Loader2 className={cn(iconSizes[size], "text-zinc-500 animate-spin")} />
                <span className="text-zinc-500">Loading PR...</span>
            </div>
        );
    }

    if (maxReps === null) {
        return (
            <div
                className={cn(
                    "flex items-center bg-zinc-900/50 border border-zinc-800 rounded-lg",
                    sizeClasses[size],
                    className
                )}
            >
                <Trophy className={cn(iconSizes[size], "text-zinc-600")} />
                <span className="text-zinc-500">
                    {size === "xl" ? "SET YOUR FIRST RECORD" : "No PR yet"}
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center bg-amber-500/10 border border-amber-500/30 rounded-lg",
                "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                sizeClasses[size],
                className
            )}
        >
            <Trophy className={cn(iconSizes[size], "text-amber-500")} />
            <span className="text-amber-500">
                {size === "xl" ? "BEAT:" : "Beat:"}{" "}
                <span className="font-bold text-amber-400">{maxReps}</span>
                {weight && size !== "xl" && (
                    <span className="text-amber-600 ml-1">@ {weight}kg</span>
                )}
            </span>
        </div>
    );
};

export default PRBadge;

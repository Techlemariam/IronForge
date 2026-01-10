import React from "react";
import { useHRRecoveryTimer } from "@/features/strength/hooks/useHRRecoveryTimer";
import { HRStrengthService } from "@/features/strength/services/HRStrengthService";
import { cn } from "@/lib/utils";

export const HRZoneBadge = () => {
    const { currentHR, metrics } = useHRRecoveryTimer();
    const zoneColor = HRStrengthService.getZoneColor(metrics.zone);

    return (
        <div className={cn("px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2", zoneColor, "bg-opacity-20 text-white")}>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", zoneColor)} />
            <span>{currentHR} BPM</span>
            <span className="opacity-70 text-[10px] uppercase">Z{metrics.zone}</span>
        </div>
    );
};

import React from "react";
import { twMerge } from "tailwind-merge";

export type QuestType = "DAILY" | "RAID" | "EXPANSION" | "REPAIR";

interface QuestBadgeProps {
    type: QuestType;
    className?: string;
}

const CONFIG: Record<QuestType, { label: string; color: string; icon: string; border: string }> = {
    DAILY: { label: "Daily Quest", color: "text-gray-400", icon: "●", border: "border-gray-700" },
    RAID: { label: "Raid", color: "text-orange-500", icon: "☠", border: "border-orange-500/50" },
    EXPANSION: { label: "Expansion", color: "text-purple-500", icon: "◈", border: "border-purple-500/50" },
    REPAIR: { label: "Repair Cycle", color: "text-green-500", icon: "✚", border: "border-green-500/50" },
};

const QuestBadge: React.FC<QuestBadgeProps> = ({ type, className }) => {
    const config = CONFIG[type] || CONFIG.DAILY;

    return (
        <div className={twMerge(
            "inline-flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border rounded-full text-xs font-mono uppercase tracking-widest",
            config.border,
            config.color,
            className
        )}>
            <span className="text-[10px]">{config.icon}</span>
            <span>{config.label}</span>
        </div>
    );
};

export default QuestBadge;

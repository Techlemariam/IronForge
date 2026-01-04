"use client";

import React from "react";
import { GarminWellnessData } from "@/services/bio/GarminService";
import { Battery, Activity, Zap, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface GarminWidgetProps {
    data: GarminWellnessData;
    variant?: "compact" | "full";
}

export const GarminWidget: React.FC<GarminWidgetProps> = ({ data, variant = "compact" }) => {
    // Body Battery Color
    const getBatteryColor = (val: number) => {
        if (val > 70) return "text-green-400";
        if (val > 30) return "text-yellow-400";
        return "text-red-500";
    };

    // Stress Color
    const getStressColor = (val: number) => {
        if (val < 25) return "text-blue-400"; // Resting
        if (val < 50) return "text-green-400"; // Low
        if (val < 75) return "text-orange-400"; // Med
        return "text-red-500"; // High
    };

    if (variant === "compact") {
        return (
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(data.bodyBattery)}`} />
                    <span className="text-sm font-bold text-white">{data.bodyBattery}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <Activity className={`w-4 h-4 ${getStressColor(data.stressLevel)}`} />
                    <span className="text-sm font-bold text-white">{data.stressLevel}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl shadow-xl">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    <Battery className="w-3 h-3" /> Body Battery
                </div>
                <div className="text-2xl font-black text-white">{data.bodyBattery}</div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.bodyBattery}%` }}
                        className={`h-full ${getBatteryColor(data.bodyBattery).replace('text', 'bg')}`}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    <Activity className="w-3 h-3" /> Stress Level
                </div>
                <div className="text-2xl font-black text-white">{data.stressLevel}</div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.stressLevel}%` }}
                        className={`h-full ${getStressColor(data.stressLevel).replace('text', 'bg')}`}
                    />
                </div>
            </div>

            {data.restingHeartRate && (
                <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                    <span>Resting HR</span>
                    <span className="text-white">{data.restingHeartRate} BPM</span>
                </div>
            )}
        </div>
    );
}

"use client";

import React from "react";
import { LayerLevel } from "@/types/training";
import {
  MOBILITY_LAYER_BONUSES,
  RECOVERY_LAYER_BONUSES,
  LAYER_REQUIREMENTS,
} from "@/data/builds";
import { Zap, Moon, Info } from "lucide-react";
import { motion } from "framer-motion";


interface PassiveLayerProgressProps {
  mobilityLevel: LayerLevel;
  recoveryLevel: LayerLevel;
  mobilitySessionsCompleted?: number; // Current progress
  recoverySessionsCompleted?: number;
  mobilityBonuses?: any;
  recoveryBonuses?: any;
}

export const PassiveLayerProgress: React.FC<PassiveLayerProgressProps> = ({
  mobilityLevel,
  recoveryLevel,
  mobilitySessionsCompleted = 0,
  recoverySessionsCompleted = 0,
  mobilityBonuses,
  recoveryBonuses,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
        <Info className="w-4 h-4" /> Passive Layers (Always Active)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobility Layer */}
        <LayerCard
          title="Mobility Layer"
          level={mobilityLevel}
          sessions={mobilitySessionsCompleted}
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
          bonuses={mobilityBonuses || MOBILITY_LAYER_BONUSES[mobilityLevel]}
          color="yellow"
        />

        {/* Recovery Layer */}
        <LayerCard
          title="Recovery Layer"
          level={recoveryLevel}
          sessions={recoverySessionsCompleted}
          icon={<Moon className="w-5 h-5 text-indigo-400" />}
          bonuses={recoveryBonuses || RECOVERY_LAYER_BONUSES[recoveryLevel]}
          color="indigo"
        />
      </div>
    </div>
  );
};

interface LayerCardProps {
  title: string;
  level: LayerLevel;
  sessions: number;
  icon: React.ReactNode;
  bonuses: any;
  color: string;
}

const LayerCard: React.FC<LayerCardProps> = ({
  title,
  level,
  sessions,
  icon,
  bonuses,
  color,
}) => {
  // Calculate progress to next level
  let nextLevelReq = 0;

  if (level === "NONE") nextLevelReq = LAYER_REQUIREMENTS.BRONZE.sessions;
  else if (level === "BRONZE")
    nextLevelReq = LAYER_REQUIREMENTS.SILVER.sessions;
  else if (level === "SILVER") nextLevelReq = LAYER_REQUIREMENTS.GOLD.sessions;
  else nextLevelReq = sessions; // Cap if GOLD

  const progressPercent = Math.min((sessions / nextLevelReq) * 100, 100);

  return (
    <div className="bg-black/20 border border-white/5 rounded-xl p-4 relative overflow-hidden group backdrop-blur-sm hover:bg-black/30 transition-all">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded bg-${color}-500/10 border border-${color}-500/20`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-sm text-zinc-200">{title}</h4>
            <div className={`text-xs font-mono font-bold text-${color}-400`}>
              {level} TIER
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500 uppercase">Next Tier</div>
          <div className="text-sm font-mono">
            {sessions} / {nextLevelReq}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-black/40 rounded-full mb-3 overflow-hidden border border-white/5">
        <motion.div
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 shadow-[0_0_10px_rgba(var(--${color}-500),0.5)]`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Active Bonuses */}
      <div className="space-y-1">
        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">
          Active Bonuses
        </p>
        {Object.entries(bonuses).map(([key, value]) => {
          const val = value as number;
          if (val === 0) return null;
          return (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-zinc-400 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-zinc-200 font-mono">
                {val > 0 ? "+" : ""}
                {Math.round(val * 100)}%
              </span>
            </div>
          );
        })}
        {Object.values(bonuses).every((v) => v === 0) && (
          <span className="text-xs text-zinc-600 italic">
            No active bonuses. Train to unlock.
          </span>
        )}
      </div>
    </div>
  );
};

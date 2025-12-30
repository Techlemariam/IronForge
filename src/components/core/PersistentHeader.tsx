import React from "react";
import { Coins, Star, Trophy } from "lucide-react";
import { Faction } from "@/types/training";

interface PersistentHeaderProps {
  level: number;
  xp: number;
  gold: number;
  faction: Faction;
  className?: string;
}

export const PersistentHeader: React.FC<PersistentHeaderProps> = ({
  level,
  xp,
  gold,
  faction,
  className = "",
}) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none flex justify-center md:justify-start ${className}`}
    >
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 flex items-center gap-6 shadow-xl pointer-events-auto">
        {/* Level */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-magma text-black font-bold flex items-center justify-center ring-2 ring-magma/50">
            {level}
          </div>
          {/* XP Hidden on mobile to save space, visible on hover? */}
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none">
              Level
            </span>
            <span className="text-xs font-bold text-white">
              {xp.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-white/10"></div>

        {/* Gold */}
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-mono font-bold text-yellow-400">
            {gold.toLocaleString()}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-white/10"></div>

        {/* Faction */}
        <div
          className={`text-xs font-black italic tracking-wider ${faction === "ALLIANCE" ? "text-blue-500" : "text-red-500"}`}
        >
          {faction}
        </div>
      </div>
    </div>
  );
};

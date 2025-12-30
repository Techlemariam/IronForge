import React from "react";
import { Zone } from "../../types";
import { ZONES } from "../../data/gameData";
import {
  Map as MapIcon,
  Lock,
  Compass,
  Mountain,
  Waves,
  Flame,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface WorldMapProps {
  userLevel: number;
  onClose: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ userLevel, onClose }) => {
  const getZoneIcon = (icon: string) => {
    switch (icon) {
      case "🌋":
        return <Flame className="w-10 h-10" />;
      case "🌪️":
        return <Mountain className="w-10 h-10" />; // Proxy for height
      case "🌊":
        return <Waves className="w-10 h-10" />;
      default:
        return <Compass className="w-10 h-10" />;
    }
  };

  const isUnlocked = (zone: Zone) => userLevel >= zone.requiredLevel;

  return (
    <div className="h-full bg-[#0a0a0c] p-6 overflow-hidden font-serif text-zinc-200 flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-forge-border/30 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-warrior-light uppercase tracking-tighter flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-cyan-500" />
            World Map
          </h1>
          <p className="text-rarity-common text-xs italic mt-1">
            &quot;Charting the path from Initiate to Elite Titan.&quot;
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-forge-800 border-2 border-forge-border px-4 py-2 rounded font-bold uppercase text-xs hover:bg-forge-700 transition-colors"
        >
          Return to Citadel
        </button>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 bg-[#111] border-4 border-[#222] rounded-xl relative overflow-hidden shadow-inner group">
        {/* Background Grid/Noise */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

        {/* Region Labels */}
        <div className="absolute top-10 left-10 text-zinc-800 font-black text-6xl uppercase tracking-[2em] pointer-events-none">
          NORTHERN REACHES
        </div>
        <div className="absolute bottom-10 right-10 text-zinc-800 font-black text-6xl uppercase tracking-[2em] pointer-events-none">
          THE FOUNDRY
        </div>

        {/* Zone Nodes */}
        {ZONES.map((zone) => {
          const unlocked = isUnlocked(zone);

          return (
            <div
              key={zone.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${zone.coordinates.x}%`,
                top: `${zone.coordinates.y}%`,
              }}
            >
              <div className="flex flex-col items-center">
                {/* Node */}
                <div
                  className={cn(
                    "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-500 cursor-pointer shadow-2xl relative",
                    unlocked
                      ? "bg-zinc-900 border-cyan-500 text-cyan-400 hover:scale-110 hover:border-white shadow-cyan-500/20"
                      : "bg-black border-zinc-800 text-zinc-800 grayscale",
                  )}
                >
                  {unlocked ? (
                    getZoneIcon(zone.icon)
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}

                  {/* Pulse for unlocked but low level? No, pulse for current suggested? */}
                  {unlocked && zone.id === "zone_foundry" && (
                    <div className="absolute inset-0 rounded-full animate-ping border-2 border-cyan-500 opacity-20"></div>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <h3
                    className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      unlocked ? "text-white" : "text-zinc-700",
                    )}
                  >
                    {zone.name}
                  </h3>
                  {!unlocked && (
                    <span className="text-[8px] font-bold text-red-900 uppercase">
                      Requires Level {zone.requiredLevel}
                    </span>
                  )}
                </div>

                {/* Detail Tooltip (always visible or on hover? let's do simplified mobile-friendly) */}
                {unlocked && (
                  <div className="mt-2 bg-black/80 border border-zinc-800 p-2 rounded max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[8px] text-zinc-400 leading-tight italic">
                      &quot;{zone.description}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 border border-forge-border/30 p-3 rounded text-[9px] uppercase font-bold text-zinc-500 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span>Active Training Grounds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700"></div>
            <span>Undiscovered Lands</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;

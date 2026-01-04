"use client";

import React, { useEffect, useState } from "react";
import { getWorldMapAction, WorldMapData } from "@/actions/territories";
import { TerritoryCard } from "./territory/TerritoryCard";
import { Map as MapIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WorldMapProps {
  userLevel?: number; // Kept for interface compatibility
  onClose: () => void;
}

export default function WorldMap({ onClose }: WorldMapProps) {
  const [data, setData] = useState<WorldMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getWorldMapAction();
        setData(result);
      } catch (error) {
        console.error("Failed to load map:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Groups territories by region if needed, but we plot them absolutely
  const filteredTerritories = selectedRegion
    ? data?.territories.filter(t => t.region === selectedRegion)
    : data?.territories;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex justify-between items-center px-4 md:px-8 bg-zinc-950/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-500/20 hidden md:block">
            <MapIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-cyan-400 md:hidden" />
              World Map
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-wide">Territory Conquest Active • Week {getWeekNumber(new Date())}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto max-w-[50%] md:max-w-none scrollbar-hide">
          {/* Region Filters */}
          {data?.regions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
              className={`text-[10px] whitespace-nowrap px-3 py-1.5 rounded-full border transition-all ${selectedRegion === region
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'
                }`}
            >
              {region}
            </button>
          ))}

          <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white shrink-0">
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative overflow-hidden bg-[#050505]">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,0)_0%,rgba(0,0,0,1)_100%)] pointer-events-none" />

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
              <p className="text-zinc-500 font-mono text-xs animate-pulse">Establishing Satellite Uplink...</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full md:p-20 overflow-auto">
            {/* Map Grid Lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '100px 100px' }}
            />

            {/* Mobile: Just list them if strict map view is too hard, but let's try absolute positioning with scroll */}
            <div className="relative w-[1000px] h-[800px] md:w-full md:h-full min-w-[1000px] min-h-[800px]">
              {filteredTerritories?.map((territory) => (
                <motion.div
                  key={territory.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: Math.random() * 0.5 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 hover:z-50"
                  style={{
                    left: `${territory.coordX}%`,
                    top: `${territory.coordY}%`,
                  }}
                >
                  <TerritoryCard
                    territory={territory}
                    userGuildId={data?.userGuildId ?? null}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Legend */}
      <div className="h-12 border-t border-white/10 bg-zinc-950 px-4 md:px-8 flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase shrink-0">
        <div className="flex gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="hidden md:inline">Your Guild</span>
            <span className="md:hidden">Yours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="hidden md:inline">Enemy Controlled</span>
            <span className="md:hidden">Enemy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 border border-zinc-500 rounded-full" />
            <span>Unclaimed</span>
          </div>
        </div>
        <div className="hidden md:block">
          Data updates weekly via Oracle Decree
        </div>
      </div>
    </div>
  );
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

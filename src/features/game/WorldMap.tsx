"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Map as MapIcon, Compass } from "lucide-react";
import {
  getWorldStateAction,
  getRegionBossAction,
  WorldRegion,
} from "@/actions/systems/world";

interface WorldMapProps {
  userLevel?: number; // Optional if we fetch from server, but kept for interface compatibility
  onClose?: () => void;
  onEnterCombat?: (bossId: string) => void;
}

export default function WorldMap({ onClose, onEnterCombat }: WorldMapProps) {
  const [regions, setRegions] = useState<WorldRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<WorldRegion | null>(
    null,
  );
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterRegion = async () => {
    if (!selectedRegion) return;
    setIsEntering(true);

    try {
      const boss = await getRegionBossAction(selectedRegion.id);
      if (boss && onEnterCombat) {
        setTimeout(() => {
          setIsEntering(false);
          onEnterCombat(boss.id);
        }, 2000);
      } else {
        console.warn("No active boss found for this region.");
        setIsEntering(false);
        setSelectedRegion(null);
      }
    } catch (e) {
      console.error("Failed to enter region", e);
      setIsEntering(false);
    }
  };

  useEffect(() => {
    const fetchWorld = async () => {
      try {
        const data = await getWorldStateAction();
        if (data) {
          setRegions(data.regions);
        }
      } catch (error) {
        console.error("Failed to load world map", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorld();
  }, []);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 animate-pulse">
        Scouting Terrain...
      </div>
    );

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 px-4 py-2 bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white uppercase text-xs font-bold tracking-widest rounded transition-colors backdrop-blur-md"
      >
        Return to Citadel
      </button>
      {/* Background Texture (Abstract Grid for now) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #333 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Title Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-4xl font-black italic uppercase text-zinc-800 tracking-tighter">
          Known World
        </h2>
        <div className="flex items-center gap-2 text-zinc-600 text-xs font-mono mt-1">
          <Compass className="w-4 h-4" />
          <span>SECTOR 7-G</span>
        </div>
      </div>

      {/* Map Nodes */}
      <div className="relative w-full h-full">
        {regions.map((region) => (
          <motion.div
            key={region.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${region.coordinates.x}%`,
              top: `${region.coordinates.y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + Math.random() * 0.5 }}
            onClick={() => setSelectedRegion(region)}
          >
            {/* Region-Specific Particles/Aura */}
            {region.id === "iron_forge" && region.isUnlocked && (
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 animate-pulse" />
            )}
            {region.id === "shadow_realms" && region.isUnlocked && (
              <div className="absolute inset-0 bg-purple-900/40 blur-xl rounded-full scale-150 animate-pulse" />
            )}
            {region.id === "the_void" && region.isUnlocked && (
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 animate-pulse" />
            )}

            {/* Ping / Ripple Effect if Unlocked */}
            {region.isUnlocked && (
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                  region.id === "iron_forge"
                    ? "bg-orange-500"
                    : region.id === "shadow_realms"
                      ? "bg-purple-500"
                      : "bg-white"
                }`}
              ></div>
            )}

            {/* Node Icon */}
            <div
              className={`
                            w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 relative z-10
                            ${
                              region.isUnlocked
                                ? region.id === "iron_forge"
                                  ? "bg-zinc-900 border-orange-500 text-orange-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                                  : region.id === "shadow_realms"
                                    ? "bg-zinc-900 border-purple-500 text-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                                    : "bg-zinc-950 border-white text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                : "bg-zinc-950 border-zinc-800 text-zinc-700 grayscale cursor-not-allowed"
                            }
                        `}
            >
              {region.isUnlocked ? (
                <MapIcon className="w-6 h-6" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            {/* Label */}
            <div
              className={`
                            absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded bg-black/90 border border-zinc-800 text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition-all
                            ${region.name === "???" ? "text-zinc-700 blur-[2px]" : region.isUnlocked ? "text-zinc-300 group-hover:text-white group-hover:border-zinc-500" : "text-zinc-600"}
                        `}
            >
              {region.name}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Region Detail Modal (Simple Overlay) */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-zinc-900/90 border border-[#ffd700]/30 backdrop-blur-xl p-6 rounded-xl shadow-2xl z-20"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black italic uppercase text-[#ffd700]">
                  {selectedRegion.name}
                </h3>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  Difficulty:{" "}
                  {selectedRegion.levelReq >= 20
                    ? "EXTREME"
                    : selectedRegion.levelReq >= 10
                      ? "HARD"
                      : "NORMAL"}
                </div>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {selectedRegion.description}
            </p>

            <div className="flex items-center gap-4">
              {!selectedRegion.isUnlocked ? (
                <div className="w-full py-3 bg-zinc-800 text-zinc-500 font-bold uppercase text-center rounded flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Requires Level{" "}
                  {selectedRegion.levelReq}
                </div>
              ) : (
                <button
                  onClick={handleEnterRegion}
                  className="w-full py-3 bg-[#ffd700] text-black font-black uppercase tracking-widest rounded hover:bg-white transition-colors"
                >
                  Enter Region
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Warp Effect Overlay */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white flex items-center justify-center"
          >
            <div className="text-black font-black text-6xl uppercase tracking-tighter animate-pulse">
              Warping...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

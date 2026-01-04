import React, { useEffect, useState, useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { playSound } from "@/utils";
import { Sparkles, ArrowUpCircle } from "lucide-react";

interface TitanXPBarProps {
  currentXP: number;
  maxXP: number;
  level?: number;
  isRested?: boolean;
  isElite?: boolean; // New prop for Rank 5
}

export function TitanXPBar({
  currentXP,
  maxXP,
  level = 1,
  isRested = false,
  isElite = false,
}: TitanXPBarProps) {
  const [flash, setFlash] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Track previous level to detect changes
  const prevLevelRef = useRef(level);

  // Trigger flash when XP changes
  useEffect(() => {
    // Only flash if we have XP (prevents flash on mount if 0)
    if (currentXP > 0) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [currentXP]);

  // Trigger Level Up Event
  useEffect(() => {
    if (prevLevelRef.current < level) {
      setShowLevelUp(true);
      playSound("ding");
      const t = setTimeout(() => setShowLevelUp(false), 4000); // Duration of animation
      return () => clearTimeout(t);
    }
    prevLevelRef.current = level;
  }, [level]);

  // Calculate Percentage
  const percentage = Math.min((currentXP / maxXP) * 100, 100);

  // Animate Numbers
  const animatedXP = useCountUp(currentXP);

  // Elite Styles
  const barGradient = isElite
    ? "bg-gradient-to-b from-yellow-200 via-white to-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.8)]"
    : isRested
      ? "bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
      : "bg-gradient-to-b from-purple-500 via-purple-600 to-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.5)]";

  const containerBorder = isElite
    ? "border-[#ffd700] shadow-[0_0_10px_rgba(255,215,0,0.3)]"
    : "border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,1)]";

  return (
    <div className="w-full font-serif relative">
      {/* --- LEVEL UP OVERLAY --- */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in-fast pointer-events-none">
          {/* Burst Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffd700]/20 via-transparent to-transparent animate-pulse-slow"></div>

          {/* Icon */}
          <div className="relative mb-6 animate-slide-up-fade">
            <ArrowUpCircle className="w-24 h-24 text-[#ffd700] drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]" />
            <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-white animate-spin-slow" />
          </div>

          <h2 className="text-4xl md:text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] uppercase tracking-[0.2em] mb-4 animate-scale-bounce drop-shadow-lg">
            Level Up
          </h2>

          <div className="flex items-baseline gap-4 text-white animate-fade-in-delayed">
            <span className="text-2xl font-sans uppercase tracking-widest text-zinc-400">
              Titan Rank
            </span>
            <span className="text-8xl font-black text-white text-shadow-gold">
              {level}
            </span>
          </div>

          <div className="mt-8 px-6 py-2 border border-[#ffd700]/50 bg-[#ffd700]/10 rounded-full text-[#ffd700] text-sm uppercase tracking-widest font-bold animate-pulse">
            Skill Points Awarded
          </div>

          <style>{`
                @keyframes scaleBounce {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 1; }
                    70% { transform: scale(0.95); }
                    100% { transform: scale(1); }
                }
                .animate-scale-bounce { animation: scaleBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-fade-in-fast { animation: fadeIn 0.3s ease-out forwards; }
                .animate-fade-in-delayed { animation: fadeIn 0.5s ease-out 0.5s forwards; opacity: 0; }
                .animate-slide-up-fade { animation: slideUp 0.6s ease-out forwards; }
                .text-shadow-gold { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
             `}</style>
        </div>
      )}

      {/* Header: Level & Values */}
      <div className="flex justify-between items-end mb-2 px-1">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-xs font-bold tracking-widest uppercase ${isElite ? "text-[#ffd700]" : "text-zinc-500"}`}
          >
            Level
          </span>
          <span
            className={`text-3xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isElite ? "text-white text-shadow-gold" : "text-white"}`}
          >
            {level}
          </span>
        </div>

        <div className="text-right">
          <span
            className={`font-mono font-bold text-sm ${isElite ? "text-white" : isRested ? "text-blue-400" : "text-[#ffd700]"}`}
          >
            {animatedXP}
            <span className="text-zinc-500 mx-1">/</span>
            {maxXP} XP
          </span>
        </div>
      </div>

      {/* The Bar Container */}
      <div
        className={`relative h-6 bg-zinc-950 rounded-full border ${containerBorder} overflow-hidden transition-all duration-500`}
      >
        {/* Technical Grid Background */}
        <div className="absolute inset-0 w-full h-full flex justify-between px-2 z-0 opacity-20 pointer-events-none">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-[1px] h-full bg-zinc-500" />
          ))}
        </div>

        {/* FILL BAR */}
        <div
          className={`h-full relative transition-all duration-1000 ease-out ${barGradient}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Flash Effect on Gain - Enhanced Visibility */}
          <div
            className={`absolute inset-0 bg-white z-20 transition-opacity duration-300 ${flash ? "opacity-80" : "opacity-0"}`}
          />

          {/* Glass Gloss (Top Half) */}
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent z-10" />

          {/* Leading Edge Glow */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/80 shadow-[0_0_15px_rgba(255,255,255,1)] z-10" />

          {/* Subtle Scanline Texture */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px] z-0" />

          {/* Elite Particles (CSS Only representation) */}
          {isElite && (
            <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-overlay animate-pulse z-0" />
          )}
        </div>

        {/* Centered Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <span
            className={`text-[9px] font-black uppercase tracking-[0.2em] drop-shadow-sm mix-blend-overlay ${isElite ? "text-black/60" : "text-white/40"}`}
          >
            {isElite ? "MAXIMUM POWER" : "Titan Protocol"}
          </span>
        </div>
      </div>

      {/* Footer Flavor Text */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[10px] text-zinc-600 italic font-sans">
          {isElite
            ? "Legendary Status Active"
            : isRested
              ? "Rested (+200% XP)"
              : "Grinding..."}
        </span>
        {!isElite && (
          <span className="text-[10px] text-zinc-600 font-sans">
            {Math.round(maxXP - currentXP)} XP to Level {(level || 1) + 1}
          </span>
        )}
      </div>
    </div>
  );
}

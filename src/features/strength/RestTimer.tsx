"use client";

import React, { useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { useRestTimer } from "@/hooks/useRestTimer";
import { cn } from "@/lib/utils";
import { playSound } from "@/utils"; // Ensure this exists or mock it

interface RestTimerProps {
  className?: string;
}

export const RestTimer: React.FC<RestTimerProps> = ({ className }) => {
  const { isActive, timeLeft, start, stop, addTime, reset, check, hasFinished } = useRestTimer();
  const [hasPlayedSound, setHasPlayedSound] = React.useState(false);

  // Tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        check();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, check]);

  // Sound effect on completion
  useEffect(() => {
    if (hasFinished && !hasPlayedSound) {
      playSound("ding");
      setHasPlayedSound(true);
    }
    // Reset flag when timer restarts
    if (!hasFinished && hasPlayedSound) {
      setHasPlayedSound(false);
    }
  }, [hasFinished, hasPlayedSound]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isActive && timeLeft === 90) {
    // Minimal state? Or always show?
  }

  return (
    <div className={cn("bg-zinc-900 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-4 shadow-lg", className)}>
      <div className="relative">
        <div className={cn(
          "text-6xl font-black font-mono tracking-tighter tabular-nums transition-colors",
          isActive ? "text-magma" : "text-zinc-600"
        )}>
          {formatTime(timeLeft)}
        </div>
        <Timer className={cn(
          "absolute -top-2 -right-6 w-6 h-6",
          isActive ? "text-magma animate-pulse" : "text-zinc-700"
        )} />
      </div>

      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={() => isActive ? stop() : start(timeLeft > 0 ? timeLeft : 90)}
          className={cn(
            "p-4 rounded-full transition-all shadow-lg active:scale-95",
            isActive ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-magma text-black hover:bg-magma/90"
          )}
        >
          {isActive ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={() => reset()}
          className="p-4 bg-zinc-800 text-zinc-500 rounded-full hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => addTime(-10)}
          className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          <Minus className="w-3 h-3" /> 10s
        </button>
        <button
          onClick={() => addTime(30)}
          className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> 30s
        </button>
      </div>
    </div>
  );
};

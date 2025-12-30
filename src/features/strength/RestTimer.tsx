"use client";

import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn exists, else standard string concat

interface RestTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  autoStart = false,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete?.();
      // Play sound?
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const addTime = (sec: number) => setTimeLeft((prev) => prev + sec);

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/5 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="text-6xl font-black text-white font-mono tracking-tighter tabular-nums">
          {formatTime(timeLeft)}
        </div>
        <Timer className="absolute -top-2 -right-6 w-6 h-6 text-zinc-600" />
      </div>

      <div className="flex items-center gap-2 w-full justify-center">
        <button
          onClick={() => setIsActive(!isActive)}
          className="p-3 bg-magma text-black rounded-full hover:bg-magma/80 transition-colors"
        >
          {isActive ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
        <button
          onClick={() => {
            setIsActive(false);
            setTimeLeft(initialSeconds);
          }}
          className="p-3 bg-white/5 text-zinc-400 rounded-full hover:text-white transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => addTime(30)}
          className="px-3 py-1 bg-white/5 rounded-md text-xs font-bold text-zinc-400 hover:text-white"
        >
          +30s
        </button>
        <button
          onClick={() => addTime(-30)}
          className="px-3 py-1 bg-white/5 rounded-md text-xs font-bold text-zinc-400 hover:text-white"
        >
          -30s
        </button>
      </div>
    </div>
  );
};

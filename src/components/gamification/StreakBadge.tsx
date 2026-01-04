"use client";

import { useEffect, useState, useCallback } from "react";
import { Flame, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getStreakStatusAction } from "@/actions/user/streak";

interface StreakBadgeProps {
  userId: string;
  compact?: boolean;
}

export function StreakBadge({ userId, compact = false }: StreakBadgeProps) {
  const [streak, setStreak] = useState(0);
  const [isAtRisk, setIsAtRisk] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    const result = await getStreakStatusAction(userId);
    if (result.success) {
      setStreak(result.currentStreak);
      setIsAtRisk(result.isAtRisk);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  if (loading || streak === 0) return null;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
          isAtRisk
            ? "bg-red-900/30 text-red-400 border border-red-600/50 animate-pulse"
            : "bg-orange-900/30 text-orange-400 border border-orange-600/50",
        )}
      >
        <Flame className="w-3 h-3" />
        <span>{streak}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-xl border",
        isAtRisk
          ? "bg-red-950/40 border-red-600/50"
          : "bg-orange-950/40 border-orange-600/50",
      )}
    >
      {/* Fire animation */}
      <motion.div
        animate={{
          y: [0, -2, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "easeInOut",
        }}
      >
        <Flame
          className={cn(
            "w-6 h-6",
            isAtRisk ? "text-red-500" : "text-orange-500",
          )}
        />
      </motion.div>

      <div className="flex flex-col">
        <span
          className={cn(
            "text-2xl font-black leading-none",
            isAtRisk ? "text-red-400" : "text-orange-400",
          )}
        >
          {streak}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          Day Streak
        </span>
      </div>

      {/* At risk indicator */}
      <AnimatePresence>
        {isAtRisk && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute -right-2 -top-2"
          >
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded-full text-[10px] font-bold text-white animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              AT RISK
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

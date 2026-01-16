"use client";

import React from "react";
import { OracleDecree } from "@/types/oracle";
import { Flame, Moon, Zap, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OracleVerdictProps {
  decree: OracleDecree | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * Clear daily verdict UI for the Oracle recommendation.
 * Shows TRAIN / REST / LIGHT recommendation prominently.
 */
export const OracleVerdict: React.FC<OracleVerdictProps> = ({
  decree,
  isLoading = false,
  className,
}) => {
  // Derive simple verdict from decree type & label
  const getVerdict = (
    decree: OracleDecree,
  ): { label: string; color: string; icon: React.ReactNode; bg: string } => {
    // 1. DEBUFF -> REST
    if (decree.type === "DEBUFF") {
      return {
        label: "REST",
        color: "text-red-400",
        bg: "from-red-500/20 to-rose-500/10 border-red-500/30",
        icon: <Moon className="w-8 h-8 text-red-400" />,
      };
    }

    // 2. BUFF -> TRAIN (PEAK)
    if (decree.type === "BUFF") {
      return {
        label: "TRAIN HARD",
        color: "text-green-400",
        bg: "from-green-500/20 to-emerald-500/10 border-green-500/30",
        icon: <Flame className="w-8 h-8 text-green-400" />,
      };
    }

    // 3. NEUTRAL -> LIGHT vs TRAIN
    if (decree.label === "Decree of Patience") {
      return {
        label: "LIGHT",
        color: "text-cyan-400",
        bg: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
        icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
      };
    }

    // Default NEUTRAL (Discipline) -> TRAIN (STEADY)
    return {
      label: "TRAIN",
      color: "text-amber-400",
      bg: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
      icon: <Zap className="w-8 h-8 text-amber-400" />,
    };
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative rounded-xl border border-white/10 p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-24 bg-zinc-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-zinc-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!decree) {
    return (
      <div
        className={cn(
          "relative rounded-xl border border-zinc-700/50 p-6 bg-zinc-800/30",
          className,
        )}
      >
        <div className="flex items-center gap-4 text-zinc-500">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <p className="font-bold">Oracle Unavailable</p>
            <p className="text-sm">
              Connect wellness data to receive guidance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const verdict = getVerdict(decree);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={decree.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "relative overflow-hidden rounded-xl border p-6 bg-gradient-to-br",
          verdict.bg,
          className,
        )}
      >
        {/* Glow effect */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-black/20 flex items-center justify-center">
            {verdict.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Oracle Decree
              </span>
            </div>

            <h3
              className={cn(
                "text-2xl font-black uppercase tracking-wide",
                verdict.color,
              )}
            >
              {verdict.label}
            </h3>

            <p
              className="text-sm text-zinc-300 mt-1 truncate"
              title={decree.description}
            >
              {decree.description}
            </p>
          </div>

          {/* XP Multiplier Badge */}
          {decree.effect?.xpMultiplier &&
            decree.effect.xpMultiplier !== 1.0 && (
              <div className="flex-shrink-0 text-center">
                <div
                  className={cn(
                    "text-2xl font-black",
                    decree.effect.xpMultiplier > 1
                      ? "text-green-400"
                      : "text-red-400",
                  )}
                >
                  {decree.effect.xpMultiplier > 1 ? "+" : ""}
                  {Math.round((decree.effect.xpMultiplier - 1) * 100)}%
                </div>
                <div className="text-xs text-zinc-500 uppercase">XP</div>
              </div>
            )}
        </div>

        {/* Decree Label */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-xs font-mono text-zinc-500 italic">
            {`"${decree.label}"`}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OracleVerdict;

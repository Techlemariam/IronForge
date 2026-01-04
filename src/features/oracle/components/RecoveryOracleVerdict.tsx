"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Flame, Moon, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkOvertrainingStatusAction } from "@/actions/training/overtraining";
import { getStreakStatusAction } from "@/actions/user/streak";

type Verdict = "TRAIN" | "REST" | "LIGHT";

interface VerdictConfig {
  verdict: Verdict;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const VERDICT_CONFIGS: Record<Verdict, VerdictConfig> = {
  TRAIN: {
    verdict: "TRAIN",
    label: "GO HARD",
    description: "Your body is ready. Push your limits today.",
    icon: <Flame className="w-8 h-8" />,
    color: "text-green-400",
    bgColor: "from-green-950/50 to-green-900/20",
  },
  REST: {
    verdict: "REST",
    label: "RECOVER",
    description: "Your Titan needs rest. Take the day off.",
    icon: <Moon className="w-8 h-8" />,
    color: "text-blue-400",
    bgColor: "from-blue-950/50 to-blue-900/20",
  },
  LIGHT: {
    verdict: "LIGHT",
    label: "EASY DAY",
    description: "Light activity recommended. Maintain momentum.",
    icon: <Zap className="w-8 h-8" />,
    color: "text-amber-400",
    bgColor: "from-amber-950/50 to-amber-900/20",
  },
};

interface RecoveryOracleVerdictProps {
  userId: string;
  wellnesScore?: number;
  sleepScore?: number;
}

export function RecoveryOracleVerdict({
  userId,
  wellnesScore = 75,
  sleepScore = 80,
}: RecoveryOracleVerdictProps) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpBonus, setXpBonus] = useState(0);

  const calculateVerdict = useCallback(async () => {
    setLoading(true);

    try {
      const [overtraining, streak] = await Promise.all([
        checkOvertrainingStatusAction(userId),
        getStreakStatusAction(userId),
      ]);

      // Decision logic
      let calculatedVerdict: Verdict = "TRAIN";
      let bonus = 0;

      // Check fatigue/overtraining
      if (overtraining.isCapped || overtraining.isFatigued) {
        calculatedVerdict = "REST";
      } else if (overtraining.xpMultiplier < 0.75) {
        calculatedVerdict = "LIGHT";
      }

      // Check wellness (if available)
      if (wellnesScore < 50 || sleepScore < 50) {
        calculatedVerdict = "REST";
      } else if (wellnesScore < 70 || sleepScore < 65) {
        calculatedVerdict =
          calculatedVerdict === "TRAIN" ? "LIGHT" : calculatedVerdict;
      }

      // Calculate XP bonus for optimal training
      if (calculatedVerdict === "TRAIN") {
        if (sleepScore >= 85) bonus += 20;
        if (wellnesScore >= 85) bonus += 20;
        if (streak.currentStreak >= 7) bonus += 10;
      }

      setVerdict(calculatedVerdict);
      setXpBonus(bonus);
    } catch (error) {
      console.error("Error calculating verdict:", error);
      setVerdict("TRAIN");
    } finally {
      setLoading(false);
    }
  }, [userId, wellnesScore, sleepScore]);

  useEffect(() => {
    calculateVerdict();
  }, [calculateVerdict]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!verdict) return null;

  const config = VERDICT_CONFIGS[verdict];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-6",
        `bg-gradient-to-br ${config.bgColor} border-slate-800`,
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-20 blur-2xl",
          config.color.replace("text-", "bg-"),
        )}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div
          className={cn(
            "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
            config.color.replace("text-", "bg-").replace("-400", "-900/50"),
          )}
        >
          <div className={config.color}>{config.icon}</div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-black ${config.color}`}>
              {config.label}
            </h2>
            {xpBonus > 0 && (
              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">
                +{xpBonus}% XP
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">{config.description}</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 pt-4 border-t border-slate-800/50 text-xs text-slate-500">
        Oracle Verdict based on recovery metrics, training history, and wellness
        data.
      </div>
    </motion.div>
  );
}

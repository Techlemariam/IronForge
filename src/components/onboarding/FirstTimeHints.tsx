"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HintConfig {
  id: string;
  targetSelector: string;
  title: string;
  message: string;
  position?: "top" | "bottom" | "left" | "right";
}

const FIRST_TIME_HINTS: HintConfig[] = [
  {
    id: "dashboard_stats",
    targetSelector: '[data-hint="titan-stats"]',
    title: "Your Titan Stats",
    message:
      "Track your Titan's health, energy, and XP here. Keep training to level up!",
    position: "bottom",
  },
  {
    id: "start_workout",
    targetSelector: '[data-hint="start-workout"]',
    title: "Begin Your Journey",
    message:
      "Tap here to start a workout session. Each set you complete deals damage to dungeon bosses!",
    position: "top",
  },
  {
    id: "skill_tree",
    targetSelector: '[data-hint="skill-tree"]',
    title: "Unlock Skills",
    message:
      "Spend skill points to unlock passive bonuses and combat abilities.",
    position: "left",
  },
  {
    id: "streak_badge",
    targetSelector: '[data-hint="streak"]',
    title: "Daily Streak",
    message: "Train every day to maintain your streak and earn bonus XP!",
    position: "bottom",
  },
];

const STORAGE_KEY = "ironforge_seen_hints";

export function useFirstTimeHints() {
  const [seenHints, setSeenHints] = useState<Set<string>>(new Set());
  const [currentHint, setCurrentHint] = useState<HintConfig | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSeenHints(new Set(JSON.parse(stored)));
    }
  }, []);

  const showNextHint = () => {
    const unseen = FIRST_TIME_HINTS.filter((h) => !seenHints.has(h.id));
    if (unseen.length > 0) {
      setCurrentHint(unseen[0]);
    }
  };

  const dismissHint = (hintId: string) => {
    const newSeen = new Set(seenHints).add(hintId);
    setSeenHints(newSeen);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...newSeen]));
    setCurrentHint(null);
  };

  const dismissAll = () => {
    const allIds = new Set(FIRST_TIME_HINTS.map((h) => h.id));
    setSeenHints(allIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...allIds]));
    setCurrentHint(null);
  };

  const resetHints = () => {
    setSeenHints(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    currentHint,
    showNextHint,
    dismissHint,
    dismissAll,
    resetHints,
    hasUnseenHints: FIRST_TIME_HINTS.some((h) => !seenHints.has(h.id)),
  };
}

interface HintOverlayProps {
  hint: HintConfig;
  onDismiss: () => void;
  onSkipAll: () => void;
}

export function HintOverlay({ hint, onDismiss, onSkipAll }: HintOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 pointer-events-auto"
          onClick={onDismiss}
        />

        {/* Hint Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm pointer-events-auto"
        >
          <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">{hint.title}</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {hint.message}
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={onSkipAll}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Skip all hints
              </button>
              <Button size="sm" onClick={onDismiss} className="gap-1">
                Got it <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

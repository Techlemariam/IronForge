"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Battery, Clock, X } from "lucide-react";
import { checkOvertrainingStatusAction } from "@/actions/overtraining";

interface OvertrainingBannerProps {
  userId: string;
  onDismiss?: () => void;
}

export function OvertrainingBanner({
  userId,
  onDismiss,
}: OvertrainingBannerProps) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [xpMultiplier, setXpMultiplier] = useState(1.0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    const status = await checkOvertrainingStatusAction(userId);
    setWarnings(status.warnings);
    setXpMultiplier(status.xpMultiplier);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed || warnings.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-amber-950/80 to-red-950/80 border border-amber-600/50 rounded-lg p-4 mb-4"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              Recovery Alert
              {xpMultiplier < 1 && (
                <span className="text-xs bg-red-900/50 px-2 py-0.5 rounded-full">
                  {Math.round(xpMultiplier * 100)}% XP
                </span>
              )}
            </h3>

            <ul className="mt-2 space-y-1">
              {warnings.map((warning, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-0.5">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

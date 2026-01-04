"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createDuelChallengeAction } from "@/actions/duel";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming Tabs might exist, if not I'll handle fallback
import { Bike, Footprints, Timer, Trophy, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CardioDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponentId: string;
}

type DuelType =
  | "TITAN_VS_TITAN"
  | "DISTANCE_RACE"
  | "SPEED_DEMON"
  | "ELEVATION_GRIND";
type ActivityType = "CYCLING" | "RUNNING";

export function CardioDuelModal({
  isOpen,
  onClose,
  opponentId,
}: CardioDuelModalProps) {
  const [duelType, setDuelType] = useState<DuelType>("DISTANCE_RACE");
  const [activityType, setActivityType] = useState<ActivityType>("CYCLING");
  const [duration, setDuration] = useState<number>(10); // minutes
  const [distance, setDistance] = useState<number>(5); // km
  const [wkgTier, setWkgTier] = useState<number>(2.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createDuelChallengeAction(opponentId, {
        duelType,
        activityType,
        durationMinutes:
          duelType === "DISTANCE_RACE" || duelType === "ELEVATION_GRIND"
            ? duration
            : undefined,
        targetDistance: duelType === "SPEED_DEMON" ? distance : undefined,
        wkgTier: activityType === "CYCLING" ? wkgTier : undefined,
      });

      if (result.success) {
        toast.success("Duel challenge sent!");
        onClose();
      } else {
        toast.error(result.error || "Failed to send challenge");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Create Cardio Duel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Activity Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              aria-pressed={activityType === "CYCLING"}
              onClick={() => setActivityType("CYCLING")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${activityType === "CYCLING"
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
            >
              <Bike className="w-8 h-8" />
              <span className="font-bold">Cycling</span>
            </button>
            <button
              type="button"
              aria-pressed={activityType === "RUNNING"}
              onClick={() => setActivityType("RUNNING")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${activityType === "RUNNING"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
            >
              <Footprints className="w-8 h-8" />
              <span className="font-bold">Running</span>
            </button>
          </div>

          {/* Duel Type Selection */}
          <div className="space-y-3">
            <Label>Duel Format</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                aria-pressed={duelType === "DISTANCE_RACE"}
                onClick={() => setDuelType("DISTANCE_RACE")}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${duelType === "DISTANCE_RACE"
                    ? "bg-slate-800 border-indigo-500 text-white"
                    : "border-transparent text-slate-400 hover:bg-slate-800"
                  }`}
              >
                Distance Race
              </button>
              <button
                type="button"
                aria-pressed={duelType === "SPEED_DEMON"}
                onClick={() => setDuelType("SPEED_DEMON")}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${duelType === "SPEED_DEMON"
                    ? "bg-slate-800 border-indigo-500 text-white"
                    : "border-transparent text-slate-400 hover:bg-slate-800"
                  }`}
              >
                Speed Demon
              </button>
              {activityType === "CYCLING" && (
                <button
                  type="button"
                  aria-pressed={duelType === "ELEVATION_GRIND"}
                  onClick={() => setDuelType("ELEVATION_GRIND")}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${duelType === "ELEVATION_GRIND"
                      ? "bg-slate-800 border-indigo-500 text-white"
                      : "border-transparent text-slate-400 hover:bg-slate-800"
                    }`}
                >
                  Elevation
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Inputs based on Type */}
          <AnimatePresence mode="wait">
            <motion.div
              key={duelType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {(duelType === "DISTANCE_RACE" ||
                duelType === "ELEVATION_GRIND") && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Duration (minutes)
                    </Label>
                    <div className="flex gap-2">
                      {[5, 10, 15, 30].map((m) => (
                        <button
                          key={m}
                          onClick={() => setDuration(m)}
                          className={`flex-1 py-2 rounded-md border text-sm font-medium ${duration === m
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                            }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {duelType === "SPEED_DEMON" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Target Distance (km)
                  </Label>
                  <div className="flex gap-2">
                    {(activityType === "RUNNING"
                      ? [1, 3, 5, 10]
                      : [5, 10, 20, 40]
                    ).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDistance(d)}
                        className={`flex-1 py-2 rounded-md border text-sm font-medium ${distance === d
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                          }`}
                      >
                        {d}km
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activityType === "CYCLING" && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <Label className="text-yellow-400">
                    Fairness Tier (W/kg)
                  </Label>
                  <p className="text-xs text-slate-500 mb-2">
                    Kickr resistance will auto-adjust to your weight.
                  </p>
                  <input
                    type="range"
                    min="1.5"
                    max="5.0"
                    step="0.1"
                    value={wkgTier}
                    onChange={(e) => setWkgTier(parseFloat(e.target.value))}
                    className="w-full accent-yellow-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Beginner (1.5)</span>
                    <span className="text-yellow-400 font-bold text-base">
                      {wkgTier.toFixed(1)} W/kg
                    </span>
                    <span>Pro (5.0)</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-slate-400">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {isSubmitting ? "Sending..." : "Challenge Titan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrainingPath, PathInfo } from "@/types/training";
import { PATH_INFO, PATH_MODIFIERS } from "@/data/builds";
import { updateActivePathAction } from "@/actions/training/core";
import { toast } from "sonner";
import { Sword, Heart, Wind, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathSelectorProps {
  initialPath: TrainingPath;
  onUpdate?: (path: TrainingPath) => void;
}

export const PathSelector: React.FC<PathSelectorProps> = ({
  initialPath,
  onUpdate,
}) => {
  const [selectedPath, setSelectedPath] = useState<TrainingPath>(initialPath);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (path: TrainingPath) => {
    setIsUpdating(true);
    try {
      const result = await updateActivePathAction(path);
      if (result.success) {
        setSelectedPath(path);
        toast.success(`Path updated to ${PATH_INFO[path].name}`);
        if (onUpdate) onUpdate(path);
      } else {
        toast.error("Failed to update path");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(PATH_INFO) as TrainingPath[]).map((pathId) => {
          const info = PATH_INFO[pathId];
          const modifiers = PATH_MODIFIERS[pathId];
          const isSelected = selectedPath === pathId;

          return (
            <motion.div
              key={pathId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(pathId)}
              className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all relative overflow-hidden",
                isSelected
                  ? `border-${info.color.split("-")[1]}-500 bg-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                  : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800",
              )}
            >
              {/* Background Glow for Selected */}
              {isSelected && (
                <div
                  className={`absolute inset-0 bg-${info.color.split("-")[1]}-500/10 z-0`}
                />
              )}

              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{info.icon}</div>
                  {isSelected && (
                    <CheckCircle2 className={`w-5 h-5 ${info.color}`} />
                  )}
                </div>

                <h3
                  className={cn(
                    "font-bold uppercase tracking-wider text-sm mb-1",
                    info.color,
                  )}
                >
                  {info.name}
                </h3>
                <p className="text-xs text-zinc-400 mb-4 flex-grow line-clamp-3">
                  {info.description}
                </p>

                {/* Stats/Modifiers */}
                <div className="space-y-2 bg-black/40 p-2 rounded text-xs border border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Sword className="w-3 h-3" />
                      <span>Power</span>
                    </div>
                    <span className={getModifierClass(modifiers.attackPower)}>
                      {formatModifier(modifiers.attackPower)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Wind className="w-3 h-3" />
                      <span>Stamina</span>
                    </div>
                    <span className={getModifierClass(modifiers.stamina)}>
                      {formatModifier(modifiers.stamina)}
                    </span>
                  </div>
                  {modifiers.dodge !== 1.0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Shield className="w-3 h-3" />
                        <span>Dodge</span>
                      </div>
                      <span className="text-green-400">
                        {formatModifier(modifiers.dodge)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

function formatModifier(value: number): string {
  const percent = Math.round((value - 1) * 100);
  return percent > 0 ? `+${percent}%` : `${percent}%`;
}

function getModifierClass(value: number): string {
  if (value > 1.0) return "text-green-400 font-bold";
  if (value < 1.0) return "text-red-400";
  return "text-zinc-500";
}

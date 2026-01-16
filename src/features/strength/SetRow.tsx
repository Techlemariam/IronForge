"use client";

import React, { useState, useEffect } from "react";
import { SetData } from "@/actions/training/strength";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Set types for different training techniques
export type SetType = "normal" | "failure" | "dropset" | "warmup" | "myoreps";

const SET_TYPE_CONFIG: Record<SetType, { label: string; icon: string; color: string }> = {
  normal: { label: "Normal", icon: "", color: "text-zinc-400" },
  failure: { label: "Failure", icon: "🔥", color: "text-orange-500" },
  dropset: { label: "Drop", icon: "⬇️", color: "text-blue-500" },
  warmup: { label: "Warm", icon: "🌡️", color: "text-yellow-500" },
  myoreps: { label: "Myo", icon: "⚡", color: "text-purple-500" },
};

interface SetRowProps {
  index?: number; // Optional as index might be passed or calculated
  setNumber?: number; // Explicit number from parent
  set: SetData;
  onChange?: (updates: Partial<SetData>) => void; // Optional if read-only or handled differently
  onDelete?: () => void;
  onComplete?: () => void;
  lastPerformance?: { weight: number; reps: number } | null;
}

export const SetRow: React.FC<SetRowProps> = ({
  index,
  setNumber,
  set,
  onChange,
  onDelete: _onDelete,
  onComplete,
  lastPerformance,
}) => {
  const displayIndex = setNumber || (index !== undefined ? index + 1 : 1);

  const [reps, setReps] = useState(set.reps || 0);
  const [weight, setWeight] = useState(set.weight || 0);
  const [rpe, setRpe] = useState(set.rpe || 8);
  const [setType, setSetType] = useState<SetType>((set.setType as SetType) || "normal");
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  // Sync local state if prop changes upstream
  useEffect(() => {
    setReps(set.reps);
    setWeight(set.weight);
    if (set.setType) setSetType(set.setType as SetType);
  }, [set]);

  // Pre-fill history if empty (Auto-Fill)
  useEffect(() => {
    if (lastPerformance && !set.completedAt && weight === 0) {
      setWeight(lastPerformance.weight);
      setReps(lastPerformance.reps);
    }
  }, [lastPerformance, set.completedAt]); // Run once when history loads or if it changes (rare)

  const handleComplete = () => {
    onChange?.({ reps, weight, rpe, setType });
    onComplete?.();
  };

  const handleSetTypeChange = (newType: SetType) => {
    setSetType(newType);
    onChange?.({ setType: newType });
    setShowTypeMenu(false);
  };

  const currentTypeConfig = SET_TYPE_CONFIG[setType];

  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-2 items-center p-2 rounded-md transition-colors relative",
        set.completedAt ? "bg-green-500/10" : "bg-black/20"
      )}
    >
      {/* Set Number + Type Indicator */}
      <div className="col-span-1 text-center relative">
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className={cn(
            "font-bold transition-colors",
            currentTypeConfig.color
          )}
          title={`Set Type: ${currentTypeConfig.label}`}
        >
          {currentTypeConfig.icon || displayIndex}
          {!currentTypeConfig.icon && (
            <span className="text-zinc-500">{displayIndex}</span>
          )}
        </button>

        {/* Set Type Dropdown */}
        {showTypeMenu && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[100px]">
            {Object.entries(SET_TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleSetTypeChange(type as SetType)}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-700 transition-colors flex items-center gap-2",
                  setType === type && "bg-zinc-700"
                )}
              >
                <span>{config.icon || "○"}</span>
                <span className={config.color}>{config.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weight Input */}
      <div className="col-span-3 relative">
        <input
          type="number"
          value={weight || ""}
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          placeholder={lastPerformance ? `${lastPerformance.weight}kg` : "kg"}
          className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono relative z-10"
        />
      </div>

      {/* Reps Input */}
      <div className="col-span-3">
        <input
          type="number"
          value={reps || ""}
          onChange={(e) => setReps(parseFloat(e.target.value) || 0)}
          placeholder={lastPerformance ? `${lastPerformance.reps}` : "reps"}
          className={cn(
            "w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono",
            setType === "failure" && "text-orange-400 font-bold"
          )}
        />
      </div>

      {/* RPE Input */}
      <div className="col-span-3">
        <input
          type="number"
          value={rpe || ""}
          onChange={(e) => setRpe(parseFloat(e.target.value) || 0)}
          placeholder="RPE"
          className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono text-xs text-zinc-400"
        />
      </div>

      {/* Complete Button */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button
          onClick={handleComplete}
          className={cn(
            "transition-colors",
            set.completedAt ? "text-green-500" : "text-zinc-500 hover:text-white"
          )}
        >
          {set.completedAt ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

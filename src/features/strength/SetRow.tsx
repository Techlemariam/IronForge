"use client";

import React, { useState, useEffect } from "react";
import { SetData } from "@/actions/training/strength";
import { Trash2, CheckCircle, Circle } from "lucide-react";

interface SetRowProps {
  index: number;
  set: SetData;
  onChange: (updates: Partial<SetData>) => void;
  onDelete: () => void;
  onComplete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  index,
  set,
  onChange,
  onDelete,
  onComplete,
}) => {
  const [reps, setReps] = useState(set.reps || 0);
  const [weight, setWeight] = useState(set.weight || 0);
  const [rpe, setRpe] = useState(set.rpe || 8);

  // Sync local state if prop changes upstream
  useEffect(() => {
    setReps(set.reps);
    setWeight(set.weight);
  }, [set]);

  const handleComplete = () => {
    onChange({ reps, weight, rpe }); // Commit values
    onComplete();
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md transition-colors ${set.completedAt ? "bg-green-500/10" : "bg-black/20"}`}
    >
      <div className="col-span-1 text-center font-bold text-zinc-500">
        {index + 1}
      </div>

      <div className="col-span-3">
        <input
          type="number"
          value={weight || ""}
          onChange={(e) => setWeight(parseFloat(e.target.value))}
          placeholder="kg"
          className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono"
        />
      </div>

      <div className="col-span-3">
        <input
          type="number"
          value={reps || ""}
          onChange={(e) => setReps(parseFloat(e.target.value))}
          placeholder="reps"
          className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono"
        />
      </div>

      <div className="col-span-3">
        <input
          type="number"
          value={rpe || ""}
          onChange={(e) => setRpe(parseFloat(e.target.value))}
          placeholder="RPE"
          className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono text-xs text-zinc-400"
        />
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2">
        <button
          onClick={handleComplete}
          className={`transition-colors ${set.completedAt ? "text-green-500" : "text-zinc-500 hover:text-white"}`}
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

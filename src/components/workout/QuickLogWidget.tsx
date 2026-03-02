"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface QuickLogEntry {
  weight: number;
  reps: number;
  rpe?: number;
}

interface QuickLogWidgetProps {
  exerciseName: string;
  lastSet?: QuickLogEntry;
  onLog: (entry: QuickLogEntry) => void;
  onClose?: () => void;
}

const QUICK_WEIGHTS = [2.5, 5, 10, 20];
const QUICK_REPS = [1, 2, 3, 5, 8, 10, 12, 15];

export function QuickLogWidget({
  exerciseName,
  lastSet,
  onLog,
  onClose,
}: QuickLogWidgetProps) {
  const [weight, setWeight] = useState(lastSet?.weight || 60);
  const [reps, setReps] = useState(lastSet?.reps || 10);
  const [rpe, setRpe] = useState<number | undefined>(undefined);

  const adjustWeight = useCallback((delta: number) => {
    setWeight((prev) => Math.max(0, prev + delta));
  }, []);

  const handleLog = useCallback(() => {
    onLog({ weight, reps, rpe });
  }, [weight, reps, rpe, onLog]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl p-4 shadow-2xl z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{exerciseName}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        )}
      </div>

      {/* Weight Section */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Weight (kg)</label>
        <div className="flex items-center gap-2">
          {QUICK_WEIGHTS.map((delta) => (
            <button
              key={`-${delta}`}
              onClick={() => adjustWeight(-delta)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white"
            >
              -{delta}
            </button>
          ))}
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-20 text-center bg-gray-800 border border-gray-600 rounded py-2 text-white text-lg font-bold"
          />
          {QUICK_WEIGHTS.map((delta) => (
            <button
              key={`+${delta}`}
              onClick={() => adjustWeight(delta)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white"
            >
              +{delta}
            </button>
          ))}
        </div>
      </div>

      {/* Reps Section */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Reps</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_REPS.map((r) => (
            <button
              key={r}
              onClick={() => setReps(r)}
              className={`px-4 py-2 rounded font-bold ${
                reps === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-16 text-center bg-gray-800 border border-gray-600 rounded py-2 text-white"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* RPE (Optional) */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">
          RPE (optional)
        </label>
        <div className="flex gap-1">
          {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((r) => (
            <button
              key={r}
              onClick={() => setRpe(rpe === r ? undefined : r)}
              className={`px-2 py-1 rounded text-sm ${
                rpe === r
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Log Button */}
      <button
        onClick={handleLog}
        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2"
      >
        <span>✓</span>
        <span>
          Log Set ({weight}kg × {reps})
        </span>
      </button>
    </motion.div>
  );
}

export default QuickLogWidget;

import React, { useState, useEffect } from "react";
import { Minus, Plus, Zap, Shield, Target } from "lucide-react";
import { playSound } from "../../utils";

interface SetLogFormProps {
  targetWeight: number;
  targetReps: number | string;
  targetRPE: number;
  previousWeight?: number;
  onLog: (weight: number, reps: number, rpe: number) => void;
}

const SetLogForm: React.FC<SetLogFormProps> = ({
  targetWeight,
  targetReps,
  targetRPE,
  previousWeight,
  onLog,
}) => {
  // Initialize state with targets (smart defaults)
  const [weight, setWeight] = useState(previousWeight || targetWeight);
  const [reps, setReps] = useState(
    typeof targetReps === "number" ? targetReps : 0,
  );
  const [rpe, setRpe] = useState<number | null>(null);

  // Plate math increments
  const adjustWeight = (amount: number) =>
    setWeight((prev) => Math.max(0, prev + amount));
  const adjustReps = (amount: number) =>
    setReps((prev) => Math.max(0, prev + amount));

  const handleLog = () => {
    if (rpe !== null) {
      playSound("ding");
      onLog(weight, reps, rpe);
    } else {
      playSound("fail"); // Feedback if RPE missing
    }
  };

  return (
    <div className="bg-[#0f1012] border-2 border-forge-border rounded-lg p-4 shadow-xl relative overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
        <Zap className="w-24 h-24 text-zinc-500" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* ROW 1: METRICS CONTROL */}
        <div className="grid grid-cols-2 gap-4">
          {/* WEIGHT CONTROL */}
          <div className="bg-[#050505] p-2 rounded border border-zinc-800 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3" /> Load (kg)
            </span>
            <div className="flex items-center w-full justify-between">
              <button
                onClick={() => adjustWeight(-2.5)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded hover:bg-red-900/30 hover:border-red-700 text-zinc-400 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5 mx-auto" />
              </button>
              <span className="text-3xl font-mono font-bold text-white tracking-tighter">
                {weight}
              </span>
              <button
                onClick={() => adjustWeight(2.5)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded hover:bg-green-900/30 hover:border-green-700 text-zinc-400 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => adjustWeight(-10)}
                className="text-[10px] text-zinc-600 font-mono px-2 border border-zinc-800 rounded hover:text-white"
              >
                -10
              </button>
              <button
                onClick={() => adjustWeight(10)}
                className="text-[10px] text-zinc-600 font-mono px-2 border border-zinc-800 rounded hover:text-white"
              >
                +10
              </button>
            </div>
          </div>

          {/* REPS CONTROL */}
          <div className="bg-[#050505] p-2 rounded border border-zinc-800 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-1">
              <Target className="w-3 h-3" /> Reps
            </span>
            <div className="flex items-center w-full justify-between">
              <button
                onClick={() => adjustReps(-1)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded hover:bg-red-900/30 hover:border-red-700 text-zinc-400 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5 mx-auto" />
              </button>
              <span className="text-3xl font-mono font-bold text-white tracking-tighter">
                {reps}
              </span>
              <button
                onClick={() => adjustReps(1)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded hover:bg-green-900/30 hover:border-green-700 text-zinc-400 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              Target: {targetReps}
            </div>
          </div>
        </div>

        {/* ROW 2: RPE SELECTOR (KEYPAD) */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
              Rate Perceived Exertion
            </span>
            {rpe && (
              <span className="text-xs font-mono font-bold text-magma">
                RPE {rpe} Selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                onClick={() => setRpe(val)}
                className={`h-12 rounded border-2 font-mono font-bold text-lg transition-all duration-200 
                            ${
                              rpe === val
                                ? "bg-magma border-magma-glow text-white shadow-[0_0_15px_#ff4500] translate-y-[-2px]"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                            }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleLog}
          disabled={rpe === null}
          className={`w-full py-4 font-black text-xl uppercase tracking-[0.2em] rounded clip-path-polygon transition-all duration-300
                ${
                  rpe !== null
                    ? "bg-gradient-to-r from-magma to-orange-600 text-white shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_30px_rgba(255,69,0,0.6)] hover:scale-[1.01]"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }
            `}
          style={{
            clipPath:
              "polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)",
          }} // Industrial cut corners
        >
          {rpe !== null ? "Confirm Log" : "Select RPE"}
        </button>
      </div>
    </div>
  );
};

export default SetLogForm;

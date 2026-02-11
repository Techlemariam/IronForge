import React, { useEffect, useState } from "react";
import { Exercise, Set as WorkoutSet, ExerciseLogic } from "@/types";
import {
  CheckCircle2,
  Dumbbell,
  Skull,
  Crown,
  Star,
  Sparkles,
} from "lucide-react";
import SetLogForm from "./SetLogForm";

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  index: number;
  onSetLog: (weight: number, reps: number, rpe: number) => void;
  activeRef?: React.RefObject<HTMLDivElement> | null;
}

interface SetItemProps {
  set: WorkoutSet;
  index: number;
  isActive: boolean;
  calculateTargetLoad: (s: WorkoutSet) => number;
}

// --- SUB-COMPONENT FOR ANIMATED SET ROW ---
const SetItem: React.FC<SetItemProps> = ({
  set,
  index,
  isActive,
  calculateTargetLoad,
}) => {
  const [animateClass, setAnimateClass] = useState("");

  // Trigger animation when set becomes completed
  useEffect(() => {
    if (set.completed) {
      // Impact Frame
      setAnimateClass("scale-105 brightness-150 z-10");
      const t = setTimeout(() => setAnimateClass(""), 300);
      return () => clearTimeout(t);
    }
  }, [set.completed]);

  const isDone = set.completed;
  const tLoad = calculateTargetLoad(set);

  const getRarityStyles = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-zinc-950 to-legend/10 border-legend text-legend shadow-[0_0_20px_rgba(255,128,0,0.3)]";
      case "epic":
        return "bg-gradient-to-r from-zinc-950 to-warp/10 border-warp text-warp shadow-[0_0_15px_rgba(163,53,238,0.2)]";
      case "rare":
        return "border-pulse text-pulse shadow-[0_0_10px_rgba(0,112,221,0.1)]";
      case "uncommon":
        return "border-venom text-venom";
      default:
        return "border-zinc-800 text-zinc-600";
    }
  };

  const rarityClass = isDone
    ? getRarityStyles(set.rarity)
    : "border-zinc-800 text-zinc-600 bg-zinc-950";

  return (
    <div
      className={`relative flex items-center justify-between p-3 rounded border transition-all duration-300 ${rarityClass} ${isActive ? "bg-armor/80 border-l-4 border-l-plasma" : ""} ${animateClass}`}
    >
      {/* Loot Beam Effect for Legendary/Epic */}
      {isDone && (set.rarity === "legendary" || set.rarity === "epic") && (
        <div className="absolute inset-0 overflow-hidden rounded pointer-events-none">
          <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
        </div>
      )}

      <div className="flex items-center gap-3 relative z-10">
        <span
          className={`font-mono text-xs font-bold w-6 ${isActive ? "text-white" : ""}`}
        >
          {index + 1}
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            {isDone ? (
              <>
                <span>{set.completedReps} reps</span>
                {set.rarity === "legendary" && (
                  <span className="text-[9px] bg-legend text-black px-1 rounded font-black animate-pulse">
                    PR
                  </span>
                )}
              </>
            ) : (
              `Goal: ${set.reps} reps`
            )}
          </span>
          <span className="text-[10px] font-mono opacity-70">
            {isDone ? `Load: ${set.weight}kg` : `Load: ${tLoad}kg`}
          </span>
        </div>
      </div>

      {isDone && set.rarity && set.rarity !== "common" && (
        <div className="flex items-center gap-1 animate-bounce-short relative z-10">
          {set.rarity === "legendary" && (
            <Crown className="w-4 h-4 fill-current drop-shadow-md" />
          )}
          {set.rarity === "epic" && (
            <Skull className="w-4 h-4 fill-current drop-shadow-md" />
          )}
          {set.rarity === "rare" && (
            <Sparkles className="w-4 h-4 fill-current" />
          )}
          <span className="text-[9px] font-black uppercase tracking-widest">
            {set.rarity}
          </span>
        </div>
      )}

      {isActive && !isDone && (
        <div className="text-[9px] text-plasma font-bold animate-pulse">
          ENGAGED
        </div>
      )}
    </div>
  );
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isActive,
  isCompleted,
  // isFuture,
  index,
  onSetLog,
  activeRef,
}) => {
  const activeSetIndex = exercise.sets.findIndex((s) => !s.completed);
  const activeSet = exercise.sets[activeSetIndex];

  const calculateTargetLoad = (set: WorkoutSet) => {
    if (
      exercise.logic === ExerciseLogic.TM_PERCENT &&
      exercise.trainingMax &&
      set.weightPct
    ) {
      return Math.round((exercise.trainingMax * set.weightPct) / 2.5) * 2.5;
    }
    return set.weight || 0;
  };

  // --- ACTIVE ENCOUNTER VIEW ---
  if (isActive) {
    const targetLoad = activeSet ? calculateTargetLoad(activeSet) : 0;

    return (
      <div ref={activeRef} className="relative animate-slide-up">
        {/* ENCOUNTER HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center rounded border-2 transform rotate-45 bg-plasma border-plasma/50 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <span className="transform -rotate-45 font-mono font-bold text-lg">
              {index + 1}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {exercise.name}
            </h2>
            {exercise.trainingMax && (
              <div className="flex items-center gap-2 text-xs font-mono text-steel mt-1">
                <span className="bg-void px-2 py-0.5 rounded border border-steel/20">
                  TM: {exercise.trainingMax}kg
                </span>
                {exercise.instructions && (
                  <span>• {exercise.instructions[0]}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BATTLE STATION (CONTROLS) */}
        <div className="space-y-6">
          {activeSet && (
            <SetLogForm
              targetWeight={targetLoad}
              targetReps={activeSet.reps}
              targetRPE={8}
              previousWeight={undefined}
              onLog={onSetLog}
            />
          )}

          {/* UPCOMING WAVES (REMAINING SETS) */}
          <div className="bg-armor/30 border border-steel/20 rounded p-4 relative">
            <h3 className="text-[10px] font-bold uppercase text-steel tracking-widest mb-3 border-b border-steel/20 pb-1">
              Encounter Log
            </h3>
            <div className="space-y-2">
              {exercise.sets.map((set, sIdx) => (
                <SetItem
                  key={set.id}
                  set={set}
                  index={sIdx}
                  isActive={sIdx === activeSetIndex}
                  calculateTargetLoad={calculateTargetLoad}
                />
              ))}
            </div>
          </div>
        </div>

        <style>{`
            @keyframes shine {
                from { transform: translateX(0) skewX(-15deg); }
                to { transform: translateX(250%) skewX(-15deg); }
            }
            .animate-shine {
                animation: shine 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes bounceShort {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            .animate-bounce-short {
                animation: bounceShort 0.5s ease-in-out;
            }
        `}</style>
      </div>
    );
  }

  // --- COMPLETED ENCOUNTER VIEW ---
  if (isCompleted) {
    const maxWeight = Math.max(...exercise.sets.map((s) => s.weight || 0));
    const totalReps = exercise.sets.reduce(
      (acc, s) => acc + (s.completedReps || 0),
      0,
    );

    return (
      <div className="group transition-all duration-500 opacity-60 hover:opacity-100 hover:scale-[1.01]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 flex items-center justify-center rounded border-2 border-venom/30 bg-venom/10 text-venom transform rotate-45 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="w-5 h-5 transform -rotate-45" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-steel group-hover:text-white transition-colors">
            {exercise.name}
          </h2>
        </div>

        <div className="bg-armor/50 border-l-4 border-venom p-4 rounded ml-4 relative overflow-hidden group-hover:bg-armor transition-colors">
          <div className="relative z-10 flex items-center gap-6 text-xs text-steel font-mono">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-3 h-3 text-steel/60 group-hover:text-steel" />
              <span>Volume: {totalReps} Reps</span>
            </div>
            <div className="flex items-center gap-2">
              <Skull className="w-3 h-3 text-steel/60 group-hover:text-steel" />
              <span>Peak Load: {maxWeight}kg</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-venom font-bold tracking-widest text-[10px] uppercase">
                Quest Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FUTURE (FOG OF WAR) VIEW ---
  return (
    <div className="opacity-30 blur-[1px] grayscale transition-all duration-700 select-none pointer-events-none">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center rounded border-2 border-zinc-800 bg-zinc-950 text-zinc-700 transform rotate-45">
          <span className="transform -rotate-45 font-mono font-bold text-sm">
            {index + 1}
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-700">
          {exercise.name}
        </h2>
      </div>
      <div className="ml-4 h-12 bg-zinc-900/50 rounded border border-zinc-800 flex items-center px-4">
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2">
          <Star className="w-3 h-3" /> Locked
        </span>
      </div>
    </div>
  );
};

export default ExerciseCard;

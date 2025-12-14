
import React from 'react';
import { Exercise, Set as WorkoutSet, ExerciseLogic } from '../../types';
import { CheckCircle2, Dumbbell, Skull, Crown } from 'lucide-react';
import SetLogForm from './SetLogForm';
import { calculateRarity } from '../../utils';

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  index: number;
  onSetLog: (weight: number, reps: number, rpe: number) => void;
  activeRef?: React.RefObject<HTMLDivElement> | null;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  isActive, 
  isCompleted, 
  isFuture, 
  index, 
  onSetLog,
  activeRef 
}) => {
  
  // Find the current active set for this exercise
  const activeSetIndex = exercise.sets.findIndex(s => !s.completed);
  const activeSet = exercise.sets[activeSetIndex];

  // Helper to calculate target load based on TM logic
  const calculateTargetLoad = (set: WorkoutSet) => {
      if (exercise.logic === ExerciseLogic.TM_PERCENT && exercise.trainingMax && set.weightPct) {
          // Round to nearest 2.5kg
          return Math.round((exercise.trainingMax * set.weightPct) / 2.5) * 2.5;
      }
      return set.weight || 0;
  };

  const getRarityColor = (rarity?: string) => {
      switch(rarity) {
          case 'legendary': return 'text-[#ff8000] border-[#ff8000] shadow-[0_0_10px_#ff8000]';
          case 'epic': return 'text-[#a335ee] border-[#a335ee]';
          case 'rare': return 'text-[#0070dd] border-[#0070dd]';
          case 'uncommon': return 'text-[#1eff00] border-[#1eff00]';
          default: return 'text-zinc-400 border-zinc-700';
      }
  };

  // --- ACTIVE ENCOUNTER VIEW ---
  if (isActive) {
    const targetLoad = activeSet ? calculateTargetLoad(activeSet) : 0;

    return (
      <div 
        ref={activeRef}
        className="relative animate-slide-up"
      >
        {/* ENCOUNTER HEADER */}
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded border-2 transform rotate-45 bg-magma border-magma-glow text-white shadow-[0_0_15px_#ff4500]">
                <span className="transform -rotate-45 font-mono font-bold text-lg">{index + 1}</span>
            </div>
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {exercise.name}
                </h2>
                {exercise.trainingMax && (
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-1">
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">TM: {exercise.trainingMax}kg</span>
                        {exercise.instructions && <span>• {exercise.instructions[0]}</span>}
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
                    previousWeight={undefined} // Could look up history here
                    onLog={onSetLog}
                />
            )}

            {/* UPCOMING WAVES (REMAINING SETS) */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded p-4">
                <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-3 border-b border-zinc-800 pb-1">Encounter Log</h3>
                <div className="space-y-2">
                    {exercise.sets.map((set, sIdx) => {
                        const isCurrent = sIdx === activeSetIndex;
                        const isDone = set.completed;
                        const tLoad = calculateTargetLoad(set);
                        
                        const rarityClass = isDone ? getRarityColor(set.rarity) : 'border-zinc-800 text-zinc-600';
                        
                        return (
                            <div 
                                key={set.id} 
                                className={`flex items-center justify-between p-3 rounded border transition-all ${rarityClass} ${isCurrent ? 'bg-zinc-800/80 border-l-4 border-l-magma' : 'bg-zinc-950'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono text-xs font-bold w-6 ${isCurrent ? 'text-white' : ''}`}>
                                        {sIdx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {isDone ? `Result: ${set.completedReps} reps` : `Goal: ${set.reps} reps`}
                                        </span>
                                        <span className="text-[10px] font-mono opacity-70">
                                            {isDone ? `Load: ${set.weight}kg` : `Load: ${tLoad}kg`}
                                        </span>
                                    </div>
                                </div>
                                {isDone && set.rarity && set.rarity !== 'common' && (
                                    <div className="flex items-center gap-1 animate-pulse">
                                        {set.rarity === 'legendary' && <Crown className="w-3 h-3 text-[#ff8000]" />}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{set.rarity}</span>
                                    </div>
                                )}
                                {isCurrent && <div className="text-[9px] text-magma font-bold animate-pulse">ENGAGED</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- COMPLETED ENCOUNTER VIEW ---
  if (isCompleted) {
    const maxWeight = Math.max(...exercise.sets.map(s => s.weight || 0));
    const totalReps = exercise.sets.reduce((acc, s) => acc + (s.completedReps || 0), 0);

    return (
        <div className="group transition-all duration-500 opacity-60 hover:opacity-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 flex items-center justify-center rounded border-2 border-zinc-700 bg-zinc-900 text-zinc-500 transform rotate-45">
                    <CheckCircle2 className="w-5 h-5 transform -rotate-45" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {exercise.name}
                </h2>
            </div>
            
            <div className="bg-zinc-900 border-l-4 border-green-900 p-4 rounded ml-4 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6 text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-3 h-3 text-zinc-600" />
                        <span>Volume: {totalReps} Reps</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skull className="w-3 h-3 text-zinc-600" />
                        <span>Peak Load: {maxWeight}kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-500 font-bold">QUEST COMPLETE</span>
                    </div>
                </div>
                {/* Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            </div>
        </div>
    );
  }

  // --- FUTURE (FOG OF WAR) VIEW ---
  return (
      <div className="opacity-30 blur-[1px] grayscale transition-all duration-700 select-none">
          <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded border-2 border-zinc-800 bg-zinc-950 text-zinc-700 transform rotate-45">
                    <span className="transform -rotate-45 font-mono font-bold text-sm">{index + 1}</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-700">
                    {exercise.name}
                </h2>
          </div>
          <div className="ml-4 h-12 bg-zinc-900/50 rounded border border-zinc-800 flex items-center px-4">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Locked • Complete previous encounter to unlock</span>
          </div>
      </div>
  );
};

export default ExerciseCard;

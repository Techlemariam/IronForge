
import React, { useState, useEffect, useRef } from 'react';
import { Session, Block, Exercise, ExerciseLogic, Set as WorkoutSet } from '../types';
import { Sword, Lock, CheckCircle2, Crown, Scroll, Clock, Skull, Dumbbell } from 'lucide-react';
import SetLogForm from './ui/SetLogForm';
import { calculateRarity, playSound, fireConfetti, roundToPlates } from '../utils';

interface QuestLogProps {
  session: Session;
  onComplete: () => void;
  onAbort: () => void;
}

const Quest_Log: React.FC<QuestLogProps> = ({ session, onComplete, onAbort }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeExIndex, setActiveExIndex] = useState(0);
  const activeRef = useRef<HTMLDivElement>(null);

  // Flatten the session blocks into a linear list of exercises for the "Map"
  // We attach a block reference to know where they came from if needed
  useEffect(() => {
    const flatList: Exercise[] = [];
    session.blocks.forEach(block => {
        if (block.exercises) {
            block.exercises.forEach(ex => flatList.push({ ...ex })); // Shallow copy to track state locally
        }
    });
    setExercises(flatList);
  }, [session]);

  // Scroll to active
  useEffect(() => {
    if (activeRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeExIndex]);

  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    const currentEx = exercises[activeExIndex];
    // Find first incomplete set
    const setIndex = currentEx.sets.findIndex(s => !s.completed);
    
    if (setIndex === -1) return; // Should not happen

    const updatedExercises = [...exercises];
    const targetSet = updatedExercises[activeExIndex].sets[setIndex];
    
    // Update Set Data
    targetSet.completed = true;
    targetSet.weight = weight;
    targetSet.completedReps = reps;
    // RPE isn't strictly on the type yet but we can assume it for rarity calc or add it to types later.
    // For now we use it for rarity logic implicitly.
    
    // Rarity Calculation
    // Logic: PR zone = Epic. Beating target reps = Rare. Standard = Common.
    let rarity = calculateRarity(targetSet, currentEx.logic);
    if (rpe >= 9.5) rarity = 'legendary'; 
    targetSet.rarity = rarity;

    setExercises(updatedExercises);

    // Audio/Visual Feedback based on Rarity
    if (rarity === 'legendary') {
        playSound('loot_epic');
        fireConfetti();
    } else if (rarity === 'epic' || rarity === 'rare') {
        playSound('loot_epic');
    } else {
        playSound('ding');
    }

    // Check if Exercise is Complete
    const allComplete = updatedExercises[activeExIndex].sets.every(s => s.completed);
    if (allComplete) {
        if (activeExIndex < exercises.length - 1) {
            setTimeout(() => setActiveExIndex(prev => prev + 1), 1000); // Delay for visual satisfaction
        } else {
            // DUNGEON CLEARED
            playSound('ding');
            setTimeout(onComplete, 1500);
        }
    }
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

  const calculateTargetLoad = (ex: Exercise, set: WorkoutSet) => {
      if (ex.logic === ExerciseLogic.TM_PERCENT && ex.trainingMax && set.weightPct) {
          return roundToPlates(ex.trainingMax * set.weightPct);
      }
      return set.weight || 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] pb-24 font-serif">
      
      {/* Header / Dungeon Name */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#46321d] p-4 flex justify-between items-center shadow-2xl">
          <div>
              <h1 className="text-xl font-bold text-[#c79c6e] uppercase tracking-widest">{session.name}</h1>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{session.zoneName || 'The Iron Mines'}</span>
          </div>
          <button onClick={onAbort} className="text-zinc-600 hover:text-red-500 font-bold text-xs uppercase">Abandon</button>
      </div>

      <div className="p-4 space-y-12">
        {exercises.map((ex, index) => {
            const isActive = index === activeExIndex;
            const isCompleted = index < activeExIndex;
            const isFuture = index > activeExIndex;
            
            // Current Active Set (if active)
            const activeSetIndex = ex.sets.findIndex(s => !s.completed);
            const activeSet = ex.sets[activeSetIndex];
            const targetLoad = activeSet ? calculateTargetLoad(ex, activeSet) : 0;

            return (
                <div 
                    key={ex.id} 
                    ref={isActive ? activeRef : null}
                    className={`transition-all duration-700 ${isFuture ? 'opacity-30 blur-[2px] grayscale' : 'opacity-100'}`}
                >
                    {/* ENCOUNTER HEADER */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded border-2 transform rotate-45 ${isActive ? 'bg-magma border-magma-glow text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-600'}`}>
                            <span className="transform -rotate-45 font-mono font-bold">{index + 1}</span>
                        </div>
                        <h2 className={`text-2xl font-black uppercase tracking-tight ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-500'}`}>
                            {ex.name}
                        </h2>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />}
                    </div>

                    {/* ACTIVE CARD */}
                    {isActive && (
                        <div className="space-y-6 animate-slide-up">
                            {/* ACTIVE SET FORM */}
                            {activeSet && (
                                <SetLogForm 
                                    targetWeight={targetLoad}
                                    targetReps={activeSet.reps}
                                    targetRPE={8} 
                                    previousWeight={index > 0 ? undefined : undefined} // Could fetch history here
                                    onLog={handleSetLog}
                                />
                            )}

                            {/* REMAINING SETS PREVIEW */}
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded p-4">
                                <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-2">Encounter Progress</h3>
                                <div className="space-y-2">
                                    {ex.sets.map((set, sIdx) => {
                                        const isCurrent = sIdx === activeSetIndex;
                                        const isDone = set.completed;
                                        const tLoad = calculateTargetLoad(ex, set);
                                        
                                        // Loot Styles
                                        const rarityClass = isDone ? getRarityColor(set.rarity) : 'border-zinc-800 text-zinc-600';
                                        
                                        return (
                                            <div 
                                                key={set.id} 
                                                className={`flex items-center justify-between p-3 rounded border transition-all ${rarityClass} ${isCurrent ? 'bg-zinc-800/50 border-l-4 border-l-magma' : 'bg-zinc-950'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs font-bold w-6">{sIdx + 1}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold uppercase tracking-wider">
                                                            {isDone ? `Logged: ${set.completedReps} reps` : `Goal: ${set.reps} reps`}
                                                        </span>
                                                        <span className="text-[10px] font-mono opacity-70">
                                                            {isDone ? `@ ${set.weight}kg` : `@ ${tLoad}kg`}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isDone && set.rarity && set.rarity !== 'common' && (
                                                    <div className="flex items-center gap-1">
                                                        {set.rarity === 'legendary' && <Crown className="w-3 h-3 text-[#ff8000]" />}
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{set.rarity}</span>
                                                    </div>
                                                )}
                                                {isCurrent && <div className="text-[9px] text-magma font-bold animate-pulse">ACTIVE</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMPLETED CARD (COLLAPSED) */}
                    {isCompleted && (
                        <div className="bg-zinc-900 border-l-4 border-green-900 p-4 rounded opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
                                <div className="flex items-center gap-1">
                                    <Dumbbell className="w-3 h-3" />
                                    <span>{ex.sets.length} Sets Completed</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Skull className="w-3 h-3" />
                                    <span>Max Load: {Math.max(...ex.sets.map(s => s.weight || 0))}kg</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
        })}
        
        {/* Footer Filler */}
        <div className="h-32 flex items-center justify-center text-zinc-800 text-4xl font-black uppercase opacity-20 select-none">
            IronForge
        </div>
      </div>
    </div>
  );
};

export default Quest_Log;

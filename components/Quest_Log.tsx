
import React, { useState, useEffect, useRef } from 'react';
import { Session, Exercise, Set as WorkoutSet, ExerciseLogic, ExerciseLog } from '../types';
import { playSound, fireConfetti } from '../utils';
import { calculateE1RM } from '../utils/math';
import { determineRarity } from '../utils/loot';
import ExerciseCard from './ui/ExerciseCard';

interface QuestLogProps {
  session: Session;
  history: ExerciseLog[]; // Required for Global PR calculation
  onComplete: () => void;
  onAbort: () => void;
}

const Quest_Log: React.FC<QuestLogProps> = ({ session, history = [], onComplete, onAbort }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeExIndex, setActiveExIndex] = useState(0);
  const activeRef = useRef<HTMLDivElement>(null);

  // Flatten the session blocks into a linear list of exercises for the "Map"
  useEffect(() => {
    const flatList: Exercise[] = [];
    if (session && session.blocks) {
        session.blocks.forEach(block => {
            if (block.exercises) {
                block.exercises.forEach(ex => flatList.push({ ...ex })); // Shallow copy to track state locally
            }
        });
    }
    setExercises(flatList);
  }, [session]);

  // Scroll to active exercise when index changes
  useEffect(() => {
    if (activeRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeExIndex]);

  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    const currentEx = exercises[activeExIndex];
    if (!currentEx) return;

    // Find first incomplete set
    // Guard sets array to prevent crashes if sets is undefined
    const currentSets = currentEx.sets || [];
    const setIndex = currentSets.findIndex(s => !s.completed);
    
    if (setIndex === -1) return; // Should not happen

    const updatedExercises = [...exercises];
    // Ensure we are working with a valid set object
    if (!updatedExercises[activeExIndex] || !updatedExercises[activeExIndex].sets[setIndex]) return;
    
    const targetSet = { ...updatedExercises[activeExIndex].sets[setIndex] };
    
    // --- 1. CALCULATE CONTEXT DATA ---
    
    // A. Global PR (From History)
    // Defensive check for history existence (Safe Array)
    const safeHistory = Array.isArray(history) ? history : [];
    const globalPr = safeHistory
        .filter(h => h.exerciseId === currentEx.id)
        .reduce((max, h) => Math.max(max, h.e1rm), 0);

    // B. Session PR (From current session sets so far)
    const sessionPr = currentSets
        .filter(s => s.completed && s.e1rm)
        .reduce((max, s) => Math.max(max, s.e1rm || 0), 0);

    // C. Current Performance
    const currentE1RM = calculateE1RM(weight, reps, rpe);

    // D. Target RPE (Default to 8 if not specified)
    // Check if target set has specific RPE instruction, otherwise assume 8
    const targetRpe = targetSet.isPrZone ? 9 : 8;

    // --- 2. DETERMINE RARITY ---
    const rarity = determineRarity(weight, reps, rpe, targetRpe, globalPr, sessionPr);

    // --- 3. UPDATE STATE ---
    targetSet.completed = true;
    targetSet.weight = weight;
    targetSet.completedReps = reps;
    targetSet.rarity = rarity;
    targetSet.e1rm = currentE1RM;

    // Update the set in the exercise
    updatedExercises[activeExIndex].sets[setIndex] = targetSet;

    setExercises(updatedExercises);

    // --- 4. FEEDBACK ---
    if (rarity === 'legendary') {
        playSound('loot_epic');
        fireConfetti();
    } else if (rarity === 'epic' || rarity === 'rare') {
        playSound('loot_epic');
    } else {
        playSound('ding');
    }

    // --- 5. PROGRESSION LOGIC ---
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

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] font-serif overflow-y-auto overflow-x-hidden relative scroll-smooth">
      
      {/* Header / Dungeon Name */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#46321d] p-4 flex justify-between items-center shadow-lg">
          <div>
              <h1 className="text-xl font-bold text-[#c79c6e] uppercase tracking-widest">{session.name}</h1>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{session.zoneName || 'The Iron Mines'}</span>
          </div>
          <button 
            type="button"
            onClick={onAbort} 
            className="text-zinc-600 hover:text-red-500 font-bold text-xs uppercase active:scale-95 transition-transform p-2 border border-transparent hover:border-red-900/30 rounded"
          >
            Abandon
          </button>
      </div>

      <div className="p-4 space-y-8 pb-32">
        {exercises.map((ex, index) => {
            const isActive = index === activeExIndex;
            const isCompleted = index < activeExIndex;
            const isFuture = index > activeExIndex;
            
            return (
                <div key={ex.id}>
                    <ExerciseCard 
                        exercise={ex}
                        isActive={isActive}
                        isCompleted={isCompleted}
                        isFuture={isFuture}
                        index={index}
                        onSetLog={handleSetLog}
                        activeRef={isActive ? activeRef : null}
                    />
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

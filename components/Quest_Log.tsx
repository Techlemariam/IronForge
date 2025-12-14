
import React, { useState, useEffect, useRef } from 'react';
import { Session, Exercise, Set as WorkoutSet, ExerciseLogic } from '../types';
import { playSound, fireConfetti, calculateRarity } from '../utils';
import ExerciseCard from './ui/ExerciseCard';

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
  useEffect(() => {
    const flatList: Exercise[] = [];
    session.blocks.forEach(block => {
        if (block.exercises) {
            block.exercises.forEach(ex => flatList.push({ ...ex })); // Shallow copy to track state locally
        }
    });
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
    // Find first incomplete set
    const setIndex = currentEx.sets.findIndex(s => !s.completed);
    
    if (setIndex === -1) return; // Should not happen

    const updatedExercises = [...exercises];
    const targetSet = updatedExercises[activeExIndex].sets[setIndex];
    
    // Update Set Data
    targetSet.completed = true;
    targetSet.weight = weight;
    targetSet.completedReps = reps;
    
    // Rarity Calculation
    let rarity = calculateRarity(targetSet, currentEx.logic);
    // Explicit override if RPE is maxed
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

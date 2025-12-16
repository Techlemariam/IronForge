import React, { useState, useEffect, useRef } from 'react';
import { Exercise, Set as WorkoutSet } from '../types/ironforge';
import { playSound, fireConfetti } from '../utils';
import { calculateE1RM } from '../utils/math';
import { determineRarity } from '../utils/loot';
import ExerciseCard from '../ui/ExerciseCard';
import BerserkerMode from './game/BerserkerMode';
import { saveQuestToHevy } from '../../services/hevy'; // Importera den nya servicen

interface QuestLogProps {
  initialData: Exercise[];
  title: string;
  onComplete: () => void;
}

const Quest_Log: React.FC<QuestLogProps> = ({ initialData, title, onComplete }) => {
  const [exercises, setExercises] = useState<Exercise[]>(initialData);
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [isBerserkerActive, setBerserkerActive] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeExIndex]);

  const completeQuest = async () => {
    console.log("Quest Complete. Syncing to Hevy...");
    await saveQuestToHevy(title, exercises);
    
    // Den ursprungliga onComplete-logiken (ljud, confetti, etc.)
    playSound('loot_legendary'); // Uppgraderat ljud för quest complete!
    fireConfetti();
    setTimeout(onComplete, 1000); // Gå tillbaka till dashboarden
  };

  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    const currentEx = exercises[activeExIndex];
    if (!currentEx) return;

    const currentSets = currentEx.sets || [];
    const setIndex = currentSets.findIndex(s => !s.completed);
    
    if (setIndex === -1) return;

    const isLastExercise = activeExIndex === exercises.length - 1;
    const isLastSetOfExercise = setIndex === currentSets.length - 1;

    // Om det är sista setet på sista övningen, aktivera Berserker Mode
    if (isLastExercise && isLastSetOfExercise) {
        // Logga det sista setet först innan Berserker tar över
        const finalExercises = [...exercises];
        const finalSet = { ...finalExercises[activeExIndex].sets[setIndex] };
        finalSet.completed = true;
        finalSet.weight = weight;
        finalSet.completedReps = reps;
        // ... beräkna e1rm, rarity etc. för sista setet också ...
        finalExercises[activeExIndex].sets[setIndex] = finalSet;
        setExercises(finalExercises);
        
        // Aktivera sedan Berserker
        setBerserkerActive(true);
        return; 
    }

    const updatedExercises = [...exercises];
    const targetSet = { ...updatedExercises[activeExIndex].sets[setIndex] };

    const globalPr = 0;
    const sessionPr = currentSets
        .filter(s => s.completed && s.e1rm)
        .reduce((max, s) => Math.max(max, s.e1rm || 0), 0);

    const currentE1RM = calculateE1RM(weight, reps, rpe);
    const targetRpe = targetSet.targetRPE || 8;
    const rarity = determineRarity(weight, reps, rpe, targetRpe, globalPr, sessionPr);

    targetSet.completed = true;
    targetSet.weight = weight;
    targetSet.completedReps = reps;
    targetSet.rarity = rarity;
    targetSet.e1rm = currentE1RM;

    updatedExercises[activeExIndex].sets[setIndex] = targetSet;
    setExercises(updatedExercises);

    if (rarity === 'legendary') {
      playSound('loot_epic');
      fireConfetti();
    } else {
      playSound('ding');
    }

    const allSetsInExerciseComplete = updatedExercises[activeExIndex].sets.every(s => s.completed);
    if (allSetsInExerciseComplete) {
      setTimeout(() => setActiveExIndex(prev => prev + 1), 1000);
    }
  };

  const handleBerserkerFinish = () => {
    setBerserkerActive(false);
    completeQuest(); // Anropa den centraliserade complete-funktionen
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] font-serif overflow-y-auto overflow-x-hidden relative scroll-smooth">
      <BerserkerMode 
        isActive={isBerserkerActive}
        onFinish={handleBerserkerFinish}
        targetExercise={exercises[activeExIndex]?.name || 'Final Challenge'}
      />

      <div className={`transition-filter duration-500 ${isBerserkerActive ? 'blur-sm' : ''}`}>
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#46321d] p-4 flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-xl font-bold text-[#c79c6e] uppercase tracking-widest">{title}</h1>
          </div>
          <button 
            type="button"
            onClick={completeQuest} // Används för att överge eller slutföra manuellt
            className="text-zinc-600 hover:text-red-500 font-bold text-xs uppercase active:scale-95 transition-transform p-2 border border-transparent hover:border-red-900/30 rounded"
          >
            {exercises.every(ex => ex.sets.every(s => s.completed)) ? 'Finish & Sync' : 'Abandon'}
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
          
          <div className="h-32 flex items-center justify-center text-zinc-800 text-4xl font-black uppercase opacity-20 select-none">
            IronForge
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quest_Log;

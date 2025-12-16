
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Exercise } from '../../types/ironforge';
import { calculateE1RM } from '../../utils/math';
import { determineRarity } from '../../utils/loot';
import { playSound, fireConfetti } from '../../utils';
import ExerciseView from './components/ExerciseView';
import ForgeButton from '../../components/ui/ForgeButton';
import { AnimatePresence } from 'framer-motion';
import Stopwatch from '../../components/game/Stopwatch';
import ProgressBar from '../../components/game/ProgressBar';

interface IronMinesProps {
  initialData: Exercise[];
  title: string;
  onComplete: () => void;
}

const IronMines: React.FC<IronMinesProps> = ({ initialData, title, onComplete }) => {
  const [exercises, setExercises] = useState<Exercise[]>(initialData);
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [startTime] = useState(new Date());
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeExIndex]);

  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    setExercises(currentExercises => {
      const newExercises = [...currentExercises];
      const currentEx = newExercises[activeExIndex];
      const setIndex = currentEx.sets.findIndex(s => !s.completed);

      if (setIndex === -1) return currentExercises; 

      const targetSet = { ...currentEx.sets[setIndex] };

      // --- Calculations ---
      const sessionPr = currentEx.sets.filter(s => s.completed && s.e1rm).reduce((max, s) => Math.max(max, s.e1rm || 0), 0);
      const currentE1RM = calculateE1RM(weight, reps, rpe);
      const isPr = currentE1RM > sessionPr;
      const rarity = determineRarity(currentE1RM, sessionPr, isPr);

      // --- Update Set Data ---
      targetSet.completed = true;
      targetSet.weight = weight;
      targetSet.completedReps = reps;
      targetSet.rarity = rarity;
      targetSet.e1rm = currentE1RM;
      targetSet.isPr = isPr;
      currentEx.sets[setIndex] = targetSet;
      
      // --- Sound & Animation Hooks ---
      if (isPr) {
          playSound('pr');
          fireConfetti();
      } else if (rarity === 'legendary') {
          playSound('loot_legendary');
          fireConfetti();
      } else {
          playSound('ding');
      }

      // --- Advance to next exercise ---
      const allSetsInExerciseComplete = currentEx.sets.every(s => s.completed);
      if (allSetsInExerciseComplete && activeExIndex < newExercises.length - 1) {
          setTimeout(() => setActiveExIndex(prev => prev + 1), 1200);
      }
      
      return newExercises;
    });
  };
  
  const { completedSets, totalSets } = useMemo(() => {
    let completed = 0;
    let total = 0;
    exercises.forEach(ex => {
        total += ex.sets.length;
        ex.sets.forEach(s => {
            if(s.completed) completed++;
        });
    });
    return { completedSets: completed, totalSets: total };
  }, [exercises]);

  const isQuestFullyCompleted = completedSets === totalSets;

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-8 animate-fade-in">
      <header className="flex-shrink-0 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl md:text-3xl text-magma uppercase tracking-widest">{title}</h1>
            <ForgeButton 
                variant={isQuestFullyCompleted ? 'magma' : 'default'}
                onClick={onComplete}
                size="sm"
            >
                {isQuestFullyCompleted ? 'Complete Protocol' : 'Abort Protocol'}
            </ForgeButton>
          </div>
          <div className="flex justify-between items-center mt-3">
              <ProgressBar current={completedSets} total={totalSets} label="Quest Progress" />
              <div className="ml-6">
                <Stopwatch startTime={startTime} />
              </div>
          </div>
      </header>

      <main className="flex-grow space-y-6 pb-24 overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {exercises.map((ex, index) => (
                <div key={ex.id} ref={index === activeExIndex ? activeRef : null}>
                    <ExerciseView 
                        exercise={ex}
                        isActive={index === activeExIndex}
                        isCompleted={index < activeExIndex || ex.sets.every(s => s.completed)}
                        onSetLog={handleSetLog}
                    />
                </div>
            ))}
          </AnimatePresence>
      </main>
    </div>
  );
};

export default IronMines;

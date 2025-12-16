
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Exercise, Set } from '../../types/ironforge';
import { calculateE1RM } from '../../utils/math';
import { determineRarity } from '../../utils/loot';
import { playSound, fireConfetti } from '../../utils';
import ExerciseView from './components/ExerciseView';
import ForgeButton from '../../components/ui/ForgeButton';
import { AnimatePresence } from 'framer-motion';
import Stopwatch from '../../components/game/Stopwatch';
import ProgressBar from '../../components/game/ProgressBar';
import BerserkerMode from './components/BerserkerMode';
import BerserkerChoice from './components/BerserkerChoice';

interface IronMinesProps {
  initialData: Exercise[];
  title: string;
  onComplete: () => void;
  onAbort: () => void;
}

const IronMines: React.FC<IronMinesProps> = ({ initialData, title, onComplete, onAbort }) => {
  const [exercises, setExercises] = useState<Exercise[]>(initialData);
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [startTime] = useState(new Date());
  const [showBerserkerChoice, setShowBerserkerChoice] = useState(false);
  const [isBerserkerMode, setIsBerserkerMode] = useState(false);
  const [questOver, setQuestOver] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeExIndex]);

  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    setExercises(currentExercises => {
        const newExercises = currentExercises.map(ex => ({...ex, sets: ex.sets.map(s => ({...s}))}));
        const currentEx = newExercises[activeExIndex];
        const setIndex = currentEx.sets.findIndex(s => !s.completed);

        if (setIndex === -1) return currentExercises; 

        const targetSet = currentEx.sets[setIndex];

        const sessionPr = currentEx.sets.filter(s => s.completed && s.e1rm).reduce((max, s) => Math.max(max, s.e1rm || 0), 0);
        const currentE1RM = calculateE1RM(weight, reps, rpe);
        const isPr = currentE1RM > sessionPr;
        const rarity = determineRarity(currentE1RM, sessionPr, isPr);

        targetSet.completed = true;
        targetSet.weight = weight;
        targetSet.completedReps = reps;
        targetSet.rarity = rarity;
        targetSet.e1rm = currentE1RM;
        targetSet.isPr = isPr;
        
        if (isPr) {
            playSound('pr');
            fireConfetti();
        } else if (rarity === 'legendary') {
            playSound('loot_legendary');
            fireConfetti();
        } else {
            playSound('ding');
        }

        const allSetsInExerciseComplete = currentEx.sets.every(s => s.completed);
        const isLastExercise = activeExIndex === newExercises.length - 1;

        if (allSetsInExerciseComplete) {
            if(isLastExercise) {
                setTimeout(() => setShowBerserkerChoice(true), 1000);
            } else {
                setTimeout(() => setActiveExIndex(prev => prev + 1), 1200);
            }
        }
        
        return newExercises;
    });
  };

  const handleBerserkerAccept = () => {
    setShowBerserkerChoice(false);
    setIsBerserkerMode(true);
  };

  const handleBerserkerDecline = () => {
    setShowBerserkerChoice(false);
    setQuestOver(true);
  };

  const handleBerserkerComplete = (reps: number) => {
    setExercises(currentExercises => {
        const lastExerciseIndex = currentExercises.length - 1;

        const berserkerSet: Set = {
            id: `berserker-${Date.now()}`,
            type: 'AMRAP',
            completed: true,
            weight: 0, 
            targetReps: reps,
            completedReps: reps,
            targetRPE: 10,
            isPr: true, 
            rarity: 'legendary', 
            e1rm: 0, 
        };

        return currentExercises.map((exercise, index) => {
            if (index === lastExerciseIndex) {
                return {
                    ...exercise,
                    sets: [...exercise.sets, berserkerSet]
                };
            }
            return exercise;
        });
    });

    setIsBerserkerMode(false);
    setQuestOver(true);
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

  const isQuestFullyCompleted = useMemo(() => {
    if (questOver) return true;
    if (exercises.length === 0) return false;
    const lastEx = exercises[exercises.length - 1];
    const lastSet = lastEx.sets[lastEx.sets.length - 1];
    return lastSet.type === 'AMRAP' && lastSet.completed;
  }, [exercises, questOver]);

  const handleButtonClick = () => {
    if (isQuestFullyCompleted) {
      onComplete();
    } else {
      onAbort();
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-8 animate-fade-in">
      <header className="flex-shrink-0 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl md:text-3xl text-magma uppercase tracking-widest">{title}</h1>
            <ForgeButton 
                variant={isQuestFullyCompleted ? 'magma' : 'default'}
                onClick={handleButtonClick}
                size="sm"
                disabled={!isQuestFullyCompleted && completedSets < totalSets}
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
      
      {showBerserkerChoice && (
        <BerserkerChoice 
          onAccept={handleBerserkerAccept} 
          onDecline={handleBerserkerDecline} 
        />
      )}

      {isBerserkerMode && (
          <BerserkerMode 
            lastExerciseName={exercises[activeExIndex].name}
            onComplete={handleBerserkerComplete} 
          />
      )}
    </div>
  );
};

export default IronMines;

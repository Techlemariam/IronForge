import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Exercise, WorkoutSet } from '../../types/ironforge';
import { calculateE1RM } from '../../utils/math';
import { determineRarity } from '../../utils/loot';
import { playSound, fireConfetti } from '../../utils';
import ExerciseView from './components/ExerciseView';
import ForgeButton from '../../components/ui/ForgeButton';
import { AnimatePresence } from 'framer-motion';
import BerserkerMode from './components/BerserkerMode';
import BerserkerChoice from './components/BerserkerChoice';
import VisionRepCounter from '../../components/VisionRepCounter';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- DUNGEON MODE IMPORTS ---
import DungeonInterface from '../../components/game/dungeon/DungeonInterface';
import ScreenShake from '../../components/game/dungeon/ScreenShake';
import BerserkerOverlay from '../../components/game/dungeon/BerserkerOverlay';
import OverchargePrompt from './components/OverchargePrompt';
import { calculateDamage, detectJokerOpportunity } from '../../utils/combatMechanics';

interface IronMinesProps {
  initialData: Exercise[];
  title: string;
  onComplete: () => void;
  onAbort: () => void;
}

const IronMines: React.FC<IronMinesProps> = ({ initialData, title, onComplete, onAbort }) => {
  const [exercises, setExercises] = useState<Exercise[]>(initialData);
  const [activeExIndex, setActiveExIndex] = useState(0);

  // --- MODALS & TRIGGERS ---
  const [showBerserkerChoice, setShowBerserkerChoice] = useState(false);
  const [isBerserkerMode, setIsBerserkerMode] = useState(false);
  const [jokerPrompt, setJokerPrompt] = useState<{ show: boolean, weight: number }>({ show: false, weight: 0 });
  const [questOver, setQuestOver] = useState(false);
  const [isVisionActive, setIsVisionActive] = useState(false);

  const activeRef = useRef<HTMLDivElement>(null);

  // --- DUNGEON STATE ---
  const [totalHp, setTotalHp] = useState(1);
  const [damageDealt, setDamageDealt] = useState(0);
  const [lastDamage, setLastDamage] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // Initialize Boss HP
  useEffect(() => {
    const calculatedHp = exercises.reduce((acc, ex) => {
      const weight = ex.trainingMax || 60;
      const reps = ex.sets.reduce((rAcc, s) => rAcc + (typeof s.reps === 'number' ? s.reps : 10), 0);
      return acc + (weight * reps);
    }, 0);
    setTotalHp(Math.max(calculatedHp, 1000));
  }, []);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeExIndex]);

  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    // 1. Calculate Damage
    const combatStats = calculateDamage(weight, reps, rpe, false);
    setDamageDealt(prev => prev + combatStats.damage);
    setLastDamage(combatStats.damage);
    setShakeTrigger(prev => prev + 1);

    // 2. Propose Joker Set?
    // Check if valid opportunity (RPE < 7, not already a Joker/Berserker set)
    const currentEx = exercises[activeExIndex];
    const setIndex = currentEx.sets.findIndex(s => !s.completed);
    const totalSets = currentEx.sets.length;

    // Only propose if not the very last set (unless we want to extend), 
    // AND if it was too easy.
    if (detectJokerOpportunity(rpe, setIndex, totalSets)) {
      // Propose 10% weight increase
      const jokerWeight = Math.round((weight * 1.1) / 2.5) * 2.5;
      setJokerPrompt({ show: true, weight: jokerWeight });
      playSound('mystery_alert');
    }

    // 3. Update State
    setExercises(currentExercises => {
      const newExercises = currentExercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }));
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

      if (isPr || rarity === 'legendary') {
        playSound('loot_epic');
        fireConfetti();
      } else {
        playSound('ding');
      }

      const allSetsInExerciseComplete = currentEx.sets.every(s => s.completed);
      const isLastExercise = activeExIndex === newExercises.length - 1;

      if (allSetsInExerciseComplete) {
        if (isLastExercise) {
          setTimeout(() => setShowBerserkerChoice(true), 1000);
        } else {
          setTimeout(() => setActiveExIndex(prev => prev + 1), 1200);
        }
      }

      return newExercises;
    });
  };

  // --- JOKER SET HANDLERS ---
  const handleJokerAccept = () => {
    setExercises(currentExercises => {
      const newExercises = currentExercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }));
      const currentEx = newExercises[activeExIndex];

      // Add a Joker Set
      const jokerSet: WorkoutSet = {
        id: `joker-${Date.now()}`,
        completed: false,
        targetReps: 1, // Power single usually
        weight: jokerPrompt.weight,
        type: 'JOKER', // Using string type if supported, else 'Working'
        targetRPE: 9,
        rarity: 'epic', // Starts as Epic potential
      };

      // Insert after current completed sets
      const lastCompletedIndex = currentEx.sets.findIndex(s => !s.completed);
      // If all completed, append. If some remaining, insert.
      // Actually handleSetLog just completed one, so we are inserting into the remaining queue
      // But since we just updated state in handleSetLog, we need to be careful.
      // Simplified: push to end of array for now or insert active.
      currentEx.sets.splice(lastCompletedIndex === -1 ? currentEx.sets.length : lastCompletedIndex, 0, jokerSet);

      return newExercises;
    });
    setJokerPrompt({ show: false, weight: 0 });
    playSound('quest_accept');
  };

  const handleJokerDecline = () => {
    setJokerPrompt({ show: false, weight: 0 });
  };

  const handleVisionRep = () => {
    setExercises(currentExercises => {
      const newExercises = [...currentExercises];
      const currentEx = { ...newExercises[activeExIndex] };
      const setIndex = currentEx.sets.findIndex(s => !s.completed);

      if (setIndex !== -1) {
        const currentSets = [...currentEx.sets];
        const targetSet = { ...currentSets[setIndex] };
        targetSet.completedReps = (targetSet.completedReps || 0) + 1;
        currentSets[setIndex] = targetSet;
        currentEx.sets = currentSets;
        newExercises[activeExIndex] = currentEx;
        playSound('ding');
      }
      return newExercises;
    });
  };

  // --- BERSERKER (DROP SET) HANDLERS ---
  const handleBerserkerAccept = () => {
    setShowBerserkerChoice(false);
    setIsBerserkerMode(true);
  };

  const handleBerserkerDecline = () => {
    setShowBerserkerChoice(false);
    setQuestOver(true);
  };

  const handleBerserkerComplete = (reps: number) => {
    const weight = exercises[activeExIndex].sets[0].weight || 50;
    const damage = weight * reps * 2;
    setDamageDealt(prev => prev + damage);
    setLastDamage(damage);
    setShakeTrigger(prev => prev + 1);

    setExercises(currentExercises => {
      const lastExerciseIndex = currentExercises.length - 1;
      const berserkerSet: WorkoutSet = {
        id: `berserker-${Date.now()}`,
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

  // --- DERIVED STATE ---
  const { completedSets, totalSets } = useMemo(() => {
    let completed = 0;
    let total = 0;
    exercises.forEach(ex => {
      total += ex.sets.length;
      ex.sets.forEach(s => {
        if (s.completed) completed++;
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
    <div className="flex flex-col h-full w-full p-4 md:p-8 animate-fade-in gap-4 bg-[#0a0a0a]">
      {/* 1. HUD */}
      <div className="flex-shrink-0">
        <DungeonInterface
          bossName={title || "The Iron Keeper"}
          totalHp={totalHp}
          currentHp={Math.max(0, totalHp - damageDealt)}
          onDamage={lastDamage}
          level={Math.floor(totalHp / 1000)}
          buffs={["Pre-Workout"]}
        />

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsVisionActive(!isVisionActive)}
              className={cn(
                "p-2 rounded-lg border-2 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest",
                isVisionActive
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-500"
              )}
            >
              {isVisionActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Titan Vision
            </button>
          </div>

          <ForgeButton
            variant={isQuestFullyCompleted ? 'magma' : 'default'}
            onClick={handleButtonClick}
            disabled={!isQuestFullyCompleted && completedSets < totalSets}
          >
            {isQuestFullyCompleted ? 'Loot Boss' : 'Flee Dungeon'}
          </ForgeButton>
        </div>
      </div>

      {/* 2. MAIN BATTLEFIELD */}
      <ScreenShake triggerKey={shakeTrigger} intensity={0.7}>
        <main className="flex-grow space-y-6 pb-24 overflow-y-auto no-scrollbar bg-zinc-900/10 rounded-xl p-4 border border-zinc-800/50 relative">
          <AnimatePresence>
            {isVisionActive && (
              <div className="mb-4">
                <VisionRepCounter
                  isActive={isVisionActive}
                  onRepCount={handleVisionRep}
                  onClose={() => setIsVisionActive(false)}
                />
              </div>
            )}
          </AnimatePresence>

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
      </ScreenShake>

      {/* 3. MODALS & OVERLAYS */}
      <BerserkerOverlay isActive={isBerserkerMode} />

      <AnimatePresence>
        {jokerPrompt.show && (
          <OverchargePrompt
            onAccept={handleJokerAccept}
            onDecline={handleJokerDecline}
            suggestedWeight={jokerPrompt.weight}
          />
        )}
      </AnimatePresence>

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

import React, { useState, useEffect, useRef, useMemo } from "react";
import { IntervalsWellness } from "@/types";
import { BioBuffService, BioBuff } from "@/features/bio/BioBuffService";
import { Exercise, Set as WorkoutSet } from "@/types";
import { playSound } from "@/utils";
import ExerciseView from "@/features/training/components/ExerciseView";
import ForgeButton from "@/components/ui/ForgeButton";
import { AnimatePresence } from "framer-motion";
import BerserkerMode from "@/features/training/components/BerserkerMode";
import BerserkerChoice from "@/features/training/components/BerserkerChoice";
import VisionRepCounter from "@/features/training/components/VisionRepCounter";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJokerSets } from "@/features/strength/hooks/useJokerSets";
import { useSetLogging } from "@/features/strength/hooks/useSetLogging";
import { useVolumeTracking } from "@/features/strength/hooks/useVolumeTracking";


import SupersetGroup from "@/features/training/components/SupersetView";
import { useHRRecoveryTimer } from "@/features/strength/hooks/useHRRecoveryTimer";
import { BiometricsHUD } from "@/features/strength/components/BiometricsHUD";
import { CardiacDriftWarning } from "@/features/strength/components/CardiacDriftWarning";
import { PRCelebration } from "@/components/ui/PRCelebration";



// --- DUNGEON MODE IMPORTS ---
import DungeonInterface from "@/components/game/dungeon/DungeonInterface";
import ScreenShake from "@/components/game/dungeon/ScreenShake";
import BerserkerOverlay from "@/components/game/dungeon/BerserkerOverlay";
import OverchargePrompt from "@/features/training/components/OverchargePrompt";

import { LiveSessionHUD } from "@/features/coop/LiveSessionHUD";
import { useUser } from "@/hooks/useUser";
import { contributeGuildDamageAction } from "@/actions/guild/core";
import { GhostOverlay } from "@/features/coop/GhostOverlay";
import { CoOpService, GhostEvent } from "@/services/coop/CoOpService";

interface IronMinesProps {
  initialData: Exercise[];
  title: string;
  onComplete: () => void;
  onAbort: () => void;
  wellness?: IntervalsWellness | null;
  hrvBaseline?: number;
}

const DungeonSessionView: React.FC<IronMinesProps> = ({
  initialData,
  title,
  onComplete,
  onAbort,
  wellness,
  hrvBaseline = 50,
}) => {
  const { user } = useUser(); // Hook for Guild Damage
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    // Try to load from local storage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iron_mines_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved session", e);
        }
      }
    }
    return initialData;
  });

  const [activeExIndex, setActiveExIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iron_mines_index');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Persist Changes
  useEffect(() => {
    localStorage.setItem('iron_mines_session', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('iron_mines_index', activeExIndex.toString());
  }, [activeExIndex]);

  // Clear on complete/abort
  const clearSession = () => {
    localStorage.removeItem('iron_mines_session');
    localStorage.removeItem('iron_mines_index');
  };

  const [activeBuffs, setActiveBuffs] = useState<BioBuff[]>([]);

  // Calculate Bio-Buffs
  useEffect(() => {
    const sleep = wellness?.sleepScore || 0;
    const hrv = wellness?.hrv || 0;

    // If no wellness data (e.g. demo mode or not synced), assume Stable
    if (!wellness) {
      // Fallback or "Stable"
    }

    const buff = BioBuffService.calculateBuff(sleep, hrv, hrvBaseline);
    setActiveBuffs([buff]);

    // Initialize HR Zones - will be handled in HR hook
  }, [wellness, hrvBaseline]);

  // Simulate HR Data (Demo Mode)
  const { updateHR, metrics } = useHRRecoveryTimer();
  useEffect(() => {
    const interval = setInterval(() => {
      // Simple sine wave simulation for demo
      const time = Date.now() / 3000;
      const base = 110;
      const fluctuation = Math.sin(time) * 20;
      updateHR(Math.floor(base + fluctuation));
    }, 2000);
    return () => clearInterval(interval);
  }, [updateHR]);

  // --- MODALS & TRIGGERS ---
  const [showBerserkerChoice, setShowBerserkerChoice] = useState(false);
  const [isBerserkerMode, setIsBerserkerMode] = useState(false);
  const [questOver, setQuestOver] = useState(false);
  const [isVisionActive, setIsVisionActive] = useState(false);

  const activeRef = useRef<HTMLDivElement>(null);

  // --- DUNGEON STATE ---
  const [totalHp, setTotalHp] = useState(1);
  const [damageDealt, setDamageDealt] = useState(0);
  const [lastDamage, setLastDamage] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // --- GHOST MODE STATE ---
  const [ghostEvents, setGhostEvents] = useState<GhostEvent[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Subscribe to Ghost Events (if in session)
  useEffect(() => {
    // E2E Test Support: Load mock ghost events
    if (typeof window !== 'undefined' && (window as any).__mockGhostEvents) {
      console.log("[DungeonSessionView] Loading mock ghost events");
      setGhostEvents((window as any).__mockGhostEvents);
      // Simulate real-time updates for mocks? Not strictly needed if we just set initial state
      return;
    }

    if (!activeSessionId) return;

    const channel = CoOpService.subscribeToGhostEvents(activeSessionId, (event) => {
      setGhostEvents(prev => [event, ...prev].slice(0, 10)); // Keep last 10
      // Auto-clear after 5 seconds
      setTimeout(() => {
        setGhostEvents(prev => prev.filter(e => e.timestamp !== event.timestamp));
      }, 5000);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [activeSessionId]);

  // Initialize Boss HP
  useEffect(() => {
    const calculatedHp = exercises.reduce((acc, ex) => {
      const weight = ex.trainingMax || 60;
      const reps = ex.sets.reduce(
        (rAcc, s) => rAcc + (typeof s.reps === "number" ? s.reps : 10),
        0,
      );
      return acc + weight * reps;
    }, 0);
    setTotalHp(Math.max(calculatedHp, 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeExIndex]);

  // --- HOOKS ---
  const {
    jokerPrompt,
    checkJokerOpportunity,
    handleJokerAccept,
    handleJokerDecline,
  } = useJokerSets(exercises, setExercises, activeExIndex);

  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [prData, setPrData] = useState<{ newReps: number; oldMax: number | null }>({ newReps: 0, oldMax: 0 });

  const { handleSetLog } = useSetLogging(
    exercises,
    setExercises,
    activeExIndex,
    {
      onDamage: (damage) => {
        setDamageDealt((prev) => prev + damage);
        setLastDamage(damage);
        setShakeTrigger((prev) => prev + 1);

        // --- GUILD ACTION ---
        if (user?.id) {
          contributeGuildDamageAction(user.id, damage).catch(e => console.error("Guild Action Failed", e));

          // --- GHOST BROADCAST ---
          if (activeSessionId) {
            CoOpService.broadcastGhostEvent(activeSessionId, {
              type: 'SET_COMPLETE',
              userId: user.id,
              heroName: user.heroName || 'Hero',
              damage,
              timestamp: Date.now()
            });
          }
        }
      },
      onJokerCheck: checkJokerOpportunity,
      onExerciseComplete: () => setActiveExIndex((prev) => prev + 1),
      onWorkoutComplete: () => setShowBerserkerChoice(true),
      onRepPR: (newReps, oldMax) => {
        setPrData({ newReps, oldMax });
        setShowPRCelebration(true);
      },
    },
  );

  const { getVolumeFeedback } = useVolumeTracking(exercises);
  const activeExerciseName = exercises[activeExIndex]?.name || "";
  const volumeFeedback = getVolumeFeedback(activeExerciseName);

  const handleVisionRep = () => {
    setExercises((currentExercises) => {
      const newExercises = [...currentExercises];
      const currentEx = { ...newExercises[activeExIndex] };
      const setIndex = currentEx.sets.findIndex((s) => !s.completed);

      if (setIndex !== -1) {
        const currentSets = [...currentEx.sets];
        const targetSet = { ...currentSets[setIndex] };
        targetSet.completedReps = (targetSet.completedReps || 0) + 1;
        currentSets[setIndex] = targetSet;
        currentEx.sets = currentSets;
        newExercises[activeExIndex] = currentEx;
        playSound("ding");
      }
      return newExercises;
    });
  };

  const handleNotesChange = (notes: string, exerciseIndex: number) => {
    setExercises(current => {
      const newEx = [...current];
      newEx[exerciseIndex] = { ...newEx[exerciseIndex], notes };
      return newEx;
    });
  };

  const handleSetUpdate = (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    setExercises(current => {
      const newEx = [...current];
      const targetEx = { ...newEx[exerciseIndex] };
      const targetSets = [...targetEx.sets];
      targetSets[setIndex] = { ...targetSets[setIndex], ...updates };
      targetEx.sets = targetSets;
      newEx[exerciseIndex] = targetEx;
      return newEx;
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
    setDamageDealt((prev) => prev + damage);
    setLastDamage(damage);
    setShakeTrigger((prev) => prev + 1);

    setExercises((currentExercises) => {
      const lastExerciseIndex = currentExercises.length - 1;
      const berserkerSet: WorkoutSet = {
        id: `berserker-${Date.now()}`,
        completed: true,
        weight: 0,
        reps: reps,
        completedReps: reps,
        rpe: 10,
        isPr: true,
        rarity: "legendary",
        e1rm: 0,
      };

      return currentExercises.map((exercise, index) => {
        if (index === lastExerciseIndex) {
          return {
            ...exercise,
            sets: [...exercise.sets, berserkerSet],
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
    exercises.forEach((ex) => {
      total += ex.sets.length;
      ex.sets.forEach((s) => {
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
    return lastSet.type === "AMRAP" && lastSet.completed;
  }, [exercises, questOver]);

  const handleButtonClick = () => {
    clearSession();
    if (isQuestFullyCompleted) {
      onComplete();
    } else {
      onAbort();
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-8 animate-fade-in gap-4 bg-[#0a0a0a]">
      {/* 1. HUD */}
      <div className="flex-shrink-0 relative">
        <DungeonInterface
          bossName={title || "The Iron Keeper"}
          totalHp={totalHp}
          currentHp={Math.max(0, totalHp - damageDealt)}
          onDamage={lastDamage}
          level={Math.floor(totalHp / 1000)}
          buffs={activeBuffs}
        />

        {/* Volume Feedback (L1) */}
        {volumeFeedback && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800 flex items-center gap-2 text-xs font-mono animate-fade-in z-20">
            <span
              className={
                volumeFeedback.status === "OVER"
                  ? "text-red-400"
                  : "text-cyan-400"
              }
            >
              {volumeFeedback.muscleGroup}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-white">
              {volumeFeedback.currentSets}/{volumeFeedback.mrv} sets
            </span>
            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden ml-1">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  volumeFeedback.status === "OVER"
                    ? "bg-red-500"
                    : volumeFeedback.status === "OPTIMAL"
                      ? "bg-green-500"
                      : "bg-cyan-500",
                )}
                style={{
                  width: `${Math.min(100, volumeFeedback.percentage)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Rest Timer Overlay - Only when active */}
        <BiometricsHUD />

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsVisionActive(!isVisionActive)}
              className={cn(
                "p-2 rounded-lg border-2 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest",
                isVisionActive
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-500",
              )}
            >
              {isVisionActive ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              Titan Vision
            </button>
          </div>

          <ForgeButton
            variant={isQuestFullyCompleted ? "magma" : "default"}
            onClick={handleButtonClick}
            disabled={!isQuestFullyCompleted && completedSets < totalSets}
          >
            {isQuestFullyCompleted ? "Loot Boss" : "Flee Dungeon"}
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
            {exercises.map((ex, index) => {
              // Superset Logic:
              // If this exercise has a supersetId....
              if (ex.supersetId) {
                const supersetGroup = exercises.filter(e => e.supersetId === ex.supersetId);
                const firstInGroup = supersetGroup[0];

                // Only render if this IS the first one in the group (to avoid duplicates)
                if (ex.id === firstInGroup.id) {
                  return (
                    <div key={`superset-${ex.supersetId}`} ref={index === activeExIndex || exercises[activeExIndex]?.supersetId === ex.supersetId ? activeRef : null}>
                      <SupersetGroup
                        exercises={supersetGroup}
                        activeIndex={activeExIndex}
                        globalStartIndex={index} // Assumes they are contiguous. 
                        onSetLog={(idx, w, r, rpe) => handleSetLog(w, r, rpe, idx)}
                        onNotesChange={(idx, notes) => handleNotesChange(notes, idx)}
                        onSetUpdate={(exIdx, setIdx, updates) => handleSetUpdate(exIdx, setIdx, updates)}
                      />
                    </div>
                  );
                } else {
                  // Skip rendering, it was handled by the first one
                  return null;
                }
              }

              return (
                <div key={ex.id} ref={index === activeExIndex ? activeRef : null}>
                  <ExerciseView
                    exercise={ex}
                    isActive={index === activeExIndex}
                    isCompleted={
                      index < activeExIndex || ex.sets.every((s) => s.completed)
                    }
                    onSetLog={handleSetLog}
                    onNotesChange={(notes) => handleNotesChange(notes, index)}
                    onSetUpdate={(setIndex, updates) => handleSetUpdate(index, setIndex, updates)}
                  />
                </div>
              )
            })}
          </AnimatePresence>
        </main>
      </ScreenShake>

      {/* 3. MODALS & OVERLAYS */}
      <div className="fixed bottom-24 left-4 z-40 max-w-sm">
        <CardiacDriftWarning driftPercentage={metrics.drift} />
      </div>
      <BerserkerOverlay isActive={isBerserkerMode} />
      <LiveSessionHUD onSessionJoin={(id) => setActiveSessionId(id)} />
      <GhostOverlay events={ghostEvents} currentUserId={user?.id} />

      <AnimatePresence>
        {jokerPrompt.show && (
          <OverchargePrompt
            onAccept={handleJokerAccept}
            onDecline={handleJokerDecline}
            suggestedWeight={jokerPrompt.weight}
          />
        )}
      </AnimatePresence>

      {
        showBerserkerChoice && (
          <BerserkerChoice
            onAccept={handleBerserkerAccept}
            onDecline={handleBerserkerDecline}
          />
        )
      }

      {
        isBerserkerMode && (
          <BerserkerMode
            lastExerciseName={exercises[activeExIndex].name}
            onComplete={handleBerserkerComplete}
          />
        )
      }

      <PRCelebration
        isVisible={showPRCelebration}
        newReps={prData.newReps}
        previousReps={prData.oldMax}
        exerciseName={exercises[activeExIndex]?.name}
        onClose={() => setShowPRCelebration(false)}
      />
    </div >
  );
};

export default DungeonSessionView;

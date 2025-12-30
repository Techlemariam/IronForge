import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  memo,
} from "react";
import {
  Block,
  Set as WorkoutSet,
  ExerciseLogic,
  IntervalsWellness,
  AppSettings,
  Exercise,
} from "../types";
import {
  Check,
  Trophy,
  Ban,
  Info,
  ExternalLink,
  X,
  Lock,
  Zap,
  MousePointer2,
  Sword,
  Shield,
  Crown,
  FlaskConical,
  LogOut,
  Flame,
  Battery,
  HeartPulse,
  Mic,
  Camera,
  Waves,
  ArrowUp,
  ArrowDown,
  Timer,
  Plus,
  Copy,
} from "lucide-react";
import {
  roundToPlates,
  fireConfetti,
  calculateRarity,
  playSound,
  calculateTitanRank,
} from "../utils";
import { calculateApre, ApreSuggestion } from "../utils/apre";
import PlateVisualizer from "./PlateVisualizer";
import ExerciseLibrary from "./ExerciseLibrary";
import HeartRateMonitor from "./HeartRateMonitor";
import VisionRepCounter from "./VisionRepCounter";
import { AchievementContext } from "../context/AchievementContext";
import { useSkills } from "../context/SkillContext";
import { IoTService } from "../services/iot";
import { RaidService } from "../services/raid";
import { NeuroService } from "../services/neuro";
import { StorageService } from "../services/storage";
import { useVoiceCommand } from "../hooks/useVoiceCommand";

interface ActionViewProps {
  block: Block;
  onComplete: () => void;
  onAbort: () => void;
  bpm: number | null;
  isBtConnected: boolean;
  onBtConnect: () => void;
  onBtSimulate: () => void;
  btError?: string | null;
  wellness: IntervalsWellness | null;
  previousStats?: Record<
    string,
    { weight: number; reps: number; e1rm: number }
  >;
  onSessionUpdate?: (exercises: Exercise[]) => void; // Persistence Callback
}

interface SetRowProps {
  set: WorkoutSet;
  exIndex: number;
  setIndex: number;
  isFocused: boolean;
  isLocked: boolean;
  displayWeight: number;
  isLandmine: boolean;
  rarity: string;
  onToggle: (exIdx: number, setIdx: number) => void;
  onRepsChange: (exIdx: number, setIdx: number, newReps: number) => void;
  onWeightChange: (exIdx: number, setIdx: number, newWeight: number) => void;
  onRpeChange: (exIdx: number, setIdx: number, newRpe: number) => void;
  activeSetRef: React.RefObject<HTMLDivElement | null> | null;
  previous?: { weight: number; reps: number; e1rm: number };
}

const SetRow = memo(
  ({
    set,
    exIndex,
    setIndex,
    isFocused,
    isLocked,
    displayWeight,
    isLandmine,
    rarity,
    onToggle,
    onRepsChange,
    onWeightChange,
    onRpeChange,
    activeSetRef,
    previous,
  }: SetRowProps) => {
    const getRarityBorder = (rarity: string) => {
      switch (rarity) {
        case "poor":
          return "border-rarity-poor shadow-none opacity-50";
        case "common":
          return "border-rarity-common/50 shadow-none";
        case "uncommon":
          return "border-rarity-uncommon shadow-[0_0_10px_rgba(30,255,0,0.1)]";
        case "rare":
          return "border-rarity-rare shadow-[0_0_15px_rgba(0,112,221,0.2)]";
        case "epic":
          return "border-rarity-epic shadow-[0_0_20px_rgba(163,53,238,0.3)]";
        case "legendary":
          return "border-rarity-legendary shadow-[0_0_25px_rgba(255,128,0,0.4)]";
        default:
          return "border-zinc-800";
      }
    };

    const getRarityText = (rarity: string) => {
      switch (rarity) {
        case "poor":
          return "text-rarity-poor";
        case "common":
          return "text-rarity-common";
        case "uncommon":
          return "text-rarity-uncommon";
        case "rare":
          return "text-rarity-rare";
        case "epic":
          return "text-rarity-epic";
        case "legendary":
          return "text-rarity-legendary";
        default:
          return "text-zinc-500";
      }
    };

    const borderColor = getRarityBorder(rarity);
    const textColor = getRarityText(rarity);
    const isAmrap = typeof set.reps === "string";
    const inputValue =
      set.completedReps !== undefined
        ? set.completedReps
        : isAmrap
          ? ""
          : set.reps;

    // --- COMPACT VIEW (Completed Sets) ---
    if (set.completed) {
      return (
        <div
          className={`flex items-center justify-between p-2 bg-zinc-950/50 border border-zinc-900 rounded-md opacity-70 transition-all hover:opacity-100 cursor-pointer`}
          onClick={() => onToggle(exIndex, setIndex)}
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-900/30 p-1 rounded-full border border-green-900">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Set {setIndex + 1}
              </span>
              <div className="flex items-center gap-2 text-sm font-mono text-zinc-300">
                <span className="font-bold text-white">
                  {set.completedReps}
                </span>{" "}
                reps
                <span className="text-zinc-600">@</span>
                <span>{displayWeight > 0 ? `${displayWeight}kg` : "BW"}</span>
              </div>
            </div>
          </div>
          {set.rarity && set.rarity !== "common" && (
            <span
              className={`text-[9px] uppercase font-bold px-2 py-0.5 border rounded-full ${getRarityText(set.rarity)} border-current opacity-60`}
            >
              {set.rarity}
            </span>
          )}
        </div>
      );
    }

    // --- EXPANDED VIEW (Active/Pending) ---
    return (
      <div
        ref={activeSetRef}
        className={`group relative bg-[#0a0a0a] border-2 rounded-lg overflow-hidden transition-all duration-300 
              ${isFocused ? `scale-[1.02] z-10 shadow-xl ${borderColor}` : `border-zinc-900 hover:border-zinc-700`}
            `}
      >
        <div className={`flex flex-col gap-3 ${isFocused ? "p-6" : "p-4"}`}>
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-serif uppercase font-bold ${isFocused ? "text-zinc-300" : "text-zinc-600"}`}
                >
                  Objective {setIndex + 1}
                </span>
                {rarity === "epic" && !set.completed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-rarity-epic border border-rarity-epic/30 bg-rarity-epic/10 animate-pulse">
                    Epic Loot
                  </span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex flex-col gap-2 mt-2">
                {/* Previous Params Ghost */}
                {isFocused && previous && previous.e1rm > 0 && (
                  <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mb-1">
                    <span className="uppercase tracking-widest text-zinc-600">
                      Last:
                    </span>
                    {previous.weight > 0 ? (
                      <>
                        <span>
                          {previous.weight}kg x {previous.reps}
                        </span>
                        <span className="text-zinc-700">|</span>
                      </>
                    ) : null}
                    <span>e1RM: {previous.e1rm}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (previous.weight > 0)
                          onWeightChange(exIndex, setIndex, previous.weight);
                        if (previous.reps > 0)
                          onRepsChange(exIndex, setIndex, previous.reps);
                        playSound("ding");
                      }}
                      className="ml-2 p-0.5 hover:bg-zinc-800 rounded text-zinc-600 hover:text-indigo-400 transition-colors"
                      title="Copy Last Set"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-4">
                  {/* REPS INPUT */}
                  <div className="flex flex-col items-center">
                    {isFocused ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRepsChange(
                                exIndex,
                                setIndex,
                                Math.max(
                                  0,
                                  (set.completedReps ||
                                    (typeof set.reps === "number"
                                      ? set.reps
                                      : 0) ||
                                    0) - 1,
                                ),
                              );
                            }}
                            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={inputValue}
                            placeholder={isAmrap ? "MAX" : String(set.reps)}
                            onChange={(e) =>
                              onRepsChange(
                                exIndex,
                                setIndex,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 bg-zinc-900 border-b-2 border-zinc-500 text-white text-3xl font-serif font-bold text-center p-0 rounded-none focus:border-[#c79c6e] focus:outline-none placeholder-zinc-700"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRepsChange(
                                exIndex,
                                setIndex,
                                (set.completedReps ||
                                  (typeof set.reps === "number"
                                    ? set.reps
                                    : 0) ||
                                  0) + 1,
                              );
                            }}
                            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mt-1">
                          Reps
                        </span>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-serif font-bold text-white">
                          {isAmrap ? "AMRAP" : set.reps}
                        </span>
                        <span className="text-zinc-600 text-xs font-bold uppercase">
                          reps
                        </span>
                      </div>
                    )}
                  </div>

                  {/* WEIGHT INPUT */}
                  <div className="flex flex-col items-center">
                    {isFocused ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onWeightChange(
                                exIndex,
                                setIndex,
                                Math.max(0, displayWeight - 2.5),
                              );
                            }}
                            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={displayWeight}
                            onChange={(e) =>
                              onWeightChange(
                                exIndex,
                                setIndex,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 bg-zinc-900 border-b-2 border-zinc-500 text-white text-3xl font-serif font-bold text-center p-0 rounded-none focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onWeightChange(
                                exIndex,
                                setIndex,
                                displayWeight + 2.5,
                              );
                            }}
                            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mt-1">
                          KG Load
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center ml-2">
                        <span
                          className={`font-mono font-bold ${isFocused ? "text-2xl" : "text-lg"} ${textColor}`}
                        >
                          {displayWeight > 0 ? `${displayWeight}` : "BW"}
                        </span>
                        <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                          Weight
                        </span>
                      </div>
                    )}
                  </div>

                  {/* RPE INPUT (Only when focused) */}
                  {isFocused && (
                    <div className="flex flex-col items-center ml-2 animate-fade-in-left">
                      <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 flex flex-col items-center">
                        <input
                          type="number"
                          max={10}
                          min={1}
                          step={0.5}
                          value={set.rpe || ""}
                          placeholder="-"
                          onChange={(e) =>
                            onRpeChange(
                              exIndex,
                              setIndex,
                              parseFloat(e.target.value),
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 bg-transparent text-center text-yellow-500 font-bold text-xl focus:outline-none"
                        />
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">
                          RPE
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onToggle(exIndex, setIndex)}
              disabled={isLocked}
              className={`rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95
                          ${
                            isLocked
                              ? "bg-red-950/10 border-2 border-red-900/50 text-red-900 cursor-not-allowed h-12 w-12"
                              : isFocused
                                ? "bg-zinc-100 text-black h-16 w-16 hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]" // Giant button for active
                                : "bg-zinc-900 border border-zinc-700 text-zinc-500 h-12 w-12 hover:border-zinc-500 hover:text-zinc-300"
                          }`}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 animate-pulse" />
              ) : (
                <Shield
                  className={`${isFocused ? "w-8 h-8 fill-current" : "w-5 h-5"}`}
                />
              )}
            </button>
          </div>

          {/* Footer / Visualizer */}
          <div className="mt-1">
            {displayWeight > 20 &&
              !isLocked &&
              (isFocused || !set.completed) && (
                <PlateVisualizer
                  weight={displayWeight}
                  isSingleLoaded={isLandmine}
                />
              )}
            {isLocked && (
              <div className="mt-2 p-2 bg-red-950/30 border border-red-900/50 rounded flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                  Aggro High: Recover HR
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.set.completed === next.set.completed &&
      prev.set.completedReps === next.set.completedReps &&
      prev.set.rarity === next.set.rarity &&
      prev.isFocused === next.isFocused &&
      prev.isLocked === next.isLocked &&
      prev.displayWeight === next.displayWeight &&
      prev.set.rpe === next.set.rpe &&
      prev.previous === next.previous
    );
  },
);

SetRow.displayName = "SetRow";

const ActionView: React.FC<ActionViewProps> = ({
  block,
  onComplete,
  onAbort,
  bpm,
  isBtConnected,
  onBtConnect,
  onBtSimulate,
  btError,
  wellness,
  previousStats = {},
  onSessionUpdate,
}) => {
  const [exercises, setExercises] = useState(block.exercises || []);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [showVision, setShowVision] = useState(false);
  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const [criticalHit, setCriticalHit] = useState<{
    show: boolean;
    msg: string;
  }>({ show: false, msg: "" });
  const [apreSuggestion, setApreSuggestion] = useState<ApreSuggestion | null>(
    null,
  );

  // Game State
  const [mana, setMana] = useState(wellness?.bodyBattery || 50);
  const maxMana = 100;
  const [manaDrain, setManaDrain] = useState<{ show: boolean; amount: number }>(
    { show: false, amount: 0 },
  );
  const [isNeuroActive, setIsNeuroActive] = useState(false);

  // REST TIMER STATE
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const achievementContext = useContext(AchievementContext);
  const { purchasedSkillIds } = useSkills();
  const unlockedIds = achievementContext?.unlockedIds || new Set();
  const { isElite } = calculateTitanRank(unlockedIds);
  const hasPrimalRoar = purchasedSkillIds.has("beast_1");

  // --- NEURO LINK LOGIC ---
  useEffect(() => {
    if (isNeuroActive) {
      if (bpm && bpm < 120) NeuroService.engageRecovery();
      else NeuroService.engageFocus();
    } else {
      NeuroService.stop();
    }
    return () => NeuroService.stop();
  }, [isNeuroActive, bpm]);

  // --- PERSISTENCE: Propagate state up whenever it changes ---
  useEffect(() => {
    if (onSessionUpdate) {
      onSessionUpdate(exercises);
    }
  }, [exercises, onSessionUpdate]);

  // --- REST TIMER LOGIC ---
  useEffect(() => {
    let interval: any;
    if (isResting) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setRestTimer(0);
    }
    return () => clearInterval(interval);
  }, [isResting]);

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const [heroName, setHeroName] = useState("Titan");
  useEffect(() => {
    IoTService.init();
    StorageService.getState<AppSettings>("settings").then((s) => {
      if (s?.heroName) setHeroName(s.heroName);
    });
  }, []);

  // Initial Cursor Position - Find first incomplete
  useEffect(() => {
    let found = false;
    for (let i = 0; i < exercises.length; i++) {
      for (let j = 0; j < exercises[i].sets.length; j++) {
        if (!exercises[i].sets[j].completed) {
          setCursor([i, j]);
          found = true;
          break;
        }
      }
      if (found) break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  useEffect(() => {
    if (!isBtConnected) return;
    if (bpm && bpm > 160) IoTService.triggerRedAlert();
    else if (bpm && bpm < 120) IoTService.triggerRecovery();
    else IoTService.triggerFocus();
  }, [bpm, isBtConnected]);

  useEffect(() => {
    if (criticalHit.show) {
      const t = setTimeout(
        () => setCriticalHit({ show: false, msg: "" }),
        2000,
      );
      return () => clearTimeout(t);
    }
  }, [criticalHit.show]);

  useEffect(() => {
    if (manaDrain.show) {
      const t = setTimeout(
        () => setManaDrain({ show: false, amount: 0 }),
        1000,
      );
      return () => clearTimeout(t);
    }
  }, [manaDrain.show]);

  const activeSetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeSetRef.current)
      activeSetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [cursor]);

  const isSystemOverheated = bpm !== null && bpm > 120;
  const isBlockComplete = exercises.every((ex) =>
    ex.sets.every((s) => s.completed),
  );
  const isManaEmpty = mana <= 0;

  const handleRepsChange = useCallback(
    (exIndex: number, setIndex: number, newReps: number) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        const newSet = { ...newExercises[exIndex].sets[setIndex] };
        newSet.completedReps = newReps;
        newExercises[exIndex].sets[setIndex] = newSet;
        return newExercises;
      });
    },
    [],
  );

  const handleWeightChange = useCallback(
    (exIndex: number, setIndex: number, newWeight: number) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        const newSet = { ...newExercises[exIndex].sets[setIndex] };
        newSet.weight = newWeight;
        // Also update percent if applicable, relative to TM? simpler to just set absolute weight for now
        // If it was logic based, we might break the logic link, but user override is king.
        newExercises[exIndex].sets[setIndex] = newSet;
        return newExercises;
      });
    },
    [],
  );

  const handleRpeChange = useCallback(
    (exIndex: number, setIndex: number, newRpe: number) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        const newSet = { ...newExercises[exIndex].sets[setIndex] };
        newSet.rpe = newRpe;
        newExercises[exIndex].sets[setIndex] = newSet;
        return newExercises;
      });
    },
    [],
  );

  const handleToggleSet = useCallback(
    (exIndex: number, setIndex: number) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        const exercise = newExercises[exIndex];
        const newSet = { ...exercise.sets[setIndex] };

        let weight = newSet.weight || 0;
        if (
          exercise.logic === ExerciseLogic.TM_PERCENT &&
          exercise.trainingMax &&
          newSet.weightPct
        ) {
          weight = roundToPlates(exercise.trainingMax * newSet.weightPct);
        }

        if (!newSet.completed && isSystemOverheated) {
          playSound("fail");
          return prev;
        }

        if (!newSet.completed) {
          // MARKING AS COMPLETE
          if (
            newSet.completedReps === undefined ||
            newSet.completedReps === 0
          ) {
            if (typeof newSet.reps === "number")
              newSet.completedReps = newSet.reps;
          }
          newSet.rarity = calculateRarity(newSet, exercise.logic);

          // Trigger Rest Timer
          setIsResting(true);

          // --- APRE LOGIC ---
          if (setIndex < exercise.sets.length - 1) {
            const nextSet = exercise.sets[setIndex + 1];
            if (
              exercise.logic === ExerciseLogic.TM_PERCENT &&
              exercise.trainingMax &&
              nextSet.weightPct
            ) {
              const currentSetWeight = weight;
              const rpe = 8;
              const suggestion = calculateApre(
                currentSetWeight,
                newSet.completedReps || 0,
                rpe,
              );
              if (suggestion) setApreSuggestion(suggestion);
            }
          }
        } else {
          // UN-COMPLETING
          setIsResting(false);
          setRestTimer(0);
        }

        newSet.completed = !newSet.completed;
        newExercises[exIndex].sets[setIndex] = newSet;

        if (newSet.completed) {
          let cost = 5;
          if (newSet.weightPct && newSet.weightPct > 0.8) cost = 10;
          if (typeof newSet.reps === "string") cost = 15;
          setMana((m) => Math.max(0, m - cost));
          setManaDrain({ show: true, amount: cost });

          const damage = Math.floor(weight * (newSet.completedReps || 1));
          RaidService.broadcastDamage(heroName, damage, exercise.name);

          if (newSet.isPrZone) IoTService.triggerRedAlert();
          else IoTService.triggerVictory();

          if (exercise.id === "ex_belt_squat" && weight >= 140)
            achievementContext?.unlockAchievement("deep_squat_dynasty");
          if (exercise.id === "ex_landmine_press" && weight >= 100)
            achievementContext?.unlockAchievement("perfect_plates");

          if (
            newSet.rarity === "legendary" ||
            newSet.rarity === "epic" ||
            newSet.rarity === "rare"
          ) {
            if (
              typeof newSet.reps === "string" ||
              (newSet.completedReps &&
                newSet.reps &&
                newSet.completedReps > newSet.reps)
            ) {
              setCriticalHit({
                show: true,
                msg: `${newSet.rarity.toUpperCase()} Performance!`,
              });
              playSound("loot_epic");
              fireConfetti();
            } else playSound("ding");
          } else playSound("ding");
        }
        return newExercises;
      });

      // Auto-advance cursor if completing
      const currentSetStatus = exercises[exIndex].sets[setIndex].completed;
      // Logic note: we are using stale state 'exercises' here, but it's OK for logic direction
      if (!currentSetStatus) {
        if (setIndex < exercises[exIndex].sets.length - 1)
          setCursor([exIndex, setIndex + 1]);
        else if (exIndex < exercises.length - 1) setCursor([exIndex + 1, 0]);
      }
    },
    [isSystemOverheated, achievementContext, heroName, exercises],
  );

  // --- VISION ---
  const handleVisionRep = useCallback(() => {
    const [exIndex, setIndex] = cursor;
    const currentSet = exercises[exIndex].sets[setIndex];
    const currentReps = currentSet.completedReps || 0;
    handleRepsChange(exIndex, setIndex, currentReps + 1);
    playSound("ding");
  }, [cursor, exercises, handleRepsChange]);

  // --- VOICE ---
  const handleVoiceCommand = useCallback(
    (type: string, value: number | string) => {
      const [exIndex, setIndex] = cursor;
      if (type === "REPS") handleRepsChange(exIndex, setIndex, value as number);
      else if (type === "COMPLETE") handleToggleSet(exIndex, setIndex);
    },
    [cursor, handleRepsChange, handleToggleSet],
  );

  const { isListening, toggleListening, lastCommand } =
    useVoiceCommand(handleVoiceCommand);

  const handleApplyApre = () => {
    if (!apreSuggestion) return;
    const [exIdx, setIdx] = cursor;

    setExercises((prev) => {
      const next = [...prev];
      const ex = next[exIdx];
      const nextSetIdx = ex.sets.findIndex(
        (s, i) => !s.completed && i > setIdx,
      ); // Find next active

      if (nextSetIdx !== -1) {
        const newWeight = apreSuggestion.newWeight;
        if (ex.trainingMax) {
          ex.sets[nextSetIdx].weightPct = newWeight / ex.trainingMax;
          ex.sets[nextSetIdx].weight = newWeight;
        }
      }
      return next;
    });
    setApreSuggestion(null);
    playSound("quest_accept");
  };

  const stateRef = useRef({
    exercises,
    cursor,
    isSystemOverheated,
    isBlockComplete,
    isManaEmpty,
  });
  useEffect(() => {
    stateRef.current = {
      exercises,
      cursor,
      isSystemOverheated,
      isBlockComplete,
      isManaEmpty,
    };
  }, [exercises, cursor, isSystemOverheated, isBlockComplete, isManaEmpty]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const {
        exercises: currExercises,
        cursor: currCursor,
        isSystemOverheated: currOverheated,
        isBlockComplete: currComplete,
        isManaEmpty: currManaEmpty,
      } = stateRef.current;
      const [exIdx, setIdx] = currCursor;

      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        if (setIdx < currExercises[exIdx].sets.length - 1)
          setCursor([exIdx, setIdx + 1]);
        else if (exIdx < currExercises.length - 1) setCursor([exIdx + 1, 0]);
      } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (setIdx > 0) setCursor([exIdx, setIdx - 1]);
        else if (exIdx > 0)
          setCursor([exIdx - 1, currExercises[exIdx - 1].sets.length - 1]);
      } else if (
        e.code === "Space" ||
        e.code === "Enter" ||
        e.code === "ArrowRight" ||
        e.code === "KeyD"
      ) {
        e.preventDefault();
        if (
          e.code === "Enter" &&
          currComplete &&
          !currOverheated &&
          !currManaEmpty
        ) {
          playSound("ding");
          onComplete();
          return;
        }
        handleToggleSet(exIdx, setIdx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleSet, onComplete]);

  const manaPct = (mana / maxMana) * 100;
  let manaColor = "bg-blue-500";
  if (manaPct < 30) manaColor = "bg-orange-500";
  if (manaPct < 10) manaColor = "bg-red-600 animate-pulse";
  const isRested = (wellness?.sleepScore || 0) > 80;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#050505] transition-colors duration-500 relative ${!isSystemOverheated && bpm ? "bg-green-950/5" : ""}`}
    >
      {/* REST TIMER HUD */}
      {isResting && (
        <div className="fixed top-24 right-4 z-50 animate-slide-left">
          <div className="bg-[#111] border-2 border-zinc-700 rounded-lg p-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                Rest Timer
              </div>
              <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-zinc-400" />
                {formatTime(restTimer)}
              </div>
            </div>
            <button
              onClick={handleSkipRest}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded text-xs font-bold uppercase"
            >
              Ready
            </button>
          </div>
        </div>
      )}

      {/* APRE TOAST */}
      {apreSuggestion && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-80">
          <div className="bg-[#111] border-2 border-cyan-500 rounded-lg p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold uppercase text-xs tracking-widest">
              <Zap className="w-4 h-4" /> Neuro-Optimization
            </div>
            <p className="text-zinc-300 text-xs mb-3">
              {apreSuggestion.reason}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleApplyApre}
                className="flex-1 bg-cyan-900/50 border border-cyan-500 text-cyan-300 hover:bg-cyan-800 text-xs font-bold py-2 rounded uppercase flex items-center justify-center gap-1"
              >
                {apreSuggestion.type === "INCREASE" ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {apreSuggestion.adjustment > 0 ? "+" : ""}
                {apreSuggestion.adjustment}kg
              </button>
              <button
                onClick={() => setApreSuggestion(null)}
                className="px-3 border border-zinc-700 text-zinc-500 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANA BAR OVERLAY */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <div
          className={`h-full transition-all duration-500 ease-out ${manaColor} shadow-[0_0_10px_currentColor]`}
          style={{ width: `${manaPct}%` }}
        />
      </div>

      {lastCommand && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-zinc-700 px-4 py-2 rounded text-xs font-mono text-green-400 animate-fade-in-out">
          &gt; {lastCommand}
        </div>
      )}

      {manaDrain.show && (
        <div className="fixed top-20 right-10 text-red-500 font-black text-2xl animate-float-up z-50 text-shadow-sm font-serif">
          -{manaDrain.amount} Mana
        </div>
      )}

      {isManaEmpty && (
        <div className="fixed inset-0 z-0 pointer-events-none bg-red-900/10 animate-pulse flex items-center justify-center">
          <div className="text-red-500/20 font-black text-9xl uppercase rotate-[-15deg]">
            Soul Burn
          </div>
        </div>
      )}

      {criticalHit.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center animate-scale-bounce">
            <div
              className="text-6xl font-black italic text-[#ffd700] uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] stroke-black"
              style={{ WebkitTextStroke: "2px black" }}
            >
              Critical Hit!
            </div>
            <div className="text-2xl font-bold text-white mt-2 bg-red-600 px-4 py-1 rounded skew-x-[-12deg] shadow-lg">
              {criticalHit.msg}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rotate-45 border ${isSystemOverheated ? "border-orange-500 bg-orange-900" : "border-green-500 bg-green-900"}`}
            ></span>
            <span
              className={`${isSystemOverheated ? "text-orange-500" : "text-green-500"} font-serif text-xs uppercase tracking-widest`}
            >
              {isSystemOverheated ? "Aggro High" : "Stealth Mode"}
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-zinc-100 uppercase tracking-wide text-shadow-sm">
            {block.name}
          </h2>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-500">
              <Battery className="w-3 h-3" /> Body Battery
            </div>
            <span
              className={`font-mono font-bold text-lg ${manaPct < 30 ? "text-red-500" : "text-blue-400"}`}
            >
              {mana} / {maxMana}
            </span>
          </div>

          <div className="h-8 w-px bg-zinc-800 hidden md:block"></div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsNeuroActive(!isNeuroActive)}
              className={`p-2 border rounded transition-colors group relative ${isNeuroActive ? "bg-purple-900/50 border-purple-500 text-purple-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}
              title="Neuro-Link (Binaural Beats)"
            >
              <Waves className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowVision(!showVision)}
              className={`p-2 border rounded transition-colors group relative ${showVision ? "bg-cyan-900/50 border-cyan-500 text-cyan-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}
              title="Titan Vision (Rep Count)"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={toggleListening}
              className={`p-2 border rounded transition-colors group relative ${isListening ? "bg-red-900/50 border-red-500 text-red-400 animate-pulse" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}
              title="Voice Commands"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={onAbort}
              className="p-2 border border-red-900/30 bg-red-950/10 rounded text-red-700 hover:text-red-500 hover:border-red-600 transition-colors"
              title="Abandon Quest"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth pb-32">
        <VisionRepCounter
          isActive={showVision}
          onRepCount={handleVisionRep}
          onClose={() => setShowVision(false)}
        />
        <HeartRateMonitor
          bpm={bpm}
          isConnected={isBtConnected}
          onConnect={onBtConnect}
          onSimulate={onBtSimulate}
          error={btError}
          hasAura={isElite}
        />

        <div
          className={`grid gap-6 ${exercises.length > 1 ? "lg:grid-cols-2" : "grid-cols-1"}`}
        >
          {exercises.map((ex, exIndex) => {
            const isLandmine = ex.name.toLowerCase().includes("landmine");
            const isInfoOpen = openInfoId === ex.id;
            const isAmrapEx = ex.sets.some((s) => typeof s.reps === "string");
            const showPrimalRoar = hasPrimalRoar && isAmrapEx;

            return (
              <div key={ex.id} className="space-y-4">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded relative">
                      <Sword className="w-5 h-5 text-zinc-400" />
                      {showPrimalRoar && (
                        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 animate-pulse">
                          <Flame className="w-2 h-2 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-zinc-200">
                        {ex.name}
                      </h3>
                      {showPrimalRoar && (
                        <span className="text-[9px] font-bold uppercase text-red-500 tracking-wider flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Primal Roar Active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setOpenInfoId(isInfoOpen ? null : ex.id)}
                      className={`p-1 rounded hover:bg-zinc-800 transition-colors ${isInfoOpen ? "text-rarity-epic" : "text-zinc-600"}`}
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  {ex.logic === ExerciseLogic.TM_PERCENT && (
                    <span className="text-xs font-mono text-zinc-600">
                      TM: {ex.trainingMax}
                    </span>
                  )}
                </div>

                {isInfoOpen && (
                  <div className="bg-[#111] border border-zinc-800 rounded p-4 text-sm animate-fade-in mb-4 shadow-xl">
                    {ex.instructions && (
                      <ul className="space-y-2 mb-4">
                        {ex.instructions.map((inst, i) => (
                          <li key={i} className="flex gap-2 text-zinc-400">
                            <span className="text-zinc-600 font-mono">
                              0{i + 1}.
                            </span>
                            <span className="font-serif italic">{inst}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {ex.sets.map((set, setIndex) => {
                    let displayWeight = set.weight || 0;
                    if (
                      ex.logic === ExerciseLogic.TM_PERCENT &&
                      ex.trainingMax &&
                      set.weightPct
                    ) {
                      displayWeight = roundToPlates(
                        ex.trainingMax * set.weightPct,
                      );
                    }
                    const isLocked = !set.completed && isSystemOverheated;
                    const isFocused =
                      cursor[0] === exIndex && cursor[1] === setIndex;
                    const displayRarity =
                      set.completed && set.rarity
                        ? set.rarity
                        : calculateRarity(set, ex.logic);

                    return (
                      <SetRow
                        key={set.id}
                        set={set}
                        exIndex={exIndex}
                        setIndex={setIndex}
                        isFocused={isFocused}
                        isLocked={isLocked}
                        displayWeight={displayWeight}
                        isLandmine={isLandmine}
                        rarity={displayRarity}
                        onToggle={handleToggleSet}
                        onRepsChange={handleRepsChange}
                        onWeightChange={handleWeightChange}
                        onRpeChange={handleRpeChange}
                        previous={previousStats[ex.id]} // Simplified: same previous for all sets of same exercise
                        activeSetRef={isFocused ? activeSetRef : null}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-zinc-700 text-xs font-serif uppercase tracking-widest mt-8 flex flex-col gap-3">
          <button
            onClick={() => setOpenInfoId("ADD_EXERCISE")} // repurposed for modal
            className="flex items-center justify-center gap-2 py-3 px-6 bg-zinc-900 border border-zinc-800 rounded mx-auto hover:bg-zinc-800 hover:text-white transition-all text-zinc-500 font-bold w-full max-w-xs"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
          <span>[ WASD Controls Active ]</span>
        </div>
      </div>

      {/* EXERCISE LIBRARY MODAL */}
      {openInfoId === "ADD_EXERCISE" && (
        <div className="fixed inset-0 z-[100] animate-fade-in">
          <ExerciseLibrary
            onSelect={(exId) => {
              // Mock adding exercise logic - needing real exercise data lookup
              // For now, we will just add a dummy "New Exercise" or fetch from Library logic
              // Since ExerciseLibrary has mock data, we need to map it to our Exercise type

              const newExercise: Exercise = {
                id: exId + "_" + Date.now(),
                name: "New Exercise", // Should get from library
                logic: ExerciseLogic.FIXED_REPS,
                sets: [
                  {
                    id: "new_set_1",
                    reps: 10,
                    weight: 20,
                    completed: false,
                    type: "straight",
                  },
                  {
                    id: "new_set_2",
                    reps: 10,
                    weight: 20,
                    completed: false,
                    type: "straight",
                  },
                  {
                    id: "new_set_3",
                    reps: 10,
                    weight: 20,
                    completed: false,
                    type: "straight",
                  },
                ],
              };
              setExercises((prev) => [...prev, newExercise]);
              setOpenInfoId(null);
              playSound("quest_accept");
            }}
            onClose={() => setOpenInfoId(null)}
          />
        </div>
      )}

      <div className="p-6 bg-zinc-950 border-t border-zinc-900 sticky bottom-0 z-40">
        <div className="flex items-center justify-between mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          <span>Potential XP: {isRested ? "Double (Rested)" : "Normal"}</span>
          <span>Mana Status: {isManaEmpty ? "DEPLETED" : "Stable"}</span>
        </div>

        <button
          onClick={() => {
            if (isBlockComplete && !isSystemOverheated && !isManaEmpty) {
              playSound("ding");
              onComplete();
            }
          }}
          disabled={!isBlockComplete || isSystemOverheated || isManaEmpty}
          className={`w-full h-16 font-serif font-black text-xl uppercase tracking-widest rounded flex items-center justify-center gap-3 transition-all border-2 
             ${
               isBlockComplete && !isSystemOverheated && !isManaEmpty
                 ? "bg-rarity-legendary/10 border-rarity-legendary text-rarity-legendary hover:bg-rarity-legendary hover:text-white shadow-[0_0_30px_rgba(255,128,0,0.2)]"
                 : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
             }`}
        >
          {isManaEmpty
            ? "Mana Depleted - Recover!"
            : isBlockComplete
              ? isSystemOverheated
                ? "Wait for Aggro Drop"
                : "Complete Quest Step"
              : "Objectives Remaining"}
          {isBlockComplete && !isSystemOverheated && !isManaEmpty && (
            <Crown className="w-6 h-6" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-50px); opacity: 0; }
        }
        .animate-float-up {
            animation: floatUp 1s ease-out forwards;
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
        .animate-fade-in-out {
            animation: fadeOut 2s forwards;
        }
        @keyframes slideLeft {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left {
            animation: slideLeft 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ActionView;

import {
  evaluateAndSaveProgressionAction,
  getSavedProgressionAction,
} from '@/actions/training/progressionDecision';
import type { SetData } from '@/actions/training/strength';
import { ExerciseProgressChart } from '@/components/charts/ExerciseProgressChart';
import { DemoVideoModal } from '@/components/ui/DemoVideoModal';
import { PRBadge } from '@/components/ui/PRBadge';
import { Card } from '@/components/ui/card';
import { SetRow } from '@/features/strength/SetRow';
import { getExerciseHistory } from '@/features/strength/actions/history';
import { useSetHistory } from '@/features/strength/hooks/useSetHistory';
import {
  type RepGoalExercise,
  getRepGoalProgress,
  isExerciseComplete,
} from '@/features/strength/utils/repGoal';
import { useMaxReps } from '@/hooks/useMaxReps';
import { useRestTimer } from '@/hooks/useRestTimer';
import { cn } from '@/lib/utils';
import type { ProgressionDecision, SetRole } from '@/services/training/progressionEngine';
import type { Exercise } from '@/types';
import { type PanInfo, m, useMotionValue, useTransform } from 'framer-motion';
import { BarChart2, CheckCircle, ChevronDown, ChevronsRight, PlayCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { ProgressionProfileControl } from './ProgressionProfileControl';
import SetInput from './SetInput';

interface ExerciseViewProps {
  exercise: Exercise;
  isActive: boolean;
  isCompleted: boolean;
  onSetLog: (weight: number, reps: number, rpe: number) => void;
  onNotesChange?: (notes: string) => void;
  onSetUpdate?: (setIndex: number, updates: Partial<SetData>) => void;
}

type SavedDecision = ProgressionDecision & {
  savedAt: string;
};

const cardVariants = {
  inactive: { opacity: 0.5, scale: 0.95 },
  active: { opacity: 1, scale: 1 },
  completed: { opacity: 0.35, scale: 0.92 },
};

function inferSetRole(index: number, isWarmup?: boolean): SetRole {
  if (isWarmup) return 'WARMUP';
  return index === 0 ? 'TOP' : 'BACKOFF';
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  isActive,
  isCompleted,
  onSetLog,
  onNotesChange,
  onSetUpdate,
}) => {
  const repGoalExercise = exercise as RepGoalExercise;
  const repGoal = getRepGoalProgress(repGoalExercise);
  const exerciseComplete = isExerciseComplete(repGoalExercise);
  const activeSet = exerciseComplete ? undefined : exercise.sets.find((s) => !s.completed);
  const allSetsCompleted = exerciseComplete;
  const [showDemo, setShowDemo] = useState(false);
  const [savedDecision, setSavedDecision] = useState<SavedDecision | null>(null);
  const progressionSavedRef = useRef(false);
  const prescriptionAppliedRef = useRef(false);
  const { start } = useRestTimer();

  const { maxReps, isLoading: isMaxRepsLoading } = useMaxReps(exercise.id, activeSet?.weight);

  const { history: _history } = useSetHistory(exercise.id, exercise.name);
  const [showHistory, setShowHistory] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    getSavedProgressionAction(exercise.id)
      .then((decision) => {
        if (!cancelled) setSavedDecision(decision);
      })
      .catch((error) => console.error('Failed to load progression decision:', error));

    return () => {
      cancelled = true;
    };
  }, [exercise.id]);

  React.useEffect(() => {
    if (!savedDecision || prescriptionAppliedRef.current || !onSetUpdate) return;

    savedDecision.nextPrescription.forEach((target, index) => {
      const set = exercise.sets[index];
      if (!set || set.completed || set.weight) return;
      onSetUpdate(index, {
        weight: target.targetWeight,
        reps: target.targetReps ?? target.minimumReps,
        rpe: target.targetRpe,
      });
    });
    prescriptionAppliedRef.current = true;
  }, [exercise.sets, onSetUpdate, savedDecision]);

  React.useEffect(() => {
    if (!allSetsCompleted || progressionSavedRef.current) return;

    const completedSets = exercise.sets
      .map((set, index) => ({
        weight: set.weight ?? 0,
        reps:
          set.completedReps ??
          (typeof set.reps === 'number' ? set.reps : Number.parseInt(set.reps, 10) || 0),
        rpe: set.rpe,
        setRole: inferSetRole(index, set.isWarmup),
        isWarmup: set.isWarmup,
      }))
      .filter((set) => set.weight > 0 && set.reps > 0);

    if (completedSets.length === 0) return;

    const prescription = exercise.sets.map((set, index) => {
      const plannedReps =
        typeof set.reps === 'number' ? set.reps : Number.parseInt(set.reps, 10) || 1;
      return {
        targetWeight: set.weight ?? completedSets[index]?.weight ?? 0,
        minimumReps: Math.max(1, plannedReps),
        targetReps: Math.max(1, set.repGoal ?? plannedReps),
        maximumReps: Math.max(1, set.repGoal ?? plannedReps),
        targetRpe: set.rpe,
        setRole: inferSetRole(index, set.isWarmup),
      };
    });

    progressionSavedRef.current = true;
    evaluateAndSaveProgressionAction(exercise.id, {
      method: repGoal ? 'REP_GOAL' : 'DOUBLE_PROGRESSION',
      prescription,
      completedSets,
      repGoal: repGoal?.targetReps,
      equipment: { minimumIncrement: 2.5 },
    })
      .then((result) => {
        if (result.success) setSavedDecision(result.decision);
        else progressionSavedRef.current = false;
      })
      .catch((error) => {
        progressionSavedRef.current = false;
        console.error('Failed to save progression decision:', error);
      });
  }, [allSetsCompleted, exercise.id, exercise.sets, repGoal]);

  React.useEffect(() => {
    if (showHistory && chartData.length === 0) {
      setIsChartLoading(true);
      getExerciseHistory(exercise.id)
        .then((data) => setChartData(data))
        .finally(() => setIsChartLoading(false));
    }
  }, [showHistory, chartData.length, exercise.id]);

  const x = useMotionValue(0);
  const bg = useTransform(x, [0, 100], ['rgba(0,0,0,0)', 'rgba(34, 197, 94, 0.2)']);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100 && isActive && activeSet) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      onSetLog(
        activeSet.weight || 0,
        typeof activeSet.reps === 'number' ? activeSet.reps : 0,
        activeSet.rpe || 8
      );
    }
  };

  const getAnimationState = () => {
    if (allSetsCompleted || isCompleted) return 'completed';
    if (isActive) return 'active';
    return 'inactive';
  };

  const getRestTime = (type?: string, isWarmup?: boolean) => {
    if (isWarmup || type === 'warmup') return 60;
    if (type === 'failure') return 120;
    if (type === 'myoreps') return 30;
    return 90;
  };

  const handleSetLogWrapper = (weight: number, reps: number, rpe: number) => {
    onSetLog(weight, reps, rpe);
    const remainingSets = exercise.sets.filter((s) => !s.completed).length;
    if (remainingSets > 0) start(getRestTime(activeSet?.setType, activeSet?.isWarmup));
  };

  return (
    <m.div
      variants={cardVariants}
      animate={getAnimationState()}
      initial="inactive"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      layout
      style={{ x, backgroundColor: bg }}
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      <Card
        variant="glass"
        className={`transition-all duration-500 ${isActive ? 'border-magma/80 shadow-glow-magma/40' : 'border-white/10'}`}
      >
        {isActive && activeSet && exercise.sets.filter((s) => s.completed).length === 0 && (
          <div className="text-center text-[10px] text-zinc-500 mb-2 flex items-center justify-center gap-1 animate-pulse">
            <span>← Swipe right to complete →</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xl text-white tracking-wider">{exercise.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDemo(true);
              }}
              className="text-zinc-500 hover:text-magma transition-colors"
              title="Watch Demo"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(!showHistory);
              }}
              className={cn(
                'transition-colors',
                showHistory ? 'text-magma' : 'text-zinc-500 hover:text-magma'
              )}
              title="View Progress"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <ProgressionProfileControl exercise={exercise} />
          </div>

          <div className="flex items-center gap-2">
            {isActive && activeSet && (
              <PRBadge
                maxReps={maxReps}
                weight={activeSet.weight}
                isLoading={isMaxRepsLoading}
                size="sm"
              />
            )}
            {allSetsCompleted ? (
              <CheckCircle className="text-green-500" />
            ) : isActive ? (
              <ChevronsRight className="text-magma animate-pulse" />
            ) : (
              <ChevronDown className="text-forge-muted" />
            )}
          </div>
        </div>

        {repGoal && (
          <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span className="text-cyan-300">Rep quest</span>
              <span className="text-white">
                {repGoal.completedReps} / {repGoal.targetReps}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${repGoal.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {repGoal.isComplete
                ? 'Quest complete'
                : `${repGoal.remainingReps} reps kvar — fördela dem över återstående set.`}
            </p>
          </div>
        )}

        {savedDecision && (
          <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3 text-xs">
            <div className="font-mono uppercase tracking-wider text-zinc-300">
              Nästa progression: {savedDecision.action}
            </div>
            <p className="mt-1 text-zinc-500">{savedDecision.reason}</p>
          </div>
        )}

        {isActive && (
          <div className="mb-4 animate-fade-in">
            <textarea
              placeholder="Workout notes..."
              value={exercise.notes || ''}
              onChange={(e) => onNotesChange?.(e.target.value)}
              className="w-full bg-black/20 text-zinc-400 text-sm p-2 rounded-md border border-white/5 focus:border-zinc-500 focus:outline-none resize-none h-16"
            />
          </div>
        )}

        {showHistory && (
          <div className="mb-4 animate-fade-in">
            <ExerciseProgressChart data={chartData} isLoading={isChartLoading} />
          </div>
        )}

        <div className="space-y-2 mb-4">
          {exercise.sets.map((set, index) => {
            const goal = savedDecision?.setGoals[index];
            return (
              <SetRow
                key={`${exercise.id}-${set.id}-${index}`}
                set={
                  {
                    ...set,
                    reps: typeof set.reps === 'string' ? Number.parseInt(set.reps) || 0 : set.reps,
                    isWarmup: set.isWarmup ?? false,
                    repGoal: goal?.repGoal ?? set.repGoal,
                    e1rmGoalReps: goal?.e1rmGoalReps ?? set.e1rmGoalReps,
                    e1rmTarget: goal?.e1rmTarget ?? set.e1rmTarget,
                  } as any
                }
                setNumber={index + 1}
                onChange={(updates) => onSetUpdate?.(index, updates)}
              />
            );
          })}
        </div>

        {isActive && activeSet && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SetInput
              onSetLog={handleSetLogWrapper}
              targetReps={
                repGoal
                  ? Math.min(
                      repGoal.remainingReps,
                      typeof activeSet.reps === 'string'
                        ? 0
                        : activeSet.reps || repGoal.remainingReps
                    )
                  : typeof activeSet.reps === 'string'
                    ? 0
                    : activeSet.reps || 0
              }
              targetRPE={activeSet.rpe || 8}
            />
          </m.div>
        )}
      </Card>

      <DemoVideoModal
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        exerciseName={exercise.name}
        videoUrl={exercise.demoUrl}
      />
    </m.div>
  );
};

export default ExerciseView;

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ChevronDown, ChevronsRight, CheckCircle, PlayCircle } from "lucide-react";
import { Exercise } from "@/types";
import { cn } from "@/lib/utils";
import { SetRow } from "@/features/strength/SetRow";
import SetInput from "./SetInput";
import ForgeCard from "../../../components/ui/ForgeCard";
import { DemoVideoModal } from "@/components/ui/DemoVideoModal";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useSetHistory } from "@/features/strength/hooks/useSetHistory";
import { ExerciseProgressChart } from "@/components/charts/ExerciseProgressChart";
import { getExerciseHistory } from "@/features/strength/actions/history";
import { BarChart2 } from "lucide-react";
import PRBadge from "@/components/ui/PRBadge";
import { useMaxReps } from "@/hooks/useMaxReps";

import { SetData } from "@/actions/training/strength";

interface ExerciseViewProps {
  exercise: Exercise;
  isActive: boolean;
  isCompleted: boolean;
  onSetLog: (weight: number, reps: number, rpe: number) => void;
  onNotesChange?: (notes: string) => void;
  onSetUpdate?: (setIndex: number, updates: Partial<SetData>) => void;
}

const cardVariants = {
  inactive: { opacity: 0.5, scale: 0.95 },
  active: { opacity: 1, scale: 1 },
  completed: { opacity: 0.35, scale: 0.92 },
};

const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  isActive,
  isCompleted,
  onSetLog,
  onNotesChange,
  onSetUpdate,
}) => {
  const activeSet = exercise.sets.find((s) => !s.completed);
  const allSetsCompleted = exercise.sets.every((s) => s.completed);
  const [showDemo, setShowDemo] = useState(false);
  const { start } = useRestTimer();

  // PR Tracking
  const { maxReps, isLoading: isMaxRepsLoading } = useMaxReps(
    exercise.id,
    activeSet?.weight // Auto-fetch when weight changes or active set changes
  );

  // Pre-fill history
  const { history: _history } = useSetHistory(exercise.id, exercise.name);
  const [showHistory, setShowHistory] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  React.useEffect(() => {
    if (showHistory && chartData.length === 0) {
      setIsChartLoading(true);
      getExerciseHistory(exercise.id)
        .then(data => setChartData(data))
        .finally(() => setIsChartLoading(false));
    }
  }, [showHistory, exercise.id]);

  // Gestures
  const x = useMotionValue(0);
  // const opacity = useTransform(x, [0, 100], [1, 0]);
  const bg = useTransform(x, [0, 100], ["rgba(0,0,0,0)", "rgba(34, 197, 94, 0.2)"]); // Green tint on swipe right

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100 && isActive && activeSet) {
      // Haptic Feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Swipe Right -> Complete Set
      onSetLog(activeSet.weight || 0, (typeof activeSet.reps === 'number' ? activeSet.reps : 0), activeSet.rpe || 8);
    }
  };

  const getAnimationState = () => {
    if (allSetsCompleted || isCompleted) return "completed";
    if (isActive) return "active";
    return "inactive";
  };

  // Helper to determine rest time based on set type
  const getRestTime = (type?: string, isWarmup?: boolean) => {
    if (isWarmup || type === "warmup") return 60;
    if (type === "failure") return 120;
    if (type === "myoreps") return 30; // Shorter rest
    return 90; // Normal
  };

  const handleSetLogWrapper = (weight: number, reps: number, rpe: number) => {
    onSetLog(weight, reps, rpe);

    // Auto-start timer if more sets remain, or even if done (cooldown)
    // Checking remaining sets from current active index onwards
    const remainingSets = exercise.sets.filter(s => !s.completed).length;

    if (remainingSets > 0) { // If we just finished a set, remaining count acts weird before update?
      // Actually activeSet is the one currently being logged.
      const restSeconds = getRestTime(activeSet?.setType, activeSet?.isWarmup);
      start(restSeconds);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      animate={getAnimationState()}
      initial="inactive"
      transition={{ duration: 0.5, ease: "easeInOut" }}
      layout
      style={{ x, backgroundColor: bg }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      <ForgeCard
        className={`transition-all duration-500 ${isActive ? "border-magma/80 shadow-glow-magma/40" : "border-white/10"}`}
      >
        {/* Swipe Hint - only on first active set */}
        {isActive && activeSet && !activeSet.completed && exercise.sets.filter(s => s.completed).length === 0 && (
          <div className="text-center text-[10px] text-zinc-500 mb-2 flex items-center justify-center gap-1 animate-pulse">
            <span>← Swipe right to complete →</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xl text-white tracking-wider">
              {exercise.name}
            </h3>
            {/* Demo Button */}
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
                "transition-colors",
                showHistory ? "text-magma" : "text-zinc-500 hover:text-magma"
              )}
              title="View Progress"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
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

        {/* Notes Field */}
        {isActive && (
          <div className="mb-4 animate-fade-in">
            <textarea
              placeholder="Workout notes..."
              value={exercise.notes || ""}
              onChange={(e) => onNotesChange?.(e.target.value)}
              className="w-full bg-black/20 text-zinc-400 text-sm p-2 rounded-md border border-white/5 focus:border-zinc-500 focus:outline-none resize-none h-16"
            />
          </div>
        )}

        {/* History Chart */}
        {showHistory && (
          <div className="mb-4 animate-fade-in">
            <ExerciseProgressChart data={chartData} isLoading={isChartLoading} />
          </div>
        )}

        <div className="space-y-2 mb-4">
          {exercise.sets.map((set, index) => (
            <SetRow
              key={`${exercise.id}-${set.id}-${index}`}
              set={{
                ...set,
                reps: typeof set.reps === "string" ? parseInt(set.reps) || 0 : set.reps,
                isWarmup: set.isWarmup ?? false,
              } as any}
              setNumber={index + 1}
              onChange={(updates) => onSetUpdate?.(index, updates)}
            />
          ))}
        </div>

        {isActive && activeSet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SetInput
              onSetLog={handleSetLogWrapper}
              targetReps={
                typeof activeSet.reps === "string" ? 0 : activeSet.reps || 0
              }
              targetRPE={activeSet.rpe || 8}
            />
          </motion.div>
        )}
      </ForgeCard>

      <DemoVideoModal
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        exerciseName={exercise.name}
        videoUrl={exercise.demoUrl}
      />
    </motion.div>
  );
};

export default ExerciseView;

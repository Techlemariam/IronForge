import type { Set as WorkoutSet } from '@/types';
import {
  getProgressionGoalStatus,
  type ProgressionGoalFields,
} from '@/features/training/types/progressionGoals';
import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
import type React from 'react';
import { twMerge } from 'tailwind-merge';

interface SetRowProps {
  set: WorkoutSet & ProgressionGoalFields;
  setNumber: number;
}

const RARITY_STYLES: Partial<Record<NonNullable<WorkoutSet['rarity']>, string>> = {
  common: 'bg-void/40',
  uncommon: 'bg-green-600/10 border-l-2 border-green-500',
  rare: 'bg-blue-600/10 border-l-2 border-blue-500',
  epic: 'bg-purple-600/10 border-l-2 border-purple-500',
  legendary: 'bg-orange-500/10 border-l-2 border-orange-400 shadow-glow-orange/30',
};

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

function getRowClass(set: WorkoutSet): string {
  const baseClasses =
    'grid grid-cols-5 items-center font-mono text-sm p-2 rounded-md transition-all duration-300';
  const pendingClasses = 'bg-obsidian/30';
  if (!set.completed) return twMerge(baseClasses, pendingClasses);

  const rarityClass = set.rarity ? RARITY_STYLES[set.rarity] : undefined;
  return twMerge(baseClasses, rarityClass ?? pendingClasses);
}

function SetStatusIcon({ completed, rarity }: Pick<WorkoutSet, 'completed' | 'rarity'>) {
  if (!completed) return <div className="w-4 h-4 border-2 border-forge-border rounded-full" />;

  return (
    <Check
      size={16}
      className={rarity === 'legendary' ? 'text-orange-400' : 'text-magma'}
    />
  );
}

function CompletedSetCells({ set }: { set: WorkoutSet }) {
  return (
    <>
      <span className="text-center font-bold">{set.weight} kg</span>
      <span className="text-center font-bold">{set.completedReps} reps</span>
      <div className="flex items-center justify-center">
        {set.isPr && <Crown size={14} className="text-yellow-400 mr-1" />}
        <span className="opacity-80">@{set.rpe}</span>
      </div>
      <div className="flex items-center justify-end space-x-1 text-rune">
        <Zap size={14} />
        <span>{Math.round(set.e1rm || 0)}</span>
      </div>
    </>
  );
}

function PendingSetCells({ set }: { set: WorkoutSet }) {
  const plannedReps = typeof set.reps === 'string' ? set.reps : set.reps || '-';

  return (
    <>
      <span className="text-center text-forge-muted">{set.weight ?? '-'} kg</span>
      <span className="text-center text-forge-muted">{plannedReps} reps</span>
      <span className="text-center text-forge-muted">@{set.rpe ?? '-'}</span>
      <span className="text-right text-forge-muted">-</span>
    </>
  );
}

function GoalBadges({ set }: { set: WorkoutSet & ProgressionGoalFields }) {
  const hasRepGoal = set.repGoal !== undefined;
  const hasE1rmGoal = set.e1rmGoalReps !== undefined && set.e1rmTarget !== undefined;
  if (!hasRepGoal && !hasE1rmGoal) return null;

  const { repGoalReached, e1rmGoalReached } = getProgressionGoalStatus(
    set,
    set.completed,
    set.completedReps
  );

  return (
    <div className="flex gap-3 px-2 text-xs text-forge-muted">
      {hasRepGoal && (
        <span className={repGoalReached ? 'text-green-400' : undefined}>
          Rep goal: {set.repGoal}
        </span>
      )}
      {hasE1rmGoal && (
        <span className={e1rmGoalReached ? 'text-green-400' : undefined}>
          e1RM bonus: {set.e1rmGoalReps} reps
        </span>
      )}
    </div>
  );
}

const SetRow: React.FC<SetRowProps> = ({ set, setNumber }) => (
  <div className="space-y-1">
    <motion.div
      className={getRowClass(set)}
      variants={ROW_VARIANTS}
      initial="visible"
      animate="visible"
      transition={{ duration: 0.5 }}
      layout
    >
      <div className="flex items-center space-x-2">
        <SetStatusIcon completed={set.completed} rarity={set.rarity} />
        <span className="font-body uppercase">Set {setNumber}</span>
      </div>

      {set.completed ? <CompletedSetCells set={set} /> : <PendingSetCells set={set} />}
    </motion.div>

    <GoalBadges set={set} />
  </div>
);

export default SetRow;

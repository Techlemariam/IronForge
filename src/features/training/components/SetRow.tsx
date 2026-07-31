import type { Set as WorkoutSet } from '@/types';
import { motion } from 'framer-motion';
import { Check, Crown, Target, Zap } from 'lucide-react';
import type React from 'react';
import { twMerge } from 'tailwind-merge';

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
}

const rarityStyles: Record<string, string> = {
  common: 'bg-void/40',
  uncommon: 'bg-green-600/10 border-l-2 border-green-500',
  rare: 'bg-blue-600/10 border-l-2 border-blue-500',
  epic: 'bg-purple-600/10 border-l-2 border-purple-500',
  legendary: 'bg-orange-500/10 border-l-2 border-orange-400 shadow-glow-orange/30',
};

const rowVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const CompletedCells: React.FC<{ set: WorkoutSet }> = ({ set }) => (
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

const PendingCells: React.FC<{ set: WorkoutSet }> = ({ set }) => (
  <>
    <span className="text-center text-forge-muted">
      {set.weight !== undefined ? `${set.weight} kg` : '- kg'}
    </span>
    <span className="text-center text-forge-muted">
      {typeof set.reps === 'string' ? set.reps : set.reps || '-'} reps
    </span>
    <span className="text-center text-forge-muted">@{set.rpe ?? '-'}</span>
    <span className="text-right text-forge-muted">-</span>
  </>
);

const GoalSummary: React.FC<{ set: WorkoutSet }> = ({ set }) => {
  const { completed, completedReps, repGoal, e1rmGoalReps, e1rmTarget } = set;
  const hasRepGoal = repGoal !== undefined;
  const hasE1rmGoal = e1rmGoalReps !== undefined;

  if (!hasRepGoal && !hasE1rmGoal) {
    return null;
  }

  const repGoalReached =
    completed && hasRepGoal && completedReps !== undefined && completedReps >= repGoal;
  const e1rmGoalReached =
    completed && hasE1rmGoal && completedReps !== undefined && completedReps >= e1rmGoalReps;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-xs font-mono text-forge-muted">
      {hasRepGoal && (
        <span className={repGoalReached ? 'text-green-400' : undefined}>
          <Target size={12} className="mr-1 inline" />
          Mål: {repGoal} reps{repGoalReached ? ' ✓' : ''}
        </span>
      )}
      {hasE1rmGoal && (
        <span className={e1rmGoalReached ? 'text-rune' : undefined}>
          <Crown size={12} className="mr-1 inline" />
          Bonus: {e1rmGoalReps} reps
          {e1rmTarget !== undefined ? ` för ${Math.round(e1rmTarget)} e1RM` : ''}
          {e1rmGoalReached ? ' ✓' : ''}
        </span>
      )}
    </div>
  );
};

const SetRow: React.FC<SetRowProps> = ({ set, setNumber }) => {
  const pendingClasses = 'bg-obsidian/30';
  const rowClass = twMerge(
    'grid grid-cols-5 items-center font-mono text-sm p-2 rounded-md transition-all duration-300',
    set.completed ? rarityStyles[set.rarity || 'common'] || pendingClasses : pendingClasses
  );

  return (
    <motion.div
      className="space-y-1"
      variants={rowVariants}
      initial="visible"
      animate="visible"
      transition={{ duration: 0.5 }}
      layout
    >
      <div className={rowClass}>
        <div className="flex items-center space-x-2">
          {set.completed ? (
            <Check
              size={16}
              className={set.rarity === 'legendary' ? 'text-orange-400' : 'text-magma'}
            />
          ) : (
            <div className="w-4 h-4 border-2 border-forge-border rounded-full" />
          )}
          <span className="font-body uppercase">Set {setNumber}</span>
        </div>

        {set.completed ? <CompletedCells set={set} /> : <PendingCells set={set} />}
      </div>

      <GoalSummary set={set} />
    </motion.div>
  );
};

export default SetRow;

import type { Set as WorkoutSet } from '@/types';
import { motion } from 'framer-motion';
import { Check, Crown, Target, Zap } from 'lucide-react';
import type React from 'react';
import { twMerge } from 'tailwind-merge';

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
}

const SetRow: React.FC<SetRowProps> = ({ set, setNumber }) => {
  const {
    completed,
    weight,
    completedReps,
    reps,
    rpe,
    e1rm,
    rarity,
    isPr,
    repGoal,
    e1rmGoalReps,
    e1rmTarget,
  } = set;

  const baseClasses =
    'grid grid-cols-5 items-center font-mono text-sm p-2 rounded-md transition-all duration-300';
  const pendingClasses = 'bg-obsidian/30';

  const rarityStyles: { [key: string]: string } = {
    common: 'bg-void/40',
    uncommon: 'bg-green-600/10 border-l-2 border-green-500',
    rare: 'bg-blue-600/10 border-l-2 border-blue-500',
    epic: 'bg-purple-600/10 border-l-2 border-purple-500',
    legendary: 'bg-orange-500/10 border-l-2 border-orange-400 shadow-glow-orange/30',
  };

  const rowClass = twMerge(
    baseClasses,
    completed ? rarityStyles[rarity || 'common'] || pendingClasses : pendingClasses
  );

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const repGoalReached =
    completed && repGoal !== undefined && completedReps !== undefined && completedReps >= repGoal;
  const e1rmGoalReached =
    completed &&
    e1rmGoalReps !== undefined &&
    completedReps !== undefined &&
    completedReps >= e1rmGoalReps;

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
          {completed ? (
            <Check size={16} className={rarity === 'legendary' ? 'text-orange-400' : 'text-magma'} />
          ) : (
            <div className="w-4 h-4 border-2 border-forge-border rounded-full" />
          )}
          <span className="font-body uppercase">Set {setNumber}</span>
        </div>

        {completed ? (
          <>
            <span className="text-center font-bold">{weight} kg</span>
            <span className="text-center font-bold">{completedReps} reps</span>
            <div className="flex items-center justify-center">
              {isPr && <Crown size={14} className="text-yellow-400 mr-1" />}
              <span className="opacity-80">@{rpe}</span>
            </div>
            <div className="flex items-center justify-end space-x-1 text-rune">
              <Zap size={14} />
              <span>{Math.round(e1rm || 0)}</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-center text-forge-muted">
              {weight !== undefined ? `${weight} kg` : '- kg'}
            </span>
            <span className="text-center text-forge-muted">
              {typeof reps === 'string' ? reps : reps || '-'} reps
            </span>
            <span className="text-center text-forge-muted">@{rpe ?? '-'}</span>
            <span className="text-right text-forge-muted">-</span>
          </>
        )}
      </div>

      {(repGoal !== undefined || e1rmGoalReps !== undefined) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-xs font-mono text-forge-muted">
          {repGoal !== undefined && (
            <span className={repGoalReached ? 'text-green-400' : undefined}>
              <Target size={12} className="mr-1 inline" />
              Mål: {repGoal} reps{repGoalReached ? ' ✓' : ''}
            </span>
          )}
          {e1rmGoalReps !== undefined && (
            <span className={e1rmGoalReached ? 'text-rune' : undefined}>
              <Crown size={12} className="mr-1 inline" />
              Bonus: {e1rmGoalReps} reps
              {e1rmTarget !== undefined ? ` för ${Math.round(e1rmTarget)} e1RM` : ''}
              {e1rmGoalReached ? ' ✓' : ''}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SetRow;

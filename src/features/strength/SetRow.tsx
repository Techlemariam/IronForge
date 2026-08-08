'use client';

import type { SetData } from '@/actions/training/strength';
import {
  getProgressionGoalStatus,
  type ProgressionGoalFields,
} from '@/features/training/types/progressionGoals';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export type SetType = 'normal' | 'failure' | 'dropset' | 'warmup' | 'myoreps';

type GoalAwareSetData = SetData & ProgressionGoalFields;

const SET_TYPE_CONFIG: Record<SetType, { label: string; icon: string; color: string }> = {
  normal: { label: 'Normal', icon: '', color: 'text-zinc-400' },
  failure: { label: 'Failure', icon: '🔥', color: 'text-orange-500' },
  dropset: { label: 'Drop', icon: '⬇️', color: 'text-blue-500' },
  warmup: { label: 'Warm', icon: '🌡️', color: 'text-yellow-500' },
  myoreps: { label: 'Myo', icon: '⚡', color: 'text-purple-500' },
};

interface SetRowProps {
  index?: number;
  setNumber?: number;
  set: GoalAwareSetData;
  onChange?: (updates: Partial<GoalAwareSetData>) => void;
  onDelete?: () => void;
  onComplete?: () => void;
  lastPerformance?: { weight: number; reps: number } | null;
}

export const SetRow: React.FC<SetRowProps> = ({
  index,
  setNumber,
  set,
  onChange,
  onDelete: _onDelete,
  onComplete,
  lastPerformance,
}) => {
  const displayIndex = setNumber || (index !== undefined ? index + 1 : 1);
  const setIdentity = set.id ?? `set-${displayIndex}`;
  const lastWeight = lastPerformance?.weight;
  const lastReps = lastPerformance?.reps;

  const [reps, setReps] = useState(set.reps || 0);
  const [weight, setWeight] = useState(set.weight || 0);
  const [rpe, setRpe] = useState(set.rpe || 8);
  const [setType, setSetType] = useState<SetType>((set.setType as SetType) || 'normal');
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  useEffect(() => {
    setReps(set.reps);
    setWeight(set.weight);
    setRpe(set.rpe || 8);
    setSetType((set.setType as SetType) || 'normal');
  }, [set.id, set.reps, set.rpe, set.setType, set.weight]);

  useEffect(() => {
    if (lastWeight === undefined || lastReps === undefined || set.completedAt) {
      return;
    }

    setWeight((currentWeight) => (currentWeight === 0 ? lastWeight : currentWeight));
    setReps((currentReps) => (currentReps === 0 ? lastReps : currentReps));
  }, [lastReps, lastWeight, set.completedAt, setIdentity]);

  const handleComplete = () => {
    onChange?.({ reps, weight, rpe, setType });
    onComplete?.();
  };

  const handleSetTypeChange = (newType: SetType) => {
    setSetType(newType);
    onChange?.({ setType: newType });
    setShowTypeMenu(false);
  };

  const currentTypeConfig = SET_TYPE_CONFIG[setType];
  const hasE1rmGoal = set.e1rmGoalReps !== undefined && set.e1rmTarget !== undefined;
  const { repGoalReached, e1rmGoalReached } = getProgressionGoalStatus(
    set,
    Boolean(set.completedAt),
    reps
  );

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'grid grid-cols-12 gap-2 items-center p-2 rounded-md transition-colors relative',
          set.completedAt ? 'bg-green-500/10' : 'bg-black/20'
        )}
      >
        <div className="col-span-1 text-center relative">
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className={cn('font-bold transition-colors', currentTypeConfig.color)}
            title={`Set Type: ${currentTypeConfig.label}`}
          >
            {currentTypeConfig.icon || displayIndex}
            {!currentTypeConfig.icon && <span className="text-zinc-500">{displayIndex}</span>}
          </button>

          {showTypeMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[100px]">
              {Object.entries(SET_TYPE_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleSetTypeChange(type as SetType)}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-700 transition-colors flex items-center gap-2',
                    setType === type && 'bg-zinc-700'
                  )}
                >
                  <span>{config.icon || '○'}</span>
                  <span className={config.color}>{config.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-3 relative">
          <input
            type="number"
            value={weight || ''}
            onChange={(event) => setWeight(Number.parseFloat(event.target.value) || 0)}
            placeholder={lastPerformance ? `${lastPerformance.weight}kg` : 'kg'}
            className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono relative z-10"
          />
        </div>

        <div className="col-span-3">
          <input
            type="number"
            value={reps || ''}
            onChange={(event) => setReps(Number.parseFloat(event.target.value) || 0)}
            placeholder={lastPerformance ? `${lastPerformance.reps}` : 'reps'}
            className={cn(
              'w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono',
              setType === 'failure' && 'text-orange-400 font-bold'
            )}
          />
        </div>

        <div className="col-span-3">
          <input
            type="number"
            value={rpe || ''}
            onChange={(event) => setRpe(Number.parseFloat(event.target.value) || 0)}
            placeholder="RPE"
            className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono text-xs text-zinc-400"
          />
        </div>

        <div className="col-span-2 flex items-center justify-end gap-2">
          <button
            onClick={handleComplete}
            className={cn(
              'transition-colors',
              set.completedAt ? 'text-green-500' : 'text-zinc-500 hover:text-white'
            )}
          >
            {set.completedAt ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {(set.repGoal !== undefined || hasE1rmGoal) && (
        <div className="flex gap-3 px-2 text-xs text-zinc-500">
          {set.repGoal !== undefined && (
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
      )}
    </div>
  );
};

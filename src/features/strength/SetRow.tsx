'use client';

import type { SetData } from '@/actions/training/strength';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Crown, Target } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export type SetType = 'normal' | 'failure' | 'dropset' | 'warmup' | 'myoreps';

type ProgressionGoalFields = {
  repGoal?: number;
  e1rmGoalReps?: number;
  e1rmTarget?: number;
};

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
  set: SetData & ProgressionGoalFields;
  onChange?: (updates: Partial<SetData>) => void;
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

  const [reps, setReps] = useState(set.reps || 0);
  const [weight, setWeight] = useState(set.weight || 0);
  const [rpe, setRpe] = useState(set.rpe || 8);
  const [setType, setSetType] = useState<SetType>((set.setType as SetType) || 'normal');
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  useEffect(() => {
    setReps(set.reps);
    setWeight(set.weight);
    if (set.setType) setSetType(set.setType as SetType);
  }, [set]);

  useEffect(() => {
    if (lastPerformance && !set.completedAt && weight === 0) {
      setWeight(lastPerformance.weight);
      setReps(lastPerformance.reps);
    }
  }, [lastPerformance, set.completedAt, weight]);

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
  const repGoalReached = set.repGoal !== undefined && reps >= set.repGoal;
  const e1rmGoalReached = set.e1rmGoalReps !== undefined && reps >= set.e1rmGoalReps;

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
            onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
            placeholder={lastPerformance ? `${lastPerformance.weight}kg` : 'kg'}
            className="w-full bg-transparent border-b border-white/10 text-center focus:border-magma focus:outline-none font-mono relative z-10"
          />
        </div>

        <div className="col-span-3">
          <input
            type="number"
            value={reps || ''}
            onChange={(e) => setReps(Number.parseFloat(e.target.value) || 0)}
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
            onChange={(e) => setRpe(Number.parseFloat(e.target.value) || 0)}
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

      {(set.repGoal !== undefined || set.e1rmGoalReps !== undefined) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-[11px] font-mono text-zinc-500">
          {set.repGoal !== undefined && (
            <span className={repGoalReached ? 'text-green-400' : undefined}>
              <Target className="mr-1 inline h-3 w-3" />
              Mål: {set.repGoal} reps{repGoalReached ? ' ✓' : ''}
            </span>
          )}
          {set.e1rmGoalReps !== undefined && (
            <span className={e1rmGoalReached ? 'text-yellow-400' : undefined}>
              <Crown className="mr-1 inline h-3 w-3" />
              Bonus: {set.e1rmGoalReps} reps
              {set.e1rmTarget !== undefined ? ` för ${Math.round(set.e1rmTarget)} e1RM` : ''}
              {e1rmGoalReached ? ' ✓' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

import { logTitanSet } from '@/actions/training/core';
import { checkPRAction } from '@/actions/training/max-reps';
import {
  type RepGoalExercise,
  getRepGoalProgress,
  isExerciseComplete,
} from '@/features/strength/utils/repGoal';
import type { Exercise } from '@/types';
import { fireConfetti, playSound } from '@/utils';
import { calculateDamage } from '@/utils/combatMechanics';
import { determineRarity } from '@/utils/loot';
import { calculateE1RM } from '@/utils/math';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

interface LoggingCallbacks {
  onDamage: (damage: number) => void;
  onJokerCheck: (rpe: number, weight: number) => void;
  onExerciseComplete: () => void;
  onWorkoutComplete: () => void;
  onRepPR?: (newReps: number, oldMax: number | null) => void;
}

export const useSetLogging = (
  exercises: Exercise[],
  setExercises: Dispatch<SetStateAction<Exercise[]>>,
  activeExIndex: number,
  callbacks: LoggingCallbacks
) => {
  const handleSetLog = async (
    weight: number,
    reps: number,
    rpe: number,
    overrideIndex?: number
  ) => {
    const combatStats = calculateDamage(weight, reps, rpe, false);
    callbacks.onDamage(combatStats.damage);
    callbacks.onJokerCheck(rpe, weight);

    const currentWeight = weight;
    const currentReps = reps;
    const targetIndex = overrideIndex ?? activeExIndex;
    const currentExId = exercises[targetIndex]?.id;

    if (currentExId) {
      checkPRAction(currentExId, currentReps, currentWeight).then((res) => {
        if (res.success && res.isPR) {
          callbacks.onRepPR?.(currentReps, res.previousMax ?? null);
          playSound('loot_epic');
        }
      });
    }

    setExercises((currentExercises) => {
      const newExercises = currentExercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s })),
      }));

      const currentEx = newExercises[targetIndex] as RepGoalExercise;
      const setIndex = currentEx.sets.findIndex((s) => !s.completed);
      if (setIndex === -1) return currentExercises;

      const targetSet = currentEx.sets[setIndex];
      const sessionPr = currentEx.sets
        .filter((s) => s.completed && s.e1rm)
        .reduce((max, s) => Math.max(max, s.e1rm || 0), 0);
      const currentE1RM = calculateE1RM(weight, reps, rpe);
      const isPr = currentE1RM > sessionPr;
      const rarity = determineRarity(currentE1RM, sessionPr, isPr);

      targetSet.completed = true;
      targetSet.completedAt = new Date().toISOString();
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

      const repGoal = getRepGoalProgress(currentEx);
      const maxSets =
        currentEx.prescription?.type === 'TOTAL_REPS'
          ? (currentEx.prescription.maxSets ?? currentEx.sets.length)
          : currentEx.sets.length;

      if (repGoal && !repGoal.isComplete && currentEx.sets.length < maxSets) {
        currentEx.sets.push({
          id: `${currentEx.id}-rep-goal-${currentEx.sets.length + 1}-${Date.now()}`,
          reps: Math.max(
            currentEx.prescription?.type === 'TOTAL_REPS'
              ? (currentEx.prescription.minRepsPerSet ?? 1)
              : 1,
            repGoal.remainingReps
          ),
          weight,
          completed: false,
        });
      }

      const exerciseComplete = isExerciseComplete(currentEx);
      const isLastExercise = targetIndex === newExercises.length - 1;

      if (exerciseComplete) {
        if (isLastExercise) {
          setTimeout(() => callbacks.onWorkoutComplete(), 1000);
        } else {
          setTimeout(() => callbacks.onExerciseComplete(), 1200);
        }
      }

      logTitanSet(currentEx.id, reps, weight, rpe)
        .then((res) => {
          if (res.success && res.xpGained) {
            toast.success(`+${res.xpGained} XP | +${res.energyGained} Energy`, {
              description:
                res.newLevel && res.newLevel > res.newLevel - 1
                  ? `LEVEL UP! You represent Rank ${res.newLevel}`
                  : undefined,
            });
          }
        })
        .catch((err) => console.error('Titan Log Failed', err));

      return newExercises;
    });
  };

  return { handleSetLog };
};

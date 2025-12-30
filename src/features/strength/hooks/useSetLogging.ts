import { Dispatch, SetStateAction } from "react";
import { Exercise } from "@/types";
import { calculateE1RM } from "@/utils/math";
import { determineRarity } from "@/utils/loot";
import { playSound, fireConfetti } from "@/utils";
import { calculateDamage } from "@/utils/combatMechanics";
import { logTitanSet } from "@/actions/training";
import { toast } from "sonner";

interface LoggingCallbacks {
  onDamage: (damage: number) => void;
  onJokerCheck: (rpe: number, weight: number) => void;
  onExerciseComplete: () => void;
  onWorkoutComplete: () => void;
}

export const useSetLogging = (
  exercises: Exercise[],
  setExercises: Dispatch<SetStateAction<Exercise[]>>,
  activeExIndex: number,
  callbacks: LoggingCallbacks,
) => {
  const handleSetLog = (weight: number, reps: number, rpe: number) => {
    // 1. Calculate Damage
    const combatStats = calculateDamage(weight, reps, rpe, false);
    callbacks.onDamage(combatStats.damage);

    // 2. Propose Joker Set
    callbacks.onJokerCheck(rpe, weight);

    // 3. Update State
    setExercises((currentExercises) => {
      const newExercises = currentExercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s })),
      }));
      const currentEx = newExercises[activeExIndex];
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
      targetSet.weight = weight;
      targetSet.completedReps = reps;
      targetSet.rarity = rarity;
      targetSet.e1rm = currentE1RM;
      targetSet.isPr = isPr;

      if (isPr || rarity === "legendary") {
        playSound("loot_epic");
        fireConfetti();
      } else {
        playSound("ding");
      }

      const allSetsInExerciseComplete = currentEx.sets.every(
        (s) => s.completed,
      );
      const isLastExercise = activeExIndex === newExercises.length - 1;

      if (allSetsInExerciseComplete) {
        if (isLastExercise) {
          setTimeout(() => callbacks.onWorkoutComplete(), 1000);
        } else {
          setTimeout(() => callbacks.onExerciseComplete(), 1200);
        }
      }

      // --- TITAN INTELLIGENCE: LOG SET ---
      // Fire and forget server action to update XP
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
        .catch((err) => console.error("Titan Log Failed", err));

      return newExercises;
    });
  };

  return { handleSetLog };
};

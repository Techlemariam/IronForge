import { useState, Dispatch, SetStateAction } from "react";
import { Exercise, Set as WorkoutSet } from "@/types";
import { detectJokerOpportunity } from "@/utils/combatMechanics";
import { playSound } from "@/utils";

interface JokerPrompt {
  show: boolean;
  weight: number;
}

export const useJokerSets = (
  exercises: Exercise[],
  setExercises: Dispatch<SetStateAction<Exercise[]>>,
  activeExIndex: number,
) => {
  const [jokerPrompt, setJokerPrompt] = useState<JokerPrompt>({
    show: false,
    weight: 0,
  });

  const checkJokerOpportunity = (rpe: number, weight: number) => {
    const currentEx = exercises[activeExIndex];
    const setIndex = currentEx.sets.findIndex((s) => !s.completed);
    const totalSets = currentEx.sets.length;

    if (detectJokerOpportunity(rpe, setIndex, totalSets)) {
      const jokerWeight = Math.round((weight * 1.1) / 2.5) * 2.5;
      setJokerPrompt({ show: true, weight: jokerWeight });
      playSound("mystery_alert");
      return true;
    }
    return false;
  };

  const handleJokerAccept = () => {
    setExercises((currentExercises) => {
      const newExercises = currentExercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s })),
      }));
      const currentEx = newExercises[activeExIndex];

      const jokerSet: WorkoutSet = {
        id: `joker-${Date.now()}`,
        completed: false,
        reps: 1,
        weight: jokerPrompt.weight,
        type: "JOKER",
        rpe: 9,
        rarity: "epic",
        completedReps: 0,
      };

      const lastCompletedIndex = currentEx.sets.findIndex((s) => !s.completed);
      currentEx.sets.splice(
        lastCompletedIndex === -1 ? currentEx.sets.length : lastCompletedIndex,
        0,
        jokerSet,
      );

      return newExercises;
    });
    setJokerPrompt({ show: false, weight: 0 });
    playSound("quest_accept");
  };

  const handleJokerDecline = () => {
    setJokerPrompt({ show: false, weight: 0 });
  };

  return {
    jokerPrompt,
    checkJokerOpportunity,
    handleJokerAccept,
    handleJokerDecline,
  };
};

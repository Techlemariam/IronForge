"use client";

import React, { useState } from "react";
import { SetRow } from "./SetRow";
import { logSetAction, SetData } from "@/actions/training/strength";
import { Plus, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMaxReps } from "@/hooks/useMaxReps";
import { PRBadge } from "@/components/ui/PRBadge";
import { PRCelebration } from "@/components/ui/PRCelebration";

interface ExerciseLogProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  initialSets?: SetData[];
  currentWeight?: number;
}

export const StrengthLog: React.FC<ExerciseLogProps> = ({
  userId,
  exerciseId,
  exerciseName,
  initialSets = [],
  currentWeight,
}) => {
  const [sets, setSets] = useState<SetData[]>(initialSets);
  const { toast } = useToast();

  // Max Reps PR tracking
  const { maxReps, isLoading, checkPR } = useMaxReps(exerciseId, currentWeight);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newPRReps, setNewPRReps] = useState(0);
  const [previousMax, setPreviousMax] = useState<number | null>(null);

  const addSet = () => {
    // Copy previous set values for convenience
    const previousSet = sets[sets.length - 1] || {
      reps: 10,
      weight: 20,
      rpe: 8,
    };
    const newSet: SetData = {
      id: crypto.randomUUID(),
      reps: previousSet.reps,
      weight: previousSet.weight,
      rpe: previousSet.rpe,
      isWarmup: false,
    };
    setSets([...sets, newSet]);
  };

  const handleSetChange = (index: number, updates: Partial<SetData>) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], ...updates };
    setSets(newSets);
  };

  const handleSetComplete = async (index: number) => {
    const set = sets[index];
    // Optimistic update
    handleSetChange(index, { completedAt: new Date().toISOString() });

    // Check for rep PR
    if (set.reps && set.setType === "failure") {
      const isPR = await checkPR(set.reps);
      if (isPR) {
        setPreviousMax(maxReps);
        setNewPRReps(set.reps);
        setShowCelebration(true);
      }
    }

    // Server Action
    const result = await logSetAction(userId, exerciseId, set);
    if (!result.success) {
      toast({
        title: "Error",
        description: "Failed to log set",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-magma" />
          <h3 className="font-bold text-lg text-white">{exerciseName}</h3>
        </div>
        <button className="text-xs text-zinc-500 hover:text-white">
          History
        </button>
      </div>

      {/* PR Badge */}
      <PRBadge
        maxReps={maxReps}
        weight={currentWeight}
        isLoading={isLoading}
        className="mb-4"
      />

      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 uppercase font-bold px-2 mb-2">
          <div className="col-span-1 text-center">Set</div>
          <div className="col-span-3 text-center">kg</div>
          <div className="col-span-3 text-center">Reps</div>
          <div className="col-span-3 text-center">RPE</div>
          <div className="col-span-2"></div>
        </div>

        {sets.map((set, index) => (
          <SetRow
            key={set.id || index}
            index={index}
            set={set}
            onChange={(updates) => handleSetChange(index, updates)}
            onDelete={() => {
              /* impl delete */
            }}
            onComplete={() => handleSetComplete(index)}
          />
        ))}
      </div>

      <button
        onClick={addSet}
        className="w-full mt-4 py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors text-zinc-300"
      >
        <Plus className="w-4 h-4" />
        Add Set
      </button>

      {/* PR Celebration Modal */}
      <PRCelebration
        isVisible={showCelebration}
        newReps={newPRReps}
        previousReps={previousMax}
        exerciseName={exerciseName}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
};

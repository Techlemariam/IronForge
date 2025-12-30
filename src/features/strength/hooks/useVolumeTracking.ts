import { useState, useEffect, useMemo } from "react";
import type { Exercise } from "@/types";

export interface VolumeFeedback {
  muscleGroup: string;
  currentSets: number;
  mrv: number; // Maximum Recoverable Volume
  percentage: number;
  status: "LOW" | "OPTIMAL" | "OVER";
}

// Muscle group MRV guidelines (sets per week)
const MRV_GUIDELINES: Record<string, number> = {
  Chest: 22,
  Back: 25,
  Legs: 20,
  Shoulders: 20,
  Biceps: 26,
  Triceps: 26,
  Abs: 25,
  Quads: 20,
  Hamstrings: 18,
  Glutes: 22,
};

// Simple muscle group mapper (could be enhanced with exercise database)
function detectMuscleGroup(exerciseName: string): string {
  const name = exerciseName.toLowerCase();

  if (
    name.includes("bench") ||
    (name.includes("press") && name.includes("chest"))
  )
    return "Chest";
  if (name.includes("squat") || name.includes("leg press")) return "Legs";
  if (name.includes("deadlift") || name.includes("row")) return "Back";
  if (name.includes("shoulder") || name.includes("overhead"))
    return "Shoulders";
  if (name.includes("curl")) return "Biceps";
  if (name.includes("extension") || name.includes("dip")) return "Triceps";
  if (name.includes("lunge")) return "Legs";

  return "Unknown";
}

/**
 * Enhanced Volume Tracking Hook
 * Tracks sets per muscle group for current workout session
 * Provides real-time feedback based on MRV landmarks
 */
export function useVolumeTracking(exercises: Exercise[]) {
  const volumeData = useMemo(() => {
    const muscleVolumes: Record<string, number> = {};

    exercises.forEach((exercise) => {
      const muscleGroup = detectMuscleGroup(exercise.name);
      const completedSets = exercise.sets.filter((s) => s.completed).length;

      if (muscleGroup !== "Unknown") {
        muscleVolumes[muscleGroup] =
          (muscleVolumes[muscleGroup] || 0) + completedSets;
      }
    });

    return muscleVolumes;
  }, [exercises]);

  const getVolumeFeedback = (exerciseName: string): VolumeFeedback | null => {
    const muscleGroup = detectMuscleGroup(exerciseName);
    if (muscleGroup === "Unknown") return null;

    const currentSets = volumeData[muscleGroup] || 0;
    const mrv = MRV_GUIDELINES[muscleGroup] || 20;
    const percentage = Math.round((currentSets / mrv) * 100);

    let status: "LOW" | "OPTIMAL" | "OVER" = "LOW";
    if (percentage >= 80) status = "OPTIMAL";
    if (percentage >= 100) status = "OVER";

    return {
      muscleGroup,
      currentSets,
      mrv,
      percentage,
      status,
    };
  };

  return {
    volumeData,
    getVolumeFeedback,
  };
}

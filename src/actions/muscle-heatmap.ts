"use server";

import { prisma } from "@/lib/prisma";

type IntensityLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

interface MuscleHeatData {
  muscleGroup: string;
  setsThisWeek: number;
  volumeThisWeek: number;
  lastTrained: Date | null;
  intensity: IntensityLevel;
  trend: "INCREASING" | "STABLE" | "DECREASING";
  recommendedAction: string;
}

interface FullBodyHeatMap {
  muscles: MuscleHeatData[];
  overallBalance: number; // 0-100
  mostTrained: string;
  leastTrained: string;
  recommendations: string[];
}

// Muscle groups with their ideal weekly set ranges
const MUSCLE_SET_RANGES: Record<
  string,
  { min: number; optimal: number; max: number }
> = {
  chest: { min: 10, optimal: 16, max: 22 },
  back: { min: 12, optimal: 18, max: 24 },
  shoulders: { min: 8, optimal: 14, max: 18 },
  biceps: { min: 8, optimal: 12, max: 16 },
  triceps: { min: 8, optimal: 12, max: 16 },
  quadriceps: { min: 10, optimal: 16, max: 22 },
  hamstrings: { min: 8, optimal: 12, max: 16 },
  glutes: { min: 8, optimal: 14, max: 18 },
  calves: { min: 8, optimal: 12, max: 16 },
  abs: { min: 6, optimal: 12, max: 18 },
};

/**
 * Get muscle heat map data.
 */
export async function getMuscleHeatMapAction(
  userId: string,
): Promise<FullBodyHeatMap> {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await prisma.exerciseLog.findMany({
      where: {
        userId,
        date: { gte: weekAgo.toISOString() },
      },
    });

    // In a real app, map exercises to muscle groups
    // For MVP, use simulated data
    const muscles: MuscleHeatData[] = Object.entries(MUSCLE_SET_RANGES).map(
      ([muscle, range]) => {
        // Simulate sets based on exercise patterns
        const setsThisWeek = Math.floor(Math.random() * 20);
        const volumeThisWeek =
          setsThisWeek * 500 + Math.floor(Math.random() * 1000);

        let intensity: IntensityLevel = "NONE";
        if (setsThisWeek >= range.max) intensity = "VERY_HIGH";
        else if (setsThisWeek >= range.optimal) intensity = "HIGH";
        else if (setsThisWeek >= range.min) intensity = "MEDIUM";
        else if (setsThisWeek > 0) intensity = "LOW";

        let recommendedAction = "";
        if (intensity === "NONE") recommendedAction = `Add ${muscle} exercises`;
        else if (intensity === "LOW")
          recommendedAction = `Increase ${muscle} volume`;
        else if (intensity === "VERY_HIGH")
          recommendedAction = `Consider reducing ${muscle} volume`;
        else recommendedAction = `Maintain current ${muscle} volume`;

        return {
          muscleGroup: muscle,
          setsThisWeek,
          volumeThisWeek,
          lastTrained:
            setsThisWeek > 0
              ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
              : null,
          intensity,
          trend:
            Math.random() > 0.5
              ? "STABLE"
              : Math.random() > 0.5
                ? "INCREASING"
                : "DECREASING",
          recommendedAction,
        };
      },
    );

    // Calculate balance
    const intensityScores = muscles.map((m) => {
      const range = MUSCLE_SET_RANGES[m.muscleGroup];
      if (!range) return 50;
      if (m.setsThisWeek >= range.min && m.setsThisWeek <= range.max)
        return 100;
      return Math.max(0, 100 - Math.abs(m.setsThisWeek - range.optimal) * 5);
    });
    const overallBalance = Math.round(
      intensityScores.reduce((a, b) => a + b, 0) / intensityScores.length,
    );

    const sortedByVolume = [...muscles].sort(
      (a, b) => b.setsThisWeek - a.setsThisWeek,
    );
    const mostTrained = sortedByVolume[0]?.muscleGroup || "None";
    const leastTrained =
      sortedByVolume[sortedByVolume.length - 1]?.muscleGroup || "None";

    const recommendations: string[] = [];
    if (overallBalance < 60)
      recommendations.push(
        "Training is imbalanced - consider a more structured program",
      );
    const neglected = muscles.filter(
      (m) => m.intensity === "NONE" || m.intensity === "LOW",
    );
    if (neglected.length > 0) {
      recommendations.push(
        `Focus more on: ${neglected.map((m) => m.muscleGroup).join(", ")}`,
      );
    }
    const overtrained = muscles.filter((m) => m.intensity === "VERY_HIGH");
    if (overtrained.length > 0) {
      recommendations.push(
        `Consider reducing: ${overtrained.map((m) => m.muscleGroup).join(", ")}`,
      );
    }

    return {
      muscles,
      overallBalance,
      mostTrained,
      leastTrained,
      recommendations:
        recommendations.length > 0
          ? recommendations
          : ["Training is well balanced!"],
    };
  } catch (error) {
    console.error("Error getting muscle heat map:", error);
    return {
      muscles: [],
      overallBalance: 0,
      mostTrained: "Unknown",
      leastTrained: "Unknown",
      recommendations: ["Unable to analyze training data"],
    };
  }
}

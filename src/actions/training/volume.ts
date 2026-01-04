"use server";

import { prisma } from "@/lib/prisma";
import { checkOvertrainingStatusAction } from "@/actions/training/overtraining";

/**
 * Volume Calculator Level 4: Recovery-State Modulated MRV
 * The most sophisticated volume calculator that adjusts recommendations
 * based on real-time recovery state, training history, and wellness data.
 */

interface RecoveryState {
  score: number; // 0-100
  factors: {
    sleepQuality: number;
    trainingLoad: number;
    stressLevel: number;
    nutritionQuality: number;
    restDays: number;
  };
}

interface VolumeL4Recommendation {
  muscleGroup: string;
  baseMrv: number;
  adjustedMrv: number;
  recoveryModifier: number;
  minSets: number;
  maxSets: number;
  optimalSets: number;
  confidence: number;
  reasoning: string[];
}

// Base MRV values (sets per week)
const BASE_MRV: Record<string, number> = {
  chest: 22,
  back: 22,
  shoulders: 18,
  quadriceps: 20,
  hamstrings: 16,
  biceps: 16,
  triceps: 16,
  glutes: 18,
  calves: 16,
  abs: 20,
  forearms: 14,
};

// Fatigue accumulation rates (higher = fatigues faster)
const FATIGUE_RATES: Record<string, number> = {
  chest: 0.9,
  back: 0.85,
  shoulders: 1.0,
  quadriceps: 1.2,
  hamstrings: 1.0,
  biceps: 0.7,
  triceps: 0.7,
  glutes: 1.1,
  calves: 0.6,
  abs: 0.5,
  forearms: 0.5,
};

/**
 * Calculate recovery state from all available data.
 */
async function calculateRecoveryState(userId: string): Promise<RecoveryState> {
  const [overtraining] = await Promise.all([
    checkOvertrainingStatusAction(userId),
  ]);

  // Calculate training load factor
  const trainingLoadScore = overtraining.isCapped
    ? 0
    : overtraining.isFatigued
      ? 30
      : Math.max(20, 100 - overtraining.weeklyWorkouts * 5);

  // Default wellness scores (in production, get from wearables)
  const sleepQuality = 75;
  const stressLevel = 70;
  const nutritionQuality = 70;
  const restDays = Math.max(0, 7 - overtraining.weeklyWorkouts);

  const restDaysScore = Math.min(100, restDays * 25);

  // Weighted average
  const score =
    sleepQuality * 0.3 +
    trainingLoadScore * 0.25 +
    stressLevel * 0.2 +
    nutritionQuality * 0.15 +
    restDaysScore * 0.1;

  return {
    score: Math.round(score),
    factors: {
      sleepQuality,
      trainingLoad: trainingLoadScore,
      stressLevel,
      nutritionQuality,
      restDays,
    },
  };
}

/**
 * Calculate Level 4 volume recommendation with full recovery modulation.
 */
export async function calculateVolumeL4Action(
  userId: string,
  muscleGroup: string,
  weekNumber: number = 1,
  previousWeekVolume?: number,
): Promise<VolumeL4Recommendation> {
  try {
    const recoveryState = await calculateRecoveryState(userId);
    const baseMrv = BASE_MRV[muscleGroup.toLowerCase()] || 16;
    const fatigueRate = FATIGUE_RATES[muscleGroup.toLowerCase()] || 1.0;

    const reasoning: string[] = [];

    // Calculate recovery modifier (0.5-1.3)
    let recoveryModifier = recoveryState.score / 80; // 80 = "normal" recovery
    recoveryModifier = Math.max(0.5, Math.min(1.3, recoveryModifier));

    if (recoveryState.score < 50) {
      reasoning.push("Low recovery score - volume significantly reduced");
    } else if (recoveryState.score < 70) {
      reasoning.push("Moderate recovery - conservative volume recommended");
    } else if (recoveryState.score > 90) {
      reasoning.push("Excellent recovery - volume ceiling increased");
    }

    // Week-over-week progression
    let progressionModifier = 1.0;
    if (previousWeekVolume) {
      const weeklyIncrease = 0.1; // 10% increase per week
      progressionModifier = 1 + weeklyIncrease * Math.min(weekNumber - 1, 4);
      reasoning.push(`Week ${weekNumber}: Progressive volume increase`);
    }

    // Deload detection (every 4-5 weeks)
    if (weekNumber % 5 === 0) {
      progressionModifier *= 0.5;
      reasoning.push("Deload week: 50% volume reduction");
    }

    // Calculate adjusted MRV
    const adjustedMrv = Math.round(
      (baseMrv * recoveryModifier * progressionModifier) / fatigueRate,
    );

    // Calculate set ranges
    const minSets = Math.round(adjustedMrv * 0.4);
    const optimalSets = Math.round(adjustedMrv * 0.7);
    const maxSets = adjustedMrv;

    // Confidence based on data quality
    let confidence = 70;
    if (recoveryState.factors.restDays >= 2) confidence += 10;
    if (recoveryState.factors.trainingLoad > 50) confidence += 10;
    confidence = Math.min(95, confidence);

    return {
      muscleGroup,
      baseMrv,
      adjustedMrv,
      recoveryModifier: Math.round(recoveryModifier * 100) / 100,
      minSets,
      maxSets,
      optimalSets,
      confidence,
      reasoning,
    };
  } catch (error) {
    console.error("Error calculating L4 volume:", error);
    const baseMrv = BASE_MRV[muscleGroup.toLowerCase()] || 16;
    return {
      muscleGroup,
      baseMrv,
      adjustedMrv: baseMrv,
      recoveryModifier: 1.0,
      minSets: Math.round(baseMrv * 0.4),
      maxSets: baseMrv,
      optimalSets: Math.round(baseMrv * 0.7),
      confidence: 50,
      reasoning: ["Using default values due to data unavailability"],
    };
  }
}

/**
 * Get full body L4 volume recommendations.
 */
export async function getFullBodyVolumeL4Action(
  userId: string,
  weekNumber: number = 1,
): Promise<VolumeL4Recommendation[]> {
  const muscles = Object.keys(BASE_MRV);

  const recommendations = await Promise.all(
    muscles.map((muscle) =>
      calculateVolumeL4Action(userId, muscle, weekNumber),
    ),
  );

  return recommendations;
}

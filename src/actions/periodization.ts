"use server";

import { prisma } from "@/lib/prisma";
import {
  calculateVolumeL3,
  wellnessToRecoveryFactor,
} from "@/utils/volumeCalculatorEnhanced";

type TrainingPhase =
  | "ACCUMULATION"
  | "INTENSIFICATION"
  | "REALIZATION"
  | "DELOAD";
type ProgramGoal = "HYPERTROPHY" | "STRENGTH" | "PEAKING" | "MAINTENANCE";

interface PeriodizationPlan {
  currentPhase: TrainingPhase;
  weekInPhase: number;
  totalWeeks: number;
  phaseSchedule: PhaseBlock[];
  recommendations: WeeklyRecommendation;
}

interface PhaseBlock {
  phase: TrainingPhase;
  weeks: number;
  intensityRange: { min: number; max: number }; // % of 1RM
  volumeMultiplier: number;
  rpeTarget: number;
}

interface WeeklyRecommendation {
  targetVolume: Record<string, number>;
  targetIntensity: number;
  targetRpe: number;
  deloadDue: boolean;
  notes: string[];
}

// Standard periodization templates
const PHASE_TEMPLATES: Record<ProgramGoal, PhaseBlock[]> = {
  HYPERTROPHY: [
    {
      phase: "ACCUMULATION",
      weeks: 4,
      intensityRange: { min: 65, max: 75 },
      volumeMultiplier: 1.2,
      rpeTarget: 7,
    },
    {
      phase: "INTENSIFICATION",
      weeks: 3,
      intensityRange: { min: 70, max: 80 },
      volumeMultiplier: 1.0,
      rpeTarget: 8,
    },
    {
      phase: "DELOAD",
      weeks: 1,
      intensityRange: { min: 50, max: 60 },
      volumeMultiplier: 0.5,
      rpeTarget: 5,
    },
  ],
  STRENGTH: [
    {
      phase: "ACCUMULATION",
      weeks: 3,
      intensityRange: { min: 70, max: 80 },
      volumeMultiplier: 1.0,
      rpeTarget: 7,
    },
    {
      phase: "INTENSIFICATION",
      weeks: 3,
      intensityRange: { min: 80, max: 88 },
      volumeMultiplier: 0.85,
      rpeTarget: 8,
    },
    {
      phase: "REALIZATION",
      weeks: 2,
      intensityRange: { min: 85, max: 95 },
      volumeMultiplier: 0.6,
      rpeTarget: 9,
    },
    {
      phase: "DELOAD",
      weeks: 1,
      intensityRange: { min: 50, max: 60 },
      volumeMultiplier: 0.4,
      rpeTarget: 5,
    },
  ],
  PEAKING: [
    {
      phase: "INTENSIFICATION",
      weeks: 2,
      intensityRange: { min: 85, max: 92 },
      volumeMultiplier: 0.7,
      rpeTarget: 8.5,
    },
    {
      phase: "REALIZATION",
      weeks: 2,
      intensityRange: { min: 90, max: 100 },
      volumeMultiplier: 0.4,
      rpeTarget: 9.5,
    },
    {
      phase: "DELOAD",
      weeks: 1,
      intensityRange: { min: 40, max: 50 },
      volumeMultiplier: 0.3,
      rpeTarget: 4,
    },
  ],
  MAINTENANCE: [
    {
      phase: "ACCUMULATION",
      weeks: 3,
      intensityRange: { min: 65, max: 75 },
      volumeMultiplier: 0.8,
      rpeTarget: 6,
    },
    {
      phase: "DELOAD",
      weeks: 1,
      intensityRange: { min: 50, max: 60 },
      volumeMultiplier: 0.5,
      rpeTarget: 5,
    },
  ],
};

/**
 * Generate periodization plan based on user data and goals.
 */
export async function generatePeriodizationPlanAction(
  userId: string,
  goal: ProgramGoal,
  startWeek: number = 1,
): Promise<PeriodizationPlan> {
  try {
    const template = PHASE_TEMPLATES[goal];
    const totalWeeks = template.reduce((sum, block) => sum + block.weeks, 0);

    // Find current phase based on week
    let weekCounter = 0;
    let currentPhase = template[0];
    let weekInPhase = 1;

    for (const block of template) {
      if (startWeek <= weekCounter + block.weeks) {
        currentPhase = block;
        weekInPhase = startWeek - weekCounter;
        break;
      }
      weekCounter += block.weeks;
    }

    // Get user's training history for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { titan: true },
    });

    const experience =
      (user?.titan?.level || 1) < 10
        ? "beginner"
        : (user?.titan?.level || 1) < 30
          ? "intermediate"
          : (user?.titan?.level || 1) < 60
            ? "advanced"
            : "elite";

    // Calculate volume recommendations per muscle
    const muscles = [
      "chest",
      "back",
      "shoulders",
      "quadriceps",
      "hamstrings",
      "biceps",
      "triceps",
    ];
    const targetVolume: Record<string, number> = {};

    for (const muscle of muscles) {
      const rec = calculateVolumeL3(muscle, experience as any, 1.0, 1.0);
      targetVolume[muscle] = Math.round(
        rec.optimal * currentPhase.volumeMultiplier,
      );
    }

    const recommendations: WeeklyRecommendation = {
      targetVolume,
      targetIntensity:
        (currentPhase.intensityRange.min + currentPhase.intensityRange.max) / 2,
      targetRpe: currentPhase.rpeTarget,
      deloadDue: currentPhase.phase === "DELOAD",
      notes: generatePhaseNotes(
        currentPhase.phase,
        weekInPhase,
        currentPhase.weeks,
      ),
    };

    return {
      currentPhase: currentPhase.phase,
      weekInPhase,
      totalWeeks,
      phaseSchedule: template,
      recommendations,
    };
  } catch (error) {
    console.error("Error generating periodization plan:", error);
    throw error;
  }
}

function generatePhaseNotes(
  phase: TrainingPhase,
  week: number,
  totalWeeks: number,
): string[] {
  const notes: string[] = [];

  switch (phase) {
    case "ACCUMULATION":
      notes.push("Focus on volume accumulation and technique work.");
      notes.push("Keep RPE moderate to build work capacity.");
      if (week === totalWeeks)
        notes.push("Next phase: Intensification - intensity increases.");
      break;
    case "INTENSIFICATION":
      notes.push("Reduce volume, increase weight.");
      notes.push("Focus on progressive overload with heavier loads.");
      break;
    case "REALIZATION":
      notes.push("Peak performance phase - minimal volume, max intensity.");
      notes.push("Test new PRs if ready.");
      break;
    case "DELOAD":
      notes.push("Active recovery week. Reduce all training stress.");
      notes.push("Focus on mobility, light technique work, and rest.");
      break;
  }

  return notes;
}

/**
 * Adapt plan based on real-time wellness data.
 */
export async function adaptPlanToWellnessAction(
  userId: string,
  plan: PeriodizationPlan,
  sleepScore?: number,
  stressLevel?: number,
): Promise<PeriodizationPlan> {
  const recoveryFactor = wellnessToRecoveryFactor(sleepScore, stressLevel);

  // Adjust recommendations based on recovery
  const adapted = { ...plan };
  adapted.recommendations = {
    ...plan.recommendations,
    targetVolume: Object.fromEntries(
      Object.entries(plan.recommendations.targetVolume).map(([muscle, vol]) => [
        muscle,
        Math.round(vol * recoveryFactor),
      ]),
    ),
    notes: [...plan.recommendations.notes],
  };

  if (recoveryFactor < 0.8) {
    adapted.recommendations.notes.unshift(
      "⚠️ Low wellness detected. Volume reduced automatically.",
    );
    adapted.recommendations.targetRpe = Math.max(
      5,
      adapted.recommendations.targetRpe - 1,
    );
  } else if (recoveryFactor > 1.1) {
    adapted.recommendations.notes.unshift(
      "💪 Great recovery! Consider pushing slightly harder.",
    );
  }

  return adapted;
}

/**
 * Get recommended goal based on training history.
 */
export async function getRecommendedGoalAction(
  userId: string,
): Promise<ProgramGoal> {
  // Simplified logic - in production would analyze training patterns
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { titan: true },
  });

  const level = user?.titan?.level || 1;

  if (level < 15) return "HYPERTROPHY"; // Build base
  if (level < 40) return "STRENGTH"; // Develop strength
  return "HYPERTROPHY"; // Default to hypertrophy for advanced
}

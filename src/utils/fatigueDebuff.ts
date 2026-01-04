import { checkOvertrainingStatusAction } from "@/actions/training/overtraining";

export interface FatigueDebuff {
  isActive: boolean;
  severity: "NONE" | "MILD" | "MODERATE" | "SEVERE";
  damageReduction: number; // 0-1, percentage reduction
  accuracyPenalty: number; // 0-1
  critChanceReduction: number; // 0-1
  description: string;
}

const DEBUFF_CONFIGS: Record<string, Omit<FatigueDebuff, "isActive">> = {
  NONE: {
    severity: "NONE",
    damageReduction: 0,
    accuracyPenalty: 0,
    critChanceReduction: 0,
    description: "Your Titan is fully rested and battle-ready.",
  },
  MILD: {
    severity: "MILD",
    damageReduction: 0.1,
    accuracyPenalty: 0.05,
    critChanceReduction: 0.1,
    description: "Slight fatigue. Minor combat penalties applied.",
  },
  MODERATE: {
    severity: "MODERATE",
    damageReduction: 0.25,
    accuracyPenalty: 0.15,
    critChanceReduction: 0.25,
    description: "Your Titan is tired. Consider resting.",
  },
  SEVERE: {
    severity: "SEVERE",
    damageReduction: 0.5,
    accuracyPenalty: 0.3,
    critChanceReduction: 0.5,
    description: "Critical fatigue! Your Titan desperately needs rest.",
  },
};

/**
 * Calculates fatigue debuff based on overtraining status.
 * Used to apply combat penalties when player is overtrained.
 */
export async function calculateFatigueDebuff(
  userId: string,
): Promise<FatigueDebuff> {
  try {
    const status = await checkOvertrainingStatusAction(userId);

    let severity: "NONE" | "MILD" | "MODERATE" | "SEVERE" = "NONE";

    // Determine severity based on overtraining indicators
    if (status.isCapped || status.weeklyWorkouts >= 14) {
      severity = "SEVERE";
    } else if (status.isFatigued && status.weeklyWorkouts >= 10) {
      severity = "MODERATE";
    } else if (status.isFatigued || status.weeklyWorkouts >= 7) {
      severity = "MILD";
    }

    const config = DEBUFF_CONFIGS[severity];

    return {
      isActive: severity !== "NONE",
      ...config,
    };
  } catch (error) {
    console.error("Error calculating fatigue debuff:", error);
    return {
      isActive: false,
      ...DEBUFF_CONFIGS.NONE,
    };
  }
}

/**
 * Applies fatigue debuff to combat damage.
 */
export function applyFatigueToDamage(
  baseDamage: number,
  debuff: FatigueDebuff,
): number {
  if (!debuff.isActive) return baseDamage;
  return Math.round(baseDamage * (1 - debuff.damageReduction));
}

/**
 * Applies fatigue to hit chance.
 */
export function applyFatigueToAccuracy(
  baseAccuracy: number,
  debuff: FatigueDebuff,
): number {
  if (!debuff.isActive) return baseAccuracy;
  return Math.max(0.1, baseAccuracy * (1 - debuff.accuracyPenalty));
}

/**
 * Applies fatigue to crit chance.
 */
export function applyFatigueToCritChance(
  baseCrit: number,
  debuff: FatigueDebuff,
): number {
  if (!debuff.isActive) return baseCrit;
  return Math.max(0, baseCrit * (1 - debuff.critChanceReduction));
}

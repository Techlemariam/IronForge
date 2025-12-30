/**
 * @fileoverview useSkillEffects Hook
 * The "brain" of the Neural Lattice system.
 * Calculates aggregated effects from all unlocked skills.
 */
import { useMemo } from "react";
import {
  SkillNodeV2,
  CalculatedEffects,
  SkillEffect,
  SkillDrawback,
  EffectCondition,
  DrawbackCondition,
} from "../types/skills";
import {
  SKILL_TREE_V2,
  getNodeById,
  countUnlockedNotables,
} from "../data/skill-tree-v2";
import { IntervalsWellness } from "../types";

// ============================================================================
// Session Metadata (for conditional effect checking)
// ============================================================================

export interface SessionMetadata {
  /** Average reps per set in the session */
  avgReps?: number;
  /** Session duration in minutes */
  durationMins?: number;
  /** Whether the session includes strength training */
  hasStrengthComponent?: boolean;
  /** Whether the session includes cardio */
  hasCardioComponent?: boolean;
  /** Primary training zone (1-5) */
  primaryZone?: 1 | 2 | 3 | 4 | 5;
  /** Number of consecutive training days */
  consecutiveTrainingDays?: number;
  /** Whether any sets were failed/incomplete */
  hasFailedSets?: boolean;
  /** Is this a rest day? */
  isRestDay?: boolean;
}

// ============================================================================
// Default Calculated Effects
// ============================================================================

const DEFAULT_EFFECTS: CalculatedEffects = {
  tpMultiplier: 1.0,
  ksMultiplier: 1.0,
  titanLoadMultiplier: 1.0,
  recoveryRateMultiplier: 1.0,
  passiveTpPerDay: 0,
  passiveKsPerDay: 0,
  flatTpBonus: 0,
  flatKsBonus: 0,
  flatTitanLoad: 0,
  features: {
    brickWorkouts: false,
    vikingPress: false,
    pumpIndicator: false,
    autoDeload: false,
  },
  activeKeystoneId: null,
};

// ============================================================================
// Condition Checking Helpers
// ============================================================================

/**
 * Check if effect conditions are met for a node.
 */
function checkEffectConditions(
  conditions: EffectCondition | undefined,
  session: SessionMetadata,
  wellness: IntervalsWellness | null,
): boolean {
  if (!conditions) return true; // No conditions = always active

  // Rep range check
  if (
    conditions.minReps !== undefined &&
    (session.avgReps ?? 0) < conditions.minReps
  ) {
    return false;
  }
  if (
    conditions.maxReps !== undefined &&
    (session.avgReps ?? Infinity) > conditions.maxReps
  ) {
    return false;
  }

  // Session duration check
  if (conditions.minSessionDurationMins !== undefined) {
    if ((session.durationMins ?? 0) < conditions.minSessionDurationMins) {
      return false;
    }
  }

  // Hybrid session check
  if (conditions.requiresHybridSession) {
    if (!session.hasStrengthComponent || !session.hasCardioComponent) {
      return false;
    }
  }

  // Zone check
  if (conditions.requiredZone !== undefined) {
    if (session.primaryZone !== conditions.requiredZone) {
      return false;
    }
  }

  // Wellness checks
  if (conditions.minBodyBattery !== undefined) {
    if ((wellness?.bodyBattery ?? 0) < conditions.minBodyBattery) {
      return false;
    }
  }
  if (conditions.minSleepScore !== undefined) {
    if ((wellness?.sleepScore ?? 0) < conditions.minSleepScore) {
      return false;
    }
  }
  if (conditions.minVO2max !== undefined) {
    if ((wellness?.vo2max ?? 0) < conditions.minVO2max) {
      return false;
    }
  }

  return true;
}

/**
 * Check if drawback conditions are triggered for a node.
 */
function checkDrawbackConditions(
  conditions: DrawbackCondition | undefined,
  session: SessionMetadata,
  wellness: IntervalsWellness | null,
): boolean {
  if (!conditions) return false; // No conditions = drawback never applies

  // Low rep drawback (e.g., Hypertrophy Ascendant)
  if (conditions.maxReps !== undefined) {
    if ((session.avgReps ?? Infinity) <= conditions.maxReps) {
      return true;
    }
  }

  // Low sleep drawback (e.g., Sage's Rest)
  if (conditions.maxSleepScore !== undefined) {
    if ((wellness?.sleepScore ?? 100) < conditions.maxSleepScore) {
      return true;
    }
  }

  // Session too short (e.g., Void Runner)
  if (conditions.maxSessionDurationMins !== undefined) {
    if (
      (session.durationMins ?? Infinity) <= conditions.maxSessionDurationMins
    ) {
      return true;
    }
  }

  // Overtraining check
  if (conditions.consecutiveTrainingDays !== undefined) {
    if (
      (session.consecutiveTrainingDays ?? 0) >=
      conditions.consecutiveTrainingDays
    ) {
      return true;
    }
  }

  // Failed set check (Iron Discipline)
  if (conditions.onFailedSet && session.hasFailedSets) {
    return true;
  }

  return false;
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Pure function to calculate effects.
 * Separated from hook for easier testing.
 */
export function calculateSkillEffects(
  purchasedSkillIds: Set<string>,
  wellness: IntervalsWellness | null,
  session: SessionMetadata = {},
): CalculatedEffects {
  // Start with defaults
  const result: CalculatedEffects = { ...DEFAULT_EFFECTS };

  // Find active keystone (if any)
  const keystones = SKILL_TREE_V2.filter(
    (node) => node.tier === "keystone" && purchasedSkillIds.has(node.id),
  );
  if (keystones.length > 0) {
    // For now, take the first keystone (TODO: handle multiple/switching)
    result.activeKeystoneId = keystones[0].id;
  }

  // Iterate through all unlocked nodes
  purchasedSkillIds.forEach((nodeId) => {
    const node = getNodeById(nodeId);
    if (!node) return;

    // Check if effect conditions are met
    const effectsApply = checkEffectConditions(
      node.effectConditions,
      session,
      wellness,
    );

    // Apply effects if conditions are met
    if (effectsApply && node.effects) {
      const effects = node.effects;

      // Multiplicative effects (compound)
      if (effects.tpMultiplier !== undefined) {
        result.tpMultiplier *= effects.tpMultiplier;
      }
      if (effects.ksMultiplier !== undefined) {
        result.ksMultiplier *= effects.ksMultiplier;
      }
      if (effects.titanLoadMultiplier !== undefined) {
        result.titanLoadMultiplier *= effects.titanLoadMultiplier;
      }
      if (effects.recoveryRateMultiplier !== undefined) {
        result.recoveryRateMultiplier *= effects.recoveryRateMultiplier;
      }

      // Additive effects
      if (effects.passiveTpPerDay !== undefined) {
        result.passiveTpPerDay += effects.passiveTpPerDay;
      }
      if (effects.passiveKsPerDay !== undefined) {
        result.passiveKsPerDay += effects.passiveKsPerDay;
      }
      if (effects.flatTpBonus !== undefined) {
        result.flatTpBonus += effects.flatTpBonus;
      }
      if (effects.flatKsBonus !== undefined) {
        result.flatKsBonus += effects.flatKsBonus;
      }
      if (effects.flatTitanLoad !== undefined) {
        result.flatTitanLoad += effects.flatTitanLoad;
      }

      // Feature unlocks (OR logic)
      if (effects.unlocksBrickWorkouts) {
        result.features.brickWorkouts = true;
      }
      if (effects.unlocksVikingPress) {
        result.features.vikingPress = true;
      }
      if (effects.unlocksPumpIndicator) {
        result.features.pumpIndicator = true;
      }
      if (effects.unlocksAutoDeload) {
        result.features.autoDeload = true;
      }
    }

    // Check if drawback conditions are met (for keystones)
    const drawbacksApply = checkDrawbackConditions(
      node.drawbackConditions,
      session,
      wellness,
    );

    // Apply drawbacks if conditions are met
    if (drawbacksApply && node.drawbacks) {
      const drawbacks = node.drawbacks;

      // Drawback multipliers override (take the worst)
      if (drawbacks.tpMultiplier !== undefined) {
        result.tpMultiplier = Math.min(
          result.tpMultiplier,
          drawbacks.tpMultiplier,
        );
      }
      if (drawbacks.ksMultiplier !== undefined) {
        result.ksMultiplier = Math.min(
          result.ksMultiplier,
          drawbacks.ksMultiplier,
        );
      }
      if (drawbacks.titanLoadMultiplier !== undefined) {
        result.titanLoadMultiplier = Math.min(
          result.titanLoadMultiplier,
          drawbacks.titanLoadMultiplier,
        );
      }
      if (drawbacks.recoveryRateMultiplier !== undefined) {
        result.recoveryRateMultiplier = Math.min(
          result.recoveryRateMultiplier,
          drawbacks.recoveryRateMultiplier,
        );
      }
    }
  });

  return result;
}

/**
 * Calculate aggregated effects from all unlocked skills.
 *
 * @param purchasedSkillIds - Set of unlocked skill node IDs
 * @param wellness - Current wellness data from Intervals.icu
 * @param session - Current session metadata (optional, for conditional effects)
 * @returns Aggregated effects object
 */
export function useSkillEffects(
  purchasedSkillIds: Set<string>,
  wellness: IntervalsWellness | null,
  session: SessionMetadata = {},
): CalculatedEffects {
  return useMemo(() => {
    return calculateSkillEffects(purchasedSkillIds, wellness, session);
  }, [purchasedSkillIds, wellness, session]);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a player can purchase a Keystone.
 * Requires 10 notables to be unlocked first.
 */
export function canPurchaseKeystone(
  nodeId: string,
  purchasedSkillIds: Set<string>,
): { canPurchase: boolean; reason?: string } {
  const node = getNodeById(nodeId);
  if (!node) {
    return { canPurchase: false, reason: "Node not found" };
  }

  if (node.tier !== "keystone") {
    return { canPurchase: true }; // Not a keystone, normal rules apply
  }

  const gateRequirement = node.gateRequirement ?? 10;
  const unlockedNotables = countUnlockedNotables(purchasedSkillIds);

  if (unlockedNotables < gateRequirement) {
    return {
      canPurchase: false,
      reason: `Requires ${gateRequirement} Notables (you have ${unlockedNotables})`,
    };
  }

  return { canPurchase: true };
}

/**
 * Get the status of each path (% completion toward Keystone).
 */
export function getPathProgress(
  purchasedSkillIds: Set<string>,
): Record<string, number> {
  const paths = ["juggernaut", "engine", "warden", "titan", "sage"] as const;
  const progress: Record<string, number> = {};

  paths.forEach((path) => {
    const pathNodes = SKILL_TREE_V2.filter(
      (n) => n.path === path && n.tier !== "minor",
    );
    const unlockedCount = pathNodes.filter((n) =>
      purchasedSkillIds.has(n.id),
    ).length;
    progress[path] =
      pathNodes.length > 0 ? (unlockedCount / pathNodes.length) * 100 : 0;
  });

  return progress;
}

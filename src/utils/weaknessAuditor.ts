import {
  MuscleGroupVolume,
  AuditReport,
  MuscleAudit,
  WeaknessLevel,
  BalanceRatio,
  RPVolumeStandards,
} from "../types/auditor";
import { getStandardsForMuscle } from "./volumeCalculator";
import { muscleMap } from "../data/muscleMap";

/**
 * Weakness Auditor Engine
 * Analyzes aggregated muscle volume against RP standards to detect imbalances.
 */

// Thresholds for ratios
const RATIO_THRESHOLDS = {
  push_pull: { min: 0.8, max: 1.2 }, // Ideal 1:1, allow slight deviation
  quad_ham: { min: 1.0, max: 1.5 }, // Quads stronger/more volume usually, but not > 2x
};

/**
 * Audit Weaknesses based on pre-calculated weekly volumes
 * @param volumes - Aggregated weekly volume per muscle group
 * @returns Comprehensive AuditReport
 */
export const auditWeaknesses = (volumes: MuscleGroupVolume[]): AuditReport => {
  const muscleAudits: MuscleAudit[] = [];

  // 1. Analyze each muscle group
  volumes.forEach((vol) => {
    const standards = getStandardsForMuscle(vol.muscleGroup);
    if (!standards) return;

    const audit = analyzeMuscle(vol, standards);
    muscleAudits.push(audit);
  });

  // 2. Calculate Ratios
  const ratios = calculateRatios(muscleAudits);

  // 3. Compute Overall Score (0-100)
  const overallScore = calculateOverallScore(muscleAudits, ratios);

  // 4. Identify Highest Priority Gap
  const highestPriorityGap =
    muscleAudits.sort((a, b) => b.priority - a.priority)[0] || null;

  return {
    timestamp: new Date().toISOString(),
    muscleAudits,
    ratios,
    overallScore,
    highestPriorityGap,
  };
};

/**
 * Analyze a single muscle group against standards
 */
const analyzeMuscle = (
  vol: MuscleGroupVolume,
  standards: RPVolumeStandards,
): MuscleAudit => {
  let level = WeaknessLevel.NONE;
  let priority = 0;
  let recommendation = "Maintenance volume is sufficient.";
  let deficit = 0;

  // Logic:
  // MRV > Volume >= MAV: Optimal / High
  // MAV > Volume >= MEV: Effective
  // MEV > Volume >= MV: Maintenance / Undertrained for growth
  // MV > Volume: Risk of Atrophy

  if (vol.weeklyVolume > standards.MRV) {
    level = WeaknessLevel.OVERREACHED;
    priority = 90;
    recommendation = `Reduce volume! You are exceeding Maximum Recoverable Volume (${standards.MRV}). Risk of injury.`;
    deficit = standards.MRV - vol.weeklyVolume; // Negative deficit
  } else if (vol.weeklyVolume < standards.MV) {
    level = WeaknessLevel.ATROPHY_RISK;
    priority = 80; // High urgency
    deficit = standards.MV - vol.weeklyVolume;
    recommendation = `CRITICAL: You are below maintenance (${standards.MV}). Muscle loss likely. Add ${deficit} sets immediately.`;
  } else if (vol.weeklyVolume < standards.MEV) {
    level = WeaknessLevel.UNDERTRAINED;
    deficit = standards.MEV - vol.weeklyVolume;
    // Priority scales with how big the deficit is relative to MEV
    priority = 50 + deficit * 4;
    recommendation = `Undertrained. Add ${deficit} sets to reach Minimum Effective Volume (${standards.MEV}).`;
  } else {
    // Between MEV and MRV - Good zone
    level = WeaknessLevel.NONE;
    deficit = standards.MEV - vol.weeklyVolume; // Negative
    priority = 0;
    recommendation = "Volume is within the effective range.";
  }

  // Adjust priority for "Core" muscles or "Side Delts" which are often neglected but visual
  if (
    ["Side Delts", "Abs", "Back (Width)"].includes(vol.muscleGroup) &&
    level !== WeaknessLevel.NONE
  ) {
    priority += 10;
  }

  return {
    muscleGroup: vol.muscleGroup,
    weeklyVolume: vol.weeklyVolume,
    standards,
    level,
    deficit,
    priority,
    recommendation,
  };
};

/**
 * Calculate structural balance ratios
 */
const calculateRatios = (audits: MuscleAudit[]): BalanceRatio[] => {
  const getVol = (name: string) =>
    audits.find((a) => a.muscleGroup === name)?.weeklyVolume || 0;

  // Helper to sum by category from muscleMap logic (requires mapping back to categories)
  // For now, hardcode the groupings based on standard taxonomy.

  // Push: Chest, Shoulders (Front), Shoulders (Side), Triceps, Quads (Leg Push)
  // Pull: Back (Width), Back (Thickness), Shoulders (Rear), Biceps, Hamstrings (Hinge)

  // Better Approach: Use the categories I filtered in muscleMap?
  // Let's use specific groups for ratios that matter for injury prevention.

  // 1. Upper Body Push/Pull
  const pushVol =
    getVol("Chest") + getVol("Shoulders (Front)") + getVol("Shoulders (Side)"); // Vertical + Horizontal Push
  const pullVol =
    getVol("Back (Width)") +
    getVol("Back (Thickness)") +
    getVol("Shoulders (Rear)");

  const pushPullRatioVal =
    pullVol > 0 ? pushVol / pullVol : pushVol > 0 ? 2.0 : 1.0;

  const pushPullRatio: BalanceRatio = {
    type: "push_pull",
    value: Number(pushPullRatioVal.toFixed(2)),
    threshold: RATIO_THRESHOLDS.push_pull,
    status: "balanced",
  };

  if (pushPullRatio.value > RATIO_THRESHOLDS.push_pull.max) {
    pushPullRatio.status = "structural_risk"; // Too much push
  } else if (pushPullRatio.value < RATIO_THRESHOLDS.push_pull.min) {
    pushPullRatio.status = "minor_imbalance"; // Pull dominant (rarely bad, but imbalance)
  }

  // 2. Quad/Ham
  const quadVol = getVol("Quads");
  const hamVol = getVol("Hamstrings");
  const quadHamVal = hamVol > 0 ? quadVol / hamVol : quadVol > 0 ? 2.0 : 1.0;

  const quadHamRatio: BalanceRatio = {
    type: "quad_ham",
    value: Number(quadHamVal.toFixed(2)),
    threshold: RATIO_THRESHOLDS.quad_ham,
    status: "balanced",
  };

  if (quadHamRatio.value > RATIO_THRESHOLDS.quad_ham.max) {
    quadHamRatio.status = "structural_risk"; // Too much quad, knee risk
  }

  return [pushPullRatio, quadHamRatio];
};

const calculateOverallScore = (
  audits: MuscleAudit[],
  ratios: BalanceRatio[],
): number => {
  // Start at 100
  let score = 100;

  // Deduct for weaknesses
  audits.forEach((a) => {
    if (a.level === WeaknessLevel.ATROPHY_RISK) score -= 10;
    if (a.level === WeaknessLevel.UNDERTRAINED) score -= 5;
    if (a.level === WeaknessLevel.OVERREACHED) score -= 5;
  });

  // Deduct for imbalances
  ratios.forEach((r) => {
    if (r.status === "structural_risk") score -= 15;
    if (r.status === "minor_imbalance") score -= 5;
  });

  return Math.max(0, Math.round(score));
};

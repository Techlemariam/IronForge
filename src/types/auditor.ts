// src/types/auditor.ts

/**
 * Type definitions for the Weakness Auditor system
 * Based on Mike Israetel's Renaissance Periodization volume landmarks
 */

/**
 * Weekly volume aggregation for a single muscle group
 */
export interface MuscleGroupVolume {
  muscleGroup: string;
  weeklyVolume: number; // Total sets in rolling 7-day window
  lastUpdated: string; // ISO timestamp
}

/**
 * Mike Israetel Renaissance Periodization standards
 */
export interface RPVolumeStandards {
  MV: number; // Maintenance Volume
  MEV: number; // Minimum Effective Volume
  MAV: [number, number]; // Maximum Adaptive Volume (range)
  MRV: number; // Maximum Recoverable Volume
}

/**
 * Weakness classification levels
 */
export enum WeaknessLevel {
  NONE = "none",
  UNDERTRAINED = "undertrained",
  ATROPHY_RISK = "atrophy",
  OVERREACHED = "overreached",
}

/**
 * Balance ratio analysis result
 */
export interface BalanceRatio {
  type: "push_pull" | "quad_ham" | "cardio_strength";
  value: number;
  threshold: {
    min: number;
    max: number;
  };
  status: "balanced" | "minor_imbalance" | "structural_risk";
}

/**
 * Complete audit result for a single muscle group
 */
export interface MuscleAudit {
  muscleGroup: string;
  weeklyVolume: number;
  standards: RPVolumeStandards;
  level: WeaknessLevel;
  deficit: number; // How many sets below MEV (negative if above)
  priority: number; // 0-100 urgency score
  recommendation: string; // User-facing text
}

/**
 * Full audit report - the output of weaknessAuditor
 */
export interface AuditReport {
  timestamp: string;
  muscleAudits: MuscleAudit[];
  ratios: BalanceRatio[];
  overallScore: number; // 0-100 (100 = perfect balance)
  highestPriorityGap: MuscleAudit | null;
}

/**
 * Cached weekly volumes (for performance)
 */
export interface CachedWeeklyData {
  weekStartDate: string; // ISO date (Monday)
  volumes: MuscleGroupVolume[];
  calculatedAt: string;
}

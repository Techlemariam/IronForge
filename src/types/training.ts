/**
 * Training Path System Types
 *
 * Implements the "Training Resource Management" system with:
 * - 4 Paths (Juggernaut, Titan, Engine, Hybrid Warden)
 * - 2 Passive Layers (Mobility, Recovery)
 * - Macro-cycles for periodization (Alpha, Beta, Gamma)
 */

// =============================================================================
// TRAINING PATHS (Choose 1)
// =============================================================================

/**
 * The 4 available training paths, each with unique focus and modifiers.
 */
export type TrainingPath =
  | "JUGGERNAUT" // Max styrka (Powerlifting focus)
  | "PATHFINDER" // VO2max/Uthållighet (Engine)
  | "WARDEN"; // Balanserad (Hybrid)

export type Faction = "ALLIANCE" | "HORDE";

/**
 * Path display information for UI
 */
export interface PathInfo {
  id: TrainingPath;
  name: string;
  description: string;
  icon: string;
  color: string;
  strengthLevel: VolumeLevel;
  cardioLevel: VolumeLevel;
}

// =============================================================================
// PASSIVE LAYERS (Built in parallel)
// =============================================================================

/**
 * Passive layer progression levels
 */
export type LayerLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD";

/**
 * Passive layer types
 */
export type PassiveLayerType = "MOBILITY" | "RECOVERY";

/**
 * Bonuses provided by passive layers
 */
export interface LayerBonuses {
  injuryRisk: number; // Negative = reduction (e.g., -0.15 = -15%)
  romBonus: number; // Range of motion bonus for lifts
  recoveryBoost: number; // TSB recovery acceleration
}

// =============================================================================
// MACRO-CYCLES (Periodization)
// =============================================================================

/**
 * Macro-cycle phases for auto-spec engine
 * - ALPHA: VO2max focus (cardio at MRV, strength at MV)
 * - BETA: Strength focus (strength at MRV, cardio at MV)
 * - GAMMA: Deload/Recovery (everything at MV)
 */
export type MacroCycle = "ALPHA" | "BETA" | "GAMMA";

/**
 * Metrics used to evaluate macro-cycle transitions
 */
export interface SystemMetrics {
  ctl: number; // Chronic Training Load (Fitness)
  atl: number; // Acute Training Load (Fatigue)
  tsb: number; // Training Stress Balance (Form)
  hrv: number; // Heart Rate Variability
  sleepScore: number; // Sleep quality (0-100)
  bodyBattery: number; // Garmin/System energy metric (0-100)
  strengthDelta: number; // Change in strength metrics
  consecutiveStalls: number; // Number of weeks with <= 0 progress
  weeksInPhase: number; // How long we've been in the current macro-cycle
  nutritionMode: "DEFICIT" | "MAINTENANCE" | "SURPLUS";
  sleepDebt: number; // Hours (positive = debt)
  acwr: number; // Acute:Chronic Workload Ratio
  junkMilePercent: number; // % of Cardio in Zone 3
  neuralLoad: number; // Arbitrary CNS units
  impactLoad: number; // Run TSS
  interferenceEvents: number; // Count of <6h gap sessions
}

export type NutritionMode = "DEFICIT" | "MAINTENANCE" | "SURPLUS";

// =============================================================================
// VOLUME LANDMARKS (Renaissance Periodization)
// =============================================================================

/**
 * Volume level categories
 */
export type VolumeLevel = "MV" | "MEV" | "MAV" | "MRV";

/**
 * Volume landmarks for a muscle group (sets per week)
 */
export interface VolumeLandmarks {
  mv: number; // Maintenance Volume
  mev: number; // Minimum Effective Volume
  mav: number; // Maximum Adaptive Volume
  mrv: number; // Maximum Recoverable Volume
}

/**
 * Muscle groups tracked for volume management
 */
export type MuscleGroup =
  | "QUADS"
  | "HAMS"
  | "GLUTES"
  | "CHEST"
  | "BACK"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "ABS"
  | "CALVES";

// =============================================================================
// COMBAT MODIFIERS
// =============================================================================

/**
 * Combat stat modifiers per path (1.0 = no change, 1.2 = +20%)
 */
export interface PathModifiers {
  attackPower: number;
  stamina: number;
  dodge: number;
}

// =============================================================================
// REWARD SYSTEM (Soft-lock)
// =============================================================================

/**
 * Reward multiplier configuration
 */
export interface RewardConfig {
  withinPathMultiplier: number; // e.g., 1.5 = +50% XP/Gold
  outsidePathDifficulty: number; // e.g., 1.2 = 20% harder gates
}

// =============================================================================
// ACTIVITY TRACKING
// =============================================================================

/**
 * Recovery resource types
 */
export type RecoveryResource = "CNS" | "MUSCULAR" | "METABOLIC";

/**
 * Activity with resource cost for memory management
 */
export interface TrainingActivity {
  name: string;
  type: "STRENGTH" | "CARDIO_ZONE2" | "CARDIO_ZONE5" | "MOBILITY";
  intensity: "LOW" | "MEDIUM" | "HIGH";
  currentVolume: number;
  targets: VolumeLandmarks;
  resourceCost: Record<RecoveryResource, number>;
  muscleGroup?: MuscleGroup;
}

/**
 * Capacity modifier from external factors (sleep, stress, etc.)
 */
export interface CapacityModifier {
  multiplier: number; // e.g., 0.8 = -20% capacity
  reason: string;
  source: "SLEEP" | "HRV" | "PARENTING" | "MANUAL";
}

/**
 * Static definition of a workout in the library (80/20 system)
 */
export interface WorkoutDefinition {
  id: string; // Unique ID
  code: string; // Short code (e.g., 'RF1', 'CI5')
  name: string;
  description: string;
  type: "RUN" | "BIKE" | "SWIM" | "STRENGTH" | "MOBILITY";
  durationMin: number; // Estimated duration in minutes for sorting/calc
  durationLabel?: string; // Display string (e.g. "6 mi", "1500m")
  intervalsIcuString?: string; // Builder text for Intervals.icu
  intensity: "LOW" | "MEDIUM" | "HIGH";
  resourceCost: Partial<Record<RecoveryResource, number>>; // Estimated cost
  recommendedPaths?: TrainingPath[]; // Best fit paths
  rewards?: { xp: number; gold: number }; // Gamification rewards
  exercises?: {
    id: string; // Key from EXERCISE_DB
    sets: number;
    reps: string | number;
    rpe?: number;
    restMin?: number;
  }[];
}

/**
 * Hard volume targets for weekly mastery per path
 */
export interface BuildVolumeTargets {
  strengthSets: number;
  cardioTss: number;
  mobilitySets: number;
}

/**
 * Actual progress for the week
 */
export interface WeeklyMastery {
  strengthSets: number;
  cardioTss: number;
  mobilitySets: number;
}

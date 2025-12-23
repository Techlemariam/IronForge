/**
 * @fileoverview Neural Lattice V2 Type Definitions
 * PoE-inspired passive Neural Lattice for IronForge
 */

// ============================================================================
// Core Enums & Types
// ============================================================================

/** Node tier determines visual size, importance, and unlock requirements */
export type NodeTier = 'minor' | 'notable' | 'keystone';

/** Training paths aligned with athlete archetypes */
export type SkillPath = 'juggernaut' | 'engine' | 'warden' | 'titan' | 'sage';

/** Node status in the player's progression */
export enum SkillStatus {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
    MASTERED = 'MASTERED',
}

/** Categories for backward compatibility and node classification */
export type SkillCategory =
    | 'strength'
    | 'endurance'
    | 'hypertrophy'
    | 'hybrid'
    | 'utility'
    // Legacy (deprecated, kept for migration)
    | 'push'
    | 'pull'
    | 'legs'
    | 'core';

// ============================================================================
// Skill Effects & Drawbacks
// ============================================================================

/**
 * Positive effects granted by a skill node.
 * All multipliers are expressed as decimals (e.g., 1.5 = +50%)
 */
export interface SkillEffect {
    /** Multiplier for Talent Point rewards (1.0 = base, 1.5 = +50%) */
    tpMultiplier?: number;
    /** Multiplier for Kinetic Shard rewards */
    ksMultiplier?: number;
    /** Multiplier for Titan Load calculation */
    titanLoadMultiplier?: number;
    /** Multiplier for Body Battery recovery rate */
    recoveryRateMultiplier?: number;

    /** Passive TP earned per rest day */
    passiveTpPerDay?: number;
    /** Passive KS earned per rest day */
    passiveKsPerDay?: number;

    /** Flat bonuses */
    flatTpBonus?: number;
    flatKsBonus?: number;
    flatTitanLoad?: number;

    /** Feature unlocks */
    unlocksBrickWorkouts?: boolean;
    unlocksVikingPress?: boolean;
    unlocksPumpIndicator?: boolean;
    unlocksAutoDeload?: boolean;
}

/**
 * Conditions that must be met for effects to apply.
 * Used for Keystones that only activate under certain circumstances.
 */
export interface EffectCondition {
    /** Minimum reps in set for effect (e.g., Hypertrophy = 8) */
    minReps?: number;
    /** Maximum reps in set for effect (e.g., Hypertrophy = 15) */
    maxReps?: number;
    /** Minimum session duration in minutes */
    minSessionDurationMins?: number;
    /** Session must include both strength and cardio */
    requiresHybridSession?: boolean;
    /** Minimum Body Battery for effect */
    minBodyBattery?: number;
    /** Minimum Sleep Score for effect */
    minSleepScore?: number;
    /** Minimum VO2max for effect */
    minVO2max?: number;
    /** Zone requirement (e.g., Zone 2 only) */
    requiredZone?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Negative effects (drawbacks) for Keystones.
 * Structured identically to SkillEffect for symmetry.
 */
export interface SkillDrawback {
    /** Multiplier for TP (0.5 = -50%, 0 = no TP) */
    tpMultiplier?: number;
    /** Multiplier for KS */
    ksMultiplier?: number;
    /** Multiplier for Titan Load */
    titanLoadMultiplier?: number;
    /** Multiplier for recovery */
    recoveryRateMultiplier?: number;
}

/**
 * Conditions under which drawbacks apply.
 */
export interface DrawbackCondition {
    /** Drawback applies if reps < this value */
    maxReps?: number;
    /** Drawback applies if Sleep Score < this value */
    maxSleepScore?: number;
    /** Drawback if session duration < this value */
    maxSessionDurationMins?: number;
    /** Drawback if training this many consecutive days */
    consecutiveTrainingDays?: number;
    /** Drawback if failed/incomplete sets */
    onFailedSet?: boolean;
}

// ============================================================================
// Skill Requirements
// ============================================================================

/** Requirement types for unlocking skills */
export type SkillRequirementType =
    | 'achievement_count'
    | 'vo2max_value'
    | '1rm_weight'
    | 'rep_count'
    | 'session_count'
    | 'rest_day_count'
    | 'sleep_score_streak'
    | 'brick_workout_count';

export interface SkillRequirement {
    type: SkillRequirementType;
    /** Exercise ID or 'any' for global requirements */
    exerciseId: string;
    /** Target value to compare against */
    value: number;
    /** Comparison operator */
    comparison: 'gte' | 'lte' | 'eq';
}

// ============================================================================
// Skill Node V2
// ============================================================================

/**
 * V2 Skill Node - The core data structure for the PoE-style Neural Lattice.
 */
export interface SkillNodeV2 {
    /** Unique identifier (e.g., 'keystone_iron_discipline') */
    id: string;
    /** Display name */
    title: string;
    /** Flavor text / description */
    description: string;

    // --- Classification ---
    /** Node importance tier */
    tier: NodeTier;
    /** Associated training path */
    path: SkillPath;
    /** Legacy category for backward compatibility */
    category: SkillCategory;

    // --- Topology ---
    /** Parent node IDs that must be unlocked first */
    parents: string[];
    /** How to evaluate multiple parents: 'AND' = all required, 'OR' = any */
    unlockLogic: 'AND' | 'OR';

    // --- Position ---
    /** X/Y coordinates for tree visualization */
    position: { x: number; y: number };

    // --- Effects ---
    /** Positive effects when unlocked */
    effects?: SkillEffect;
    /** Conditions for effects to apply (e.g., Keystones) */
    effectConditions?: EffectCondition;

    // --- Drawbacks (Keystones only) ---
    /** Negative effects (trade-offs) */
    drawbacks?: SkillDrawback;
    /** Conditions under which drawbacks apply */
    drawbackConditions?: DrawbackCondition;

    // --- Cost ---
    /** Currency type for purchase */
    currency: 'talent_point' | 'kinetic_shard';
    /** Base cost in the specified currency */
    cost: number;

    // --- Requirements ---
    /** Prerequisites beyond parent nodes */
    requirements: SkillRequirement[];

    // --- Keystone-specific ---
    /** IDs of Keystones this one excludes (mutual exclusivity) */
    excludes?: string[];
    /** Minimum notables required before this node can be purchased */
    gateRequirement?: number;
}

// ============================================================================
// Calculated Effects (Runtime)
// ============================================================================

/**
 * Aggregated effects from all unlocked skills, calculated at runtime.
 * This is what the game logic uses to apply bonuses.
 */
export interface CalculatedEffects {
    /** Final TP multiplier (product of all individual multipliers) */
    tpMultiplier: number;
    /** Final KS multiplier */
    ksMultiplier: number;
    /** Final Titan Load multiplier */
    titanLoadMultiplier: number;
    /** Final recovery rate multiplier */
    recoveryRateMultiplier: number;

    /** Total passive TP per day */
    passiveTpPerDay: number;
    /** Total passive KS per day */
    passiveKsPerDay: number;

    /** Total flat bonuses */
    flatTpBonus: number;
    flatKsBonus: number;
    flatTitanLoad: number;

    /** Active feature flags */
    features: {
        brickWorkouts: boolean;
        vikingPress: boolean;
        pumpIndicator: boolean;
        autoDeload: boolean;
    };

    /** Active Keystone ID (if any) */
    activeKeystoneId: string | null;
}

// ============================================================================
// Titan Rank (unchanged from V1)
// ============================================================================

export interface TitanRank {
    id: number;
    name: string;
    minTp: number;
    minKs: number;
    gateDescription?: string;
}

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// Note: Legacy types (SkillNode, etc.) should be deprecated gradually.
// For now, we keep them in types/index.ts and migrate consumers to V2.

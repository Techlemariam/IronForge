/**
 * Training Path Definitions & Static Data
 * 
 * Contains all static configuration for the Training Resource Management system.
 */

import {
    TrainingPath,
    PathInfo,
    PathModifiers,
    LayerLevel,
    LayerBonuses,
    VolumeLandmarks,
    MuscleGroup,
    RewardConfig,
    BuildVolumeTargets
} from '../types/training';

// =============================================================================
// PATH DEFINITIONS
// =============================================================================

/**
 * Display information for each training path
 */
export const PATH_INFO: Record<TrainingPath, PathInfo> = {
    IRON_JUGGERNAUT: {
        id: 'IRON_JUGGERNAUT',
        name: 'The Iron Juggernaut',
        description: 'Maximal strength and power. Inspired by 5/3/1 and Sheiko.',
        icon: '⚔️',
        color: 'text-red-500',
        strengthLevel: 'MRV',
        cardioLevel: 'MV',
    },
    TITAN: {
        id: 'TITAN',
        name: 'The Titan',
        description: 'Hypertrophy and muscle volume. Renaissance Periodization methodology.',
        icon: '🏆',
        color: 'text-amber-500',
        strengthLevel: 'MAV',
        cardioLevel: 'MEV',
    },
    ENGINE: {
        id: 'ENGINE',
        name: 'The Engine',
        description: 'Elite VO2max and endurance. Polarized 80/20 training.',
        icon: '💨',
        color: 'text-cyan-500',
        strengthLevel: 'MV',
        cardioLevel: 'MRV',
    },
    HYBRID_WARDEN: {
        id: 'HYBRID_WARDEN',
        name: 'The Hybrid Warden',
        description: 'Balanced strength and cardio. Alex Viada methodology.',
        icon: '⚖️',
        color: 'text-purple-500',
        strengthLevel: 'MEV',
        cardioLevel: 'MAV',
    },
};

// =============================================================================
// COMBAT MODIFIERS (15-25% range)
// =============================================================================

/**
 * Combat stat modifiers per path
 * Values are multipliers: 1.0 = no change, 1.2 = +20%, 0.9 = -10%
 */
export const PATH_MODIFIERS: Record<TrainingPath, PathModifiers> = {
    IRON_JUGGERNAUT: {
        attackPower: 1.20,  // +20% damage
        stamina: 0.90,      // -10% stamina
        dodge: 1.00,        // No change
    },
    TITAN: {
        attackPower: 1.15,  // +15% damage
        stamina: 1.10,      // +10% stamina
        dodge: 1.00,        // No change
    },
    ENGINE: {
        attackPower: 0.90,  // -10% damage
        stamina: 1.30,      // +30% stamina
        dodge: 1.10,        // +10% dodge
    },
    HYBRID_WARDEN: {
        attackPower: 1.10,  // +10% damage
        stamina: 1.10,      // +10% stamina
        dodge: 1.05,        // +5% dodge
    },
};

// =============================================================================
// PASSIVE LAYER BONUSES
// =============================================================================

/**
 * Mobility layer bonuses per level
 */
export const MOBILITY_LAYER_BONUSES: Record<LayerLevel, LayerBonuses> = {
    NONE: { injuryRisk: 0, romBonus: 0, recoveryBoost: 0 },
    BRONZE: { injuryRisk: -0.05, romBonus: 0, recoveryBoost: 0 },
    SILVER: { injuryRisk: -0.10, romBonus: 0.05, recoveryBoost: 0 },
    GOLD: { injuryRisk: -0.15, romBonus: 0.10, recoveryBoost: 0.05 },
};

/**
 * Recovery layer bonuses per level
 */
export const RECOVERY_LAYER_BONUSES: Record<LayerLevel, LayerBonuses> = {
    NONE: { injuryRisk: 0, romBonus: 0, recoveryBoost: 0 },
    BRONZE: { injuryRisk: 0, romBonus: 0, recoveryBoost: 0.05 },
    SILVER: { injuryRisk: -0.05, romBonus: 0, recoveryBoost: 0.10 },
    GOLD: { injuryRisk: -0.10, romBonus: 0, recoveryBoost: 0.15 },
};

/**
 * Requirements to reach each layer level
 */
export const LAYER_REQUIREMENTS: Record<LayerLevel, { sessions: number; description: string }> = {
    NONE: { sessions: 0, description: 'No progress yet' },
    BRONZE: { sessions: 10, description: '10 ATG/Recovery sessions' },
    SILVER: { sessions: 30, description: '30 ATG/Recovery sessions' },
    GOLD: { sessions: 60, description: '60 ATG/Recovery sessions' },
};

// =============================================================================
// VOLUME LANDMARKS (Renaissance Periodization data)
// =============================================================================

/**
 * Volume landmarks per muscle group (sets per week)
 * Based on RP recommendations adjusted for hybrid training
 */
export const VOLUME_LANDMARKS: Record<MuscleGroup, VolumeLandmarks> = {
    QUADS: { mv: 2, mev: 6, mav: 12, mrv: 18 },
    HAMS: { mv: 2, mev: 4, mav: 10, mrv: 16 },
    GLUTES: { mv: 2, mev: 4, mav: 12, mrv: 16 },
    CHEST: { mv: 2, mev: 8, mav: 12, mrv: 20 },
    BACK: { mv: 2, mev: 8, mav: 14, mrv: 22 },
    SHOULDERS: { mv: 2, mev: 6, mav: 12, mrv: 18 },
    BICEPS: { mv: 3, mev: 5, mav: 14, mrv: 20 },
    TRICEPS: { mv: 2, mev: 4, mav: 10, mrv: 14 },
    ABS: { mv: 3, mev: 5, mav: 16, mrv: 20 },
    CALVES: { mv: 2, mev: 6, mav: 12, mrv: 16 },
};

// =============================================================================
// REWARD CONFIGURATION (Soft-lock)
// =============================================================================

/**
 * Reward multipliers for the soft-lock system
 */
export const REWARD_CONFIG: RewardConfig = {
    withinPathMultiplier: 1.5,   // +50% XP/Gold for quests matching your path
    outsidePathDifficulty: 1.2,  // 20% harder gates for off-path content
};

// =============================================================================
// MACRO-CYCLE THRESHOLDS
// =============================================================================

/**
 * Thresholds for auto-spec engine transitions
 */
export const MACRO_CYCLE_THRESHOLDS = {
    // Trigger GAMMA (deload) if TSB drops below this
    GAMMA_TSB_THRESHOLD: -40,

    // Consider transition to BETA if CTL exceeds this and TSB is recovering
    BETA_CTL_THRESHOLD: 60,
    BETA_TSB_THRESHOLD: -10,

    // Safety margin for high-intensity allocation
    HIGH_INTENSITY_SAFETY_MARGIN: 15,

    // Parenting debuff thresholds
    SLEEP_DEBUFF_THRESHOLD: 60,  // sleepScore below this triggers debuff
    HRV_DEBUFF_THRESHOLD: 40,    // HRV below this triggers debuff

    // Debuff multipliers
    SLEEP_DEBUFF_MULTIPLIER: 0.80,  // -20% capacity
    HRV_DEBUFF_MULTIPLIER: 0.85,    // -15% capacity
};

// =============================================================================
// HARD TARGETS & PATH MODIFIERS (System Matrix)
// =============================================================================

/**
 * Weekly mastery targets per path (System Matrix)
 */
export const BUILD_VOLUME_TARGETS: Record<TrainingPath, BuildVolumeTargets> = {
    IRON_JUGGERNAUT: { strengthSets: 20, cardioTss: 100, mobilitySets: 4 },
    TITAN: { strengthSets: 15, cardioTss: 200, mobilitySets: 6 },
    ENGINE: { strengthSets: 4, cardioTss: 500, mobilitySets: 8 },
    HYBRID_WARDEN: { strengthSets: 12, cardioTss: 300, mobilitySets: 10 },
};

/**
 * Path-specific volume modifiers (Physical Simulator)
 * Scales Muscle Group landmarks based on active Path to account for interference effect.
 */
export const PATH_VOLUME_MODIFIERS: Record<TrainingPath, Partial<Record<MuscleGroup, number>>> = {
    ENGINE: {
        QUADS: 0.7,
        HAMS: 0.7,
        GLUTES: 0.8,
        BACK: 0.9
    },
    IRON_JUGGERNAUT: {
        QUADS: 1.1,
        HAMS: 1.1,
        GLUTES: 1.1,
        BACK: 1.0
    },
    TITAN: {
        QUADS: 1.0,
        BACK: 1.1
    },
    HYBRID_WARDEN: {
        QUADS: 0.9,
        BACK: 1.0
    }
};


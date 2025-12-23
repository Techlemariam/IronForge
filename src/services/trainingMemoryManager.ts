/**
 * Training Memory Manager
 * 
 * Core service for the Training Resource Management system.
 * Manages recovery capacity, system load, macro-cycle transitions,
 * and reward multipliers for the soft-lock system.
 */

import {
    TrainingPath,
    MacroCycle,
    SystemMetrics,
    TrainingActivity,
    CapacityModifier,
    LayerLevel,
    MuscleGroup,
    VolumeLandmarks
} from '../types/training';
import {
    PATH_MODIFIERS,
    MACRO_CYCLE_THRESHOLDS,
    REWARD_CONFIG,
    MOBILITY_LAYER_BONUSES,
    RECOVERY_LAYER_BONUSES,
    VOLUME_LANDMARKS,
    PATH_VOLUME_MODIFIERS
} from '../data/builds';

// Total recovery capacity (100% = fully rested)
const TOTAL_CAPACITY = 100;

/**
 * Training Memory Manager Service
 */
export const TrainingMemoryManager = {

    /**
     * Calculate total system load from all active training activities.
     * Returns a percentage (0-100+) of total recovery capacity used.
     * Path-aware: Adjusts thresholds based on interference effects.
     */
    getSystemLoad(activities: TrainingActivity[], activePath: TrainingPath = 'HYBRID_WARDEN'): number {
        return activities.reduce((acc, activity) => {
            // Get muscle group from activity (if available) or assume generic
            // For now, let's assume we need to find the muscle group for the activity
            // To be precise, we'd need MuscleGroup on TrainingActivity. 
            // If missing, we use raw targets.

            let mrv = activity.targets.mrv;

            // Note: In a real scenario, we'd identify the MuscleGroup here.
            // For this implementation, we'll use a hack or ensure TrainingActivity has MuscleGroup.
            // Let's assume TrainingActivity might have an optional muscleGroup field.
            const muscleGroup = (activity as any).muscleGroup as MuscleGroup | undefined;

            if (muscleGroup) {
                const adjustedLandmarks = this.getAdjustedLandmarks(muscleGroup, activePath);
                mrv = adjustedLandmarks.mrv;
            }

            // Base load = current volume / MRV as a percentage
            const volumeUsage = (activity.currentVolume / mrv) * 100;

            // Apply intensity multiplier
            const intensityMultiplier = {
                'LOW': 0.5,
                'MEDIUM': 1.0,
                'HIGH': 1.5,
            }[activity.intensity];

            return acc + (volumeUsage * intensityMultiplier);
        }, 0);
    },

    /**
     * Check if user has capacity for high-intensity work (Zone 5 / heavy lifting).
     * Uses a safety margin to account for life factors (parenting, stress, etc.)
     */
    canAllocateHighIntensity(
        activities: TrainingActivity[],
        capacityModifiers: CapacityModifier[] = []
    ): boolean {
        const currentLoad = this.getSystemLoad(activities);

        // Apply debuffs to total capacity
        let adjustedCapacity = TOTAL_CAPACITY;
        for (const modifier of capacityModifiers) {
            adjustedCapacity *= modifier.multiplier;
        }

        const availableCapacity = adjustedCapacity - currentLoad;
        return availableCapacity > MACRO_CYCLE_THRESHOLDS.HIGH_INTENSITY_SAFETY_MARGIN;
    },

    /**
     * Evaluate whether a macro-cycle transition should occur.
     * Uses TSB, CTL, and strength progress to determine optimal phase.
     */
    evaluateTransition(
        metrics: SystemMetrics,
        currentCycle: MacroCycle
    ): { shouldTransition: boolean; recommendedCycle: MacroCycle; reason: string } {
        const { GAMMA_TSB_THRESHOLD, BETA_CTL_THRESHOLD, BETA_TSB_THRESHOLD } = MACRO_CYCLE_THRESHOLDS;

        // Priority 1: Emergency deload if TSB is critically low
        if (metrics.tsb < GAMMA_TSB_THRESHOLD) {
            return {
                shouldTransition: currentCycle !== 'GAMMA',
                recommendedCycle: 'GAMMA',
                reason: `TSB critically low (${metrics.tsb}). Deload required to prevent overtraining.`
            };
        }

        // Priority 2: Transition from ALPHA to BETA if cardio goals met
        if (currentCycle === 'ALPHA') {
            if (metrics.ctl > BETA_CTL_THRESHOLD && metrics.tsb > BETA_TSB_THRESHOLD) {
                return {
                    shouldTransition: true,
                    recommendedCycle: 'BETA',
                    reason: `Aerobic base established (CTL: ${metrics.ctl}). Ready for strength focus.`
                };
            }
        }

        // Priority 3: Transition from BETA to ALPHA if strength plateaus
        if (currentCycle === 'BETA') {
            if (metrics.strengthDelta <= 0 && metrics.atl > metrics.ctl) {
                return {
                    shouldTransition: true,
                    recommendedCycle: 'ALPHA',
                    reason: 'Strength plateau detected. Switching to VO2max focus for active recovery.'
                };
            }
        }

        // Priority 4: Exit GAMMA if recovered
        if (currentCycle === 'GAMMA') {
            if (metrics.tsb > 0) {
                return {
                    shouldTransition: true,
                    recommendedCycle: 'ALPHA',
                    reason: 'Recovery complete. Resuming training with aerobic focus.'
                };
            }
        }

        return {
            shouldTransition: false,
            recommendedCycle: currentCycle,
            reason: 'No transition needed. Continue current cycle.'
        };
    },

    /**
     * Calculate capacity modifiers based on external factors.
     * Returns debuffs that reduce total training capacity.
     */
    calculateDebuffs(sleepScore: number, hrv: number): CapacityModifier[] {
        const debuffs: CapacityModifier[] = [];
        const { SLEEP_DEBUFF_THRESHOLD, HRV_DEBUFF_THRESHOLD, SLEEP_DEBUFF_MULTIPLIER, HRV_DEBUFF_MULTIPLIER } = MACRO_CYCLE_THRESHOLDS;

        if (sleepScore < SLEEP_DEBUFF_THRESHOLD) {
            debuffs.push({
                multiplier: SLEEP_DEBUFF_MULTIPLIER,
                reason: `Poor sleep (score: ${sleepScore})`,
                source: 'SLEEP'
            });
        }

        if (hrv < HRV_DEBUFF_THRESHOLD) {
            debuffs.push({
                multiplier: HRV_DEBUFF_MULTIPLIER,
                reason: `Low HRV (${hrv})`,
                source: 'HRV'
            });
        }

        return debuffs;
    },

    /**
     * Get reward multiplier for soft-lock system.
     * Quests matching user's path get bonus rewards.
     */
    getRewardMultiplier(questPath: TrainingPath | null, userPath: TrainingPath): number {
        if (questPath === null) {
            // Generic quest - no multiplier
            return 1.0;
        }

        if (questPath === userPath) {
            return REWARD_CONFIG.withinPathMultiplier;
        }

        // Off-path content doesn't get a reward bonus
        // (difficulty increase is handled separately)
        return 1.0;
    },

    /**
     * Get difficulty multiplier for off-path content.
     */
    getDifficultyMultiplier(questPath: TrainingPath | null, userPath: TrainingPath): number {
        if (questPath === null || questPath === userPath) {
            return 1.0;
        }

        return REWARD_CONFIG.outsidePathDifficulty;
    },

    /**
     * Get combat modifiers for a given path.
     */
    getCombatModifiers(path: TrainingPath) {
        return PATH_MODIFIERS[path];
    },

    /**
     * Get combined layer bonuses for a user.
     */
    getLayerBonuses(mobilityLevel: LayerLevel, recoveryLevel: LayerLevel) {
        const mobility = MOBILITY_LAYER_BONUSES[mobilityLevel];
        const recovery = RECOVERY_LAYER_BONUSES[recoveryLevel];

        return {
            injuryRisk: mobility.injuryRisk + recovery.injuryRisk,
            romBonus: mobility.romBonus + recovery.romBonus,
            recoveryBoost: mobility.recoveryBoost + recovery.recoveryBoost,
        };
    },

    /**
     * Determine if user should be in "Survival Mode" (minimum volume across all activities).
     * Triggered by critical recovery status.
     * Path-aware: Engine path allows deeper TSB floor.
     */
    shouldEnterSurvivalMode(metrics: SystemMetrics, path: TrainingPath = 'HYBRID_WARDEN'): boolean {
        const debuffs = this.calculateDebuffs(metrics.sleepScore, metrics.hrv);

        const tsbFloor = path === 'ENGINE' ? -25 : MACRO_CYCLE_THRESHOLDS.GAMMA_TSB_THRESHOLD;

        // If multiple debuffs active or TSB is very low, enter survival mode
        return debuffs.length >= 2 || metrics.tsb < tsbFloor;
    },

    /**
     * Get adjusted landmarks for a specific muscle group based on the active path.
     * Applies path-specific multipliers to the baseline RP landmarks.
     */
    getAdjustedLandmarks(muscleGroup: MuscleGroup, path: TrainingPath): VolumeLandmarks {
        const base = VOLUME_LANDMARKS[muscleGroup];
        const modifier = PATH_VOLUME_MODIFIERS[path]?.[muscleGroup] ?? 1.0;

        return {
            mv: base.mv, // Maintenance usually stays same
            mev: base.mev * modifier,
            mav: base.mav * modifier,
            mrv: base.mrv * modifier
        };
    }
};


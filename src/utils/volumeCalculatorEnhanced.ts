'use server';

/**
 * Enhanced Volume Calculator
 * Progressive levels of sophistication for training volume recommendations.
 * 
 * Level 1: Naive Scaling (single coefficient based on experience)
 * Level 2: Dual-Coefficient (separate stimulus and recovery factors)
 * Level 3: Per-Muscle Adaptation (muscle-specific coefficients)
 * Level 4: Recovery-State Modulated MRV (full wellness integration)
 */

// Base Maximum Recoverable Volume (sets per week per muscle)
const BASE_MRV: Record<string, number> = {
    chest: 20,
    back: 20,
    shoulders: 16,
    biceps: 14,
    triceps: 14,
    quadriceps: 20,
    hamstrings: 16,
    glutes: 16,
    calves: 16,
    abs: 20,
    forearms: 14,
};

// Experience level multipliers
const EXPERIENCE_MULTIPLIERS = {
    beginner: 0.6,    // <1 year
    intermediate: 0.8, // 1-3 years
    advanced: 1.0,     // 3-5 years
    elite: 1.2,        // 5+ years
};

type ExperienceLevel = keyof typeof EXPERIENCE_MULTIPLIERS;

interface VolumeRecommendation {
    muscleGroup: string;
    mev: number;       // Minimum Effective Volume
    mrv: number;       // Maximum Recoverable Volume
    optimal: number;   // Sweet spot for growth
    current?: number;  // User's current volume
    status: 'LOW' | 'OPTIMAL' | 'HIGH' | 'OVER';
}

/**
 * LEVEL 1: Naive Scaling
 * Simple coefficient based on training experience.
 */
export function calculateVolumeL1(
    muscleGroup: string,
    experience: ExperienceLevel
): VolumeRecommendation {
    const baseMrv = BASE_MRV[muscleGroup.toLowerCase()] || 16;
    const multiplier = EXPERIENCE_MULTIPLIERS[experience];

    const mrv = Math.round(baseMrv * multiplier);
    const mev = Math.round(mrv * 0.4); // 40% of MRV
    const optimal = Math.round(mrv * 0.7); // 70% of MRV

    return {
        muscleGroup,
        mev,
        mrv,
        optimal,
        status: 'OPTIMAL',
    };
}

/**
 * LEVEL 2: Dual-Coefficient
 * Separate factors for stimulus (training quality) and recovery (lifestyle).
 */
export function calculateVolumeL2(
    muscleGroup: string,
    experience: ExperienceLevel,
    stimulusFactor: number, // 0.5-1.5 (training intensity/quality)
    recoveryFactor: number  // 0.5-1.5 (sleep, nutrition, stress)
): VolumeRecommendation {
    const baseMrv = BASE_MRV[muscleGroup.toLowerCase()] || 16;
    const expMultiplier = EXPERIENCE_MULTIPLIERS[experience];

    // Stimulus affects optimal volume ceiling
    // Recovery affects how much volume you can handle
    const stimulusAdjusted = baseMrv * expMultiplier * stimulusFactor;
    const mrv = Math.round(stimulusAdjusted * recoveryFactor);
    const mev = Math.round(mrv * 0.35);
    const optimal = Math.round(mrv * 0.65);

    return {
        muscleGroup,
        mev,
        mrv,
        optimal,
        status: 'OPTIMAL',
    };
}

/**
 * LEVEL 3: Per-Muscle Adaptation
 * Individual response rates per muscle group based on history.
 */
const DEFAULT_RESPONSE_RATES: Record<string, number> = {
    chest: 1.0,
    back: 1.0,
    shoulders: 1.0,
    biceps: 1.0,
    triceps: 1.0,
    quadriceps: 1.0,
    hamstrings: 1.0,
    glutes: 1.0,
    calves: 0.8, // Generally slower responders
    abs: 1.0,
    forearms: 0.8,
};

export function calculateVolumeL3(
    muscleGroup: string,
    experience: ExperienceLevel,
    stimulusFactor: number,
    recoveryFactor: number,
    personalResponseRate?: number // User's historical response (0.5-1.5)
): VolumeRecommendation {
    const baseMrv = BASE_MRV[muscleGroup.toLowerCase()] || 16;
    const expMultiplier = EXPERIENCE_MULTIPLIERS[experience];
    const responseRate = personalResponseRate || DEFAULT_RESPONSE_RATES[muscleGroup.toLowerCase()] || 1.0;

    // High responders need less volume, low responders need more
    const responseAdjusted = baseMrv * (2 - responseRate);
    const stimulusAdjusted = responseAdjusted * expMultiplier * stimulusFactor;
    const mrv = Math.round(stimulusAdjusted * recoveryFactor);
    const mev = Math.round(mrv * 0.3);
    const optimal = Math.round(mrv * 0.6);

    return {
        muscleGroup,
        mev,
        mrv,
        optimal,
        status: 'OPTIMAL',
    };
}

/**
 * Get volume status based on current vs optimal.
 */
export function getVolumeStatus(current: number, rec: VolumeRecommendation): VolumeRecommendation['status'] {
    if (current < rec.mev) return 'LOW';
    if (current > rec.mrv) return 'OVER';
    if (current >= rec.mev && current <= rec.optimal + 2) return 'OPTIMAL';
    return 'HIGH';
}

/**
 * Calculate all muscle groups for a user.
 */
export function calculateFullBodyVolume(
    experience: ExperienceLevel,
    stimulusFactor: number = 1.0,
    recoveryFactor: number = 1.0,
    level: 1 | 2 | 3 = 2
): VolumeRecommendation[] {
    const muscleGroups = Object.keys(BASE_MRV);

    return muscleGroups.map(muscle => {
        if (level === 1) {
            return calculateVolumeL1(muscle, experience);
        } else if (level === 2) {
            return calculateVolumeL2(muscle, experience, stimulusFactor, recoveryFactor);
        } else {
            return calculateVolumeL3(muscle, experience, stimulusFactor, recoveryFactor);
        }
    });
}

/**
 * Convert wellness data to recovery factor.
 */
export function wellnessToRecoveryFactor(
    sleepScore?: number,
    stressLevel?: number,
    nutritionScore?: number
): number {
    let factor = 1.0;

    if (sleepScore !== undefined) {
        // Scale: 0-100 → 0.7-1.2
        factor *= 0.7 + (sleepScore / 100) * 0.5;
    }

    if (stressLevel !== undefined) {
        // Scale: 0-10 (high stress) → 0.8-1.1
        factor *= 1.1 - (stressLevel / 10) * 0.3;
    }

    if (nutritionScore !== undefined) {
        // Scale: 0-100 → 0.9-1.1
        factor *= 0.9 + (nutritionScore / 100) * 0.2;
    }

    return Math.max(0.5, Math.min(1.5, factor));
}

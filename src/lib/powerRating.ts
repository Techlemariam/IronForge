import { TrainingPath } from "@/types/training";

interface PowerRatingComponents {
    strengthIndex: number;
    cardioIndex: number;
    powerRating: number;
}

/**
 * Limit value between min and max
 */
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

/**
 * Calculate Strength Rating via Hevy Data
 * Formula: (Wilks Score * 10) + (Weekly Volume / 1000)
 * Cap: 2000
 */
export const calculateStrengthRating = (
    wilksScore: number,
    weeklyVolumeKg: number
): number => {
    const wilksComponent = wilksScore * 10;
    const volumeComponent = weeklyVolumeKg / 1000;

    return clamp(wilksComponent + volumeComponent, 0, 2000);
};

/**
 * Calculate Cardio Rating via Intervals.icu Data
 * Formula: (FTP * 4) + (Weekly Duration Hours * 50)
 * Cap: 2000
 */
export const calculateCardioRating = (
    ftp: number,
    weeklyDurationHours: number
): number => {
    const ftpComponent = ftp * 4;
    const durationComponent = weeklyDurationHours * 50;

    return clamp(ftpComponent + durationComponent, 0, 2000);
};

/**
 * Calculate Consistency Bonus
 * Spec: +1% to Total PS for every consecutive week (max +10%)
 */
export const getConsistencyBonusMultiplier = (consecutiveWeeks: number): number => {
    // Cap at 10 weeks -> 1.10x
    const weeks = clamp(consecutiveWeeks, 0, 10);
    return 1.0 + (weeks * 0.01);
};

/**
 * Main Calculation Function
 * PS = (SR * 0.5) + (CR * 0.5) + Consistency Bonus
 */
export const calculatePowerRating = (
    wilks: number,
    weeklyVolumeKg: number,
    ftp: number,
    weeklyDurationHours: number,
    consecutiveWeeksTraining: number = 0
): PowerRatingComponents => {
    const strengthIndex = calculateStrengthRating(wilks, weeklyVolumeKg);
    const cardioIndex = calculateCardioRating(ftp, weeklyDurationHours);

    const baseScore = (strengthIndex * 0.5) + (cardioIndex * 0.5);
    const bonusMultiplier = getConsistencyBonusMultiplier(consecutiveWeeksTraining);

    const finalRating = Math.round(baseScore * bonusMultiplier);

    return {
        strengthIndex: Math.round(strengthIndex),
        cardioIndex: Math.round(cardioIndex),
        powerRating: Math.round(finalRating),
    };
};

/**
 * Apply decay to power rating based on inactivity
 * Decay: 5% per 7 days of inactivity (if > 7 days)
 */
export const applyDecay = (
    currentRating: number,
    daysSinceActivity: number
): number => {
    if (daysSinceActivity < 7) return currentRating;

    const weeksInactive = Math.floor(daysSinceActivity / 7);
    // 5% decay per week
    const decayMultiplier = Math.pow(0.95, weeksInactive);

    return Math.round(currentRating * decayMultiplier);
};

// Re-export TrainingPath for convenience
export type { TrainingPath };

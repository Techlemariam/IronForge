import { TrainingPath } from "@/types/training";

interface PowerRatingComponents {
    strengthIndex: number;
    cardioIndex: number;
    powerRating: number;
}

/**
 * Normalize Wilks Score (0-600) to Index (0-1000)
 * Floor: 200 (Beginner)
 * Ceiling: 600 (Elite)
 */
export const normalizeStrength = (wilks: number): number => {
    const floor = 200;
    const ceiling = 600;
    // Ensure we don't go below 0 or above 1000
    return Math.min(1000, Math.max(0, ((wilks - floor) / (ceiling - floor)) * 1000));
};

/**
 * Normalize FTP W/kg (1.5-5.0) to Index (0-1000)
 * Floor: 1.5 W/kg (Untrained)
 * Ceiling: 5.0 W/kg (Elite)
 */
export const normalizeCardio = (wkg: number): number => {
    const floor = 1.5;
    const ceiling = 5.0;
    return Math.min(1000, Math.max(0, ((wkg - floor) / (ceiling - floor)) * 1000));
};

/**
 * Calculate Adherence Bonus based on path
 * Bonus range: 1.0 (no bonus) to 1.15 (+15%)
 */
export const getMrvAdherenceBonus = (
    mrvAdherence: number, // 0.0 - 1.0 (% of optimal volume hit)
    cardioAdherence: number, // 0.0 - 1.0 (% of target sessions)
    path: TrainingPath
): number => {
    const weights: Record<TrainingPath, { str: number; cardio: number }> = {
        JUGGERNAUT: { str: 0.8, cardio: 0.2 },
        PATHFINDER: { str: 0.2, cardio: 0.8 },
        WARDEN: { str: 0.5, cardio: 0.5 },
    };

    const w = weights[path] || weights.WARDEN;
    const adherenceScore = mrvAdherence * w.str + cardioAdherence * w.cardio;

    // Bonus: 1.0 to 1.15
    return 1.0 + (adherenceScore * 0.15);
};

/**
 * Main Calculation Function
 */
export const calculatePowerRating = (
    wilks: number,
    ftpWkg: number,
    path: TrainingPath,
    mrvAdherence: number = 0,
    cardioAdherence: number = 0
): PowerRatingComponents => {
    const strengthIndex = normalizeStrength(wilks);
    const cardioIndex = normalizeCardio(ftpWkg);

    const weights: Record<TrainingPath, { str: number; cardio: number }> = {
        JUGGERNAUT: { str: 0.7, cardio: 0.3 },
        PATHFINDER: { str: 0.3, cardio: 0.7 },
        WARDEN: { str: 0.5, cardio: 0.5 },
    };

    // Default to WARDEN if path is invalid
    const w = weights[path] || weights.WARDEN;

    const baseRating = (strengthIndex * w.str) + (cardioIndex * w.cardio);
    const adherenceBonus = getMrvAdherenceBonus(mrvAdherence, cardioAdherence, path);

    const finalRating = Math.round(baseRating * adherenceBonus);

    return {
        strengthIndex: Math.round(strengthIndex),
        cardioIndex: Math.round(cardioIndex),
        powerRating: Math.min(1000, finalRating), // Cap at 1000
    };
};

/**
 * Apply decay to power rating based on inactivity
 * Decay: 5% per 7 days of inactivity
 * @param currentRating Current power rating (0-1000)
 * @param daysSinceActivity Days since last recorded activity
 * @returns Decayed power rating
 */
export const applyDecay = (
    currentRating: number,
    daysSinceActivity: number
): number => {
    if (daysSinceActivity < 7) return currentRating;

    const weeksInactive = Math.floor(daysSinceActivity / 7);
    const decayMultiplier = Math.pow(0.95, weeksInactive);

    return Math.round(currentRating * decayMultiplier);
};

// Re-export TrainingPath for convenience
export type { TrainingPath };

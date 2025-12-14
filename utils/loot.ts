
import { calculateE1RM } from './math';
import { Rarity } from '../types';

/**
 * Determines the "Loot Rarity" of a completed set based on performance.
 * 
 * Rules:
 * - Legendary: New Global PR (>1% improvement over history).
 * - Epic: Session PR (Best e1rm today) OR High Intensity (RPE >= 9).
 * - Rare: Perfect Target Match (RPE within 0.5 of target) AND decent effort (RPE >= 7).
 * - Common: Everything else (Warmups, standard sets).
 * 
 * @param weight Logged weight
 * @param reps Logged reps
 * @param rpe Logged RPE
 * @param targetRpe Target RPE for the set
 * @param globalPr Highest e1rm ever recorded for this exercise
 * @param sessionPr Highest e1rm recorded in this session so far
 */
export const determineRarity = (
    weight: number,
    reps: number,
    rpe: number,
    targetRpe: number,
    globalPr: number,
    sessionPr: number
): Rarity => {
    const currentE1RM = calculateE1RM(weight, reps, rpe);

    // 1. LEGENDARY CHECK (Global PR)
    // Must beat previous global best by at least 1% to count as a "Tier Upgrade"
    // Also, must be a working set (RPE > 5) to prevent weird warmup math spikes (unlikely but safe)
    if (globalPr > 0 && currentE1RM >= globalPr * 1.01 && rpe >= 6) {
        return 'legendary';
    }

    // 2. EPIC CHECK (Session PR or High Intensity)
    // If we beat the best lift of the day, it's an Epic moment.
    // OR if we went to RPE 9+ (Grinder), that's Epic effort.
    if ((sessionPr > 0 && currentE1RM > sessionPr) || rpe >= 9) {
        return 'epic';
    }

    // 3. RARE CHECK (Precision / Target Match)
    // If the user hit the RPE target exactly (within 0.5 margin) and it was a working set.
    const rpeDelta = Math.abs(rpe - targetRpe);
    if (rpeDelta <= 0.5 && rpe >= 7) {
        return 'rare';
    }

    // 4. COMMON CHECK
    // Standard volume work or warmups.
    return 'common';
};

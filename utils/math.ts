
/**
 * Calculates Estimated 1 Rep Max using the Epley formula adapted for RPE (Reps In Reserve).
 * 
 * Logic:
 * A set of 5 reps @ RPE 8 implies the user had 2 reps left in the tank.
 * Therefore, the "Max Effort" reps would have been 7.
 * Formula: Weight * (1 + (Reps + (10 - RPE)) / 30)
 * 
 * @param weight Load in kg
 * @param reps Reps performed
 * @param rpe Rated Perceived Exertion (1-10)
 */
export const calculateE1RM = (weight: number, reps: number, rpe: number = 10): number => {
    // 1. Calculate Reps In Reserve (RIR)
    const rir = Math.max(0, 10 - rpe);
    
    // 2. Calculate Potential Rep Max (if went to failure)
    const potentialReps = reps + rir;
    
    // 3. Apply Epley Formula
    const e1rm = weight * (1 + potentialReps / 30);
    
    return Math.round(e1rm * 10) / 10; // Round to 1 decimal place
};

/**
 * AUTOREGULATORY PROGRESSIVE RESISTANCE (APRE) ENGINE
 * Calculates optimal load adjustments based on performance divergence.
 */

export interface ApreSuggestion {
  adjustment: number; // e.g., +2.5 or -5
  newWeight: number;
  reason: string;
  type: "INCREASE" | "DECREASE" | "KEEP";
}

export const calculateApre = (
  currentWeight: number,
  repsPerformed: number,
  rpe: number,
  targetRpe: number = 8,
): ApreSuggestion | null => {
  // 1. Calculate Estimated 1RM from this set
  // Epley Formula: w * (1 + r/30)
  // We adjust the RPE factor: Real Reps + Reps In Reserve (RIR)
  // RIR ~= 10 - RPE
  // RIR ~= 10 - RPE
  // const rir = 10 - rpe;
  // const projectedMaxReps = repsPerformed + rir;

  // 2. Logic: Compare RPE divergence
  // If RPE was > 1 point off target, suggest fix.
  const diff = targetRpe - rpe; // Positive = Too Easy, Negative = Too Hard

  if (Math.abs(diff) < 1) return null; // Accurate enough

  let adjustment = 0;
  let reason = "";
  let type: "INCREASE" | "DECREASE" | "KEEP" = "KEEP";

  // Simplistic Linear Adjustment based on RPE points
  // Typically 1 RPE point ~= 2-3% load change.
  const pctChange = diff * 0.025; // 2.5% per RPE point

  // Round to nearest 2.5kg (standard plates)
  adjustment = Math.round((currentWeight * pctChange) / 2.5) * 2.5;

  // Sanity caps
  if (adjustment > 10) adjustment = 10;
  if (adjustment < -10) adjustment = -10;

  if (adjustment === 0) return null;

  if (adjustment > 0) {
    reason = `RPE ${rpe} was too easy (Target ${targetRpe}).`;
    type = "INCREASE";
  } else {
    reason = `RPE ${rpe} was too high (Target ${targetRpe}).`;
    type = "DECREASE";
  }

  return {
    adjustment,
    newWeight: currentWeight + adjustment,
    reason,
    type,
  };
};

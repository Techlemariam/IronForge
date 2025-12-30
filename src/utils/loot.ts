import { Rarity } from "../types/ironforge";

/**
 * Determines the rarity of a completed set based on performance.
 * A Personal Record (PR) automatically elevates the rarity.
 */
export const determineRarity = (
  e1rm: number,
  sessionPr: number,
  isPr: boolean,
): Rarity => {
  // If it's a new Personal Record, it's at least Rare.
  if (isPr) {
    // If it's a significant jump, it can be even rarer.
    if (e1rm > sessionPr * 1.1) return "legendary";
    if (e1rm > sessionPr * 1.05) return "epic";
    return "rare";
  }

  // If not a PR, rarity is based on how close it is to the session's best.
  const performanceRatio = e1rm / sessionPr;
  if (performanceRatio >= 0.98) return "uncommon"; // Very close to PR
  if (performanceRatio >= 0.95) return "common"; // Good, solid effort

  return "poor"; // Below 95% of session PR
};

export interface CombatStats {
  damage: number;
  isCritical: boolean;
  type: "standard" | "critical" | "special";
  description: string;
}

/**
 * Calculates damage dealt to the "Boss" based on weight and reps.
 * Base Damage = Weight * Reps
 *
 * @param weight - Weight in kg
 * @param reps - Repetitions performed
 * @param rpe - Rate of Perceived Exertion (1-10)
 * @param isPr - Whether this set was a Personal Record
 */
export const calculateDamage = (
  weight: number,
  reps: number,
  rpe: number,
  isPr: boolean,
): CombatStats => {
  // Base damage is total volume
  let damage = weight * reps;

  // Bodyweight exercises fallback (assuming ~70kg generic resistance if weight is 0)
  if (weight === 0) {
    damage = 70 * reps;
  }

  let isCritical = false;
  let type: CombatStats["type"] = "standard";
  let description = "Standard Attack";

  // RPE Multipliers (Intensity Bonus)
  if (rpe >= 9 && rpe < 10) {
    damage *= 1.2; // 20% bonus for high intensity
    description = "Heavy Strike";
  } else if (rpe === 10) {
    damage *= 1.5; // 50% bonus for maximum effort
    isCritical = true;
    type = "critical";
    description = "Limit Break";
  }

  // PR Bonus
  if (isPr) {
    damage *= 2.0; // Double damage for PRs!
    isCritical = true;
    type = "critical";
    description = "Legendary Strike";
  }

  return {
    damage: Math.round(damage),
    isCritical,
    type,
    description,
  };
};

/**
 * Detects if a "Special Move" was triggered based on set parameters.
 */
export const detectSpecialMove = (
  reps: number,
  isDropSet: boolean,
  isAmrap: boolean,
): string | null => {
  if (isDropSet) return "Berserker Rage";
  if (isAmrap && reps > 10) return "Flurry of Blows";
  if (reps >= 20) return "Endurance Assault";
  return null;
};

/**
 * Detects if the player is finding the weight too easy, offering a "Joker Set".
 * Trigger: Last set was RPE < 7 and not a warmup (weight reasonable).
 */
export const detectJokerOpportunity = (
  rpe: number,
  setIndex: number,
  totalSets: number,
): boolean => {
  // Only offer on final sets or heavy sets that felt too light
  // Currently simple logic: if it felt easy (RPE < 7) on a working set
  if (rpe > 0 && rpe < 7 && setIndex >= 1) {
    return true;
  }
  return false;
};

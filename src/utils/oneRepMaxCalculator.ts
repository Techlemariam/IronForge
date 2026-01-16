/**
 * 1RM (One Rep Max) Calculator Utilities
 * Multiple formulas for estimating max strength from submaximal lifts.
 */

type Formula =
  | "EPLEY"
  | "BRZYCKI"
  | "LANDER"
  | "LOMBARDI"
  | "MAYHEW"
  | "OCONNER"
  | "WATHAN";



interface MultiFormulaResult {
  average: number;
  min: number;
  max: number;
  byFormula: Record<Formula, number>;
}

/**
 * Calculate e1RM using Epley formula (most common).
 */
export function calculateE1rmEpley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate e1RM using Brzycki formula.
 */
export function calculateE1rmBrzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || reps > 12) return 0;
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Calculate e1RM using Lander formula.
 */
export function calculateE1rmLander(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round((100 * weight) / (101.3 - 2.67123 * reps));
}

/**
 * Calculate e1RM using Lombardi formula.
 */
export function calculateE1rmLombardi(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round(weight * Math.pow(reps, 0.1));
}

/**
 * Calculate e1RM using Mayhew formula.
 */
export function calculateE1rmMayhew(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round((100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps)));
}

/**
 * Calculate e1RM using O'Conner formula.
 */
export function calculateE1rmOConner(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 40));
}

/**
 * Calculate e1RM using Wathan formula.
 */
export function calculateE1rmWathan(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round((100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps)));
}

/**
 * Calculate e1RM using specified formula.
 */
export function calculateE1rm(
  weight: number,
  reps: number,
  formula: Formula = "EPLEY",
): number {
  switch (formula) {
    case "EPLEY":
      return calculateE1rmEpley(weight, reps);
    case "BRZYCKI":
      return calculateE1rmBrzycki(weight, reps);
    case "LANDER":
      return calculateE1rmLander(weight, reps);
    case "LOMBARDI":
      return calculateE1rmLombardi(weight, reps);
    case "MAYHEW":
      return calculateE1rmMayhew(weight, reps);
    case "OCONNER":
      return calculateE1rmOConner(weight, reps);
    case "WATHAN":
      return calculateE1rmWathan(weight, reps);
    default:
      return calculateE1rmEpley(weight, reps);
  }
}

/**
 * Calculate e1RM using all formulas and return aggregated result.
 */
export function calculateE1rmAllFormulas(
  weight: number,
  reps: number,
): MultiFormulaResult {
  const formulas: Formula[] = [
    "EPLEY",
    "BRZYCKI",
    "LANDER",
    "LOMBARDI",
    "MAYHEW",
    "OCONNER",
    "WATHAN",
  ];

  const results: Record<Formula, number> = {} as Record<Formula, number>;
  for (const formula of formulas) {
    results[formula] = calculateE1rm(weight, reps, formula);
  }

  const values = Object.values(results).filter((v) => v > 0);

  return {
    average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
    byFormula: results,
  };
}

/**
 * Calculate weight for target reps at given percentage of 1RM.
 */
export function calculateWeightForReps(
  e1rm: number,
  targetReps: number,
): number {
  // Inverse of Epley: weight = e1rm / (1 + reps/30)
  return Math.round(e1rm / (1 + targetReps / 30));
}

/**
 * Generate rep/weight table from 1RM.
 */
export function generateRepTable(
  e1rm: number,
): Array<{ reps: number; weight: number; percentage: number }> {
  const reps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
  return reps.map((r) => ({
    reps: r,
    weight: calculateWeightForReps(e1rm, r),
    percentage: Math.round((calculateWeightForReps(e1rm, r) / e1rm) * 100),
  }));
}

/**
 * Calculate relative strength (1RM / bodyweight).
 */
export function calculateRelativeStrength(
  e1rm: number,
  bodyweight: number,
): number {
  if (bodyweight <= 0) return 0;
  return Math.round((e1rm / bodyweight) * 100) / 100;
}

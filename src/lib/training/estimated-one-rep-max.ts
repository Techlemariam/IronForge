const DEFAULT_MAX_REPS = 30;

export interface RepGoalOptions {
  maxReps?: number;
}

/**
 * Estimates one-repetition maximum using the Epley formula.
 *
 * A single repetition is treated as the performed weight rather than applying
 * the formula, which keeps tested singles stable.
 */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  assertPositiveFinite(weightKg, "weightKg");
  assertPositiveInteger(reps, "reps");

  if (reps === 1) {
    return weightKg;
  }

  return weightKg * (1 + reps / 30);
}

/**
 * Returns the minimum reps at a given weight required to strictly exceed an
 * existing estimated 1RM. Returns null when the goal exceeds the configured
 * safety/display limit.
 */
export function repsRequiredForEstimatedOneRepMaxPr(
  weightKg: number,
  currentBestEstimatedOneRepMaxKg: number,
  options: RepGoalOptions = {},
): number | null {
  assertPositiveFinite(weightKg, "weightKg");
  assertPositiveFinite(
    currentBestEstimatedOneRepMaxKg,
    "currentBestEstimatedOneRepMaxKg",
  );

  const maxReps = options.maxReps ?? DEFAULT_MAX_REPS;
  assertPositiveInteger(maxReps, "maxReps");

  for (let reps = 1; reps <= maxReps; reps += 1) {
    if (estimateOneRepMax(weightKg, reps) > currentBestEstimatedOneRepMaxKg) {
      return reps;
    }
  }

  return null;
}

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

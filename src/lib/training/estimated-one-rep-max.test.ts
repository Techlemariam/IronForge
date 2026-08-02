import { describe, expect, it } from "vitest";

import {
  estimateOneRepMax,
  repsRequiredForEstimatedOneRepMaxPr,
} from "./estimated-one-rep-max";

describe("estimateOneRepMax", () => {
  it("keeps a tested single equal to the performed weight", () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it("uses the Epley formula for multi-rep sets", () => {
    expect(estimateOneRepMax(70, 12)).toBeCloseTo(98, 5);
  });

  it.each([
    [0, 5],
    [-10, 5],
    [Number.NaN, 5],
    [70, 0],
    [70, 2.5],
  ])("rejects invalid input: %s kg x %s", (weightKg, reps) => {
    expect(() => estimateOneRepMax(weightKg, reps)).toThrow(RangeError);
  });
});

describe("repsRequiredForEstimatedOneRepMaxPr", () => {
  it("returns the first rep count that strictly beats the existing best", () => {
    expect(repsRequiredForEstimatedOneRepMaxPr(70, 101)).toBe(14);
  });

  it("returns one rep when the selected weight already exceeds the best", () => {
    expect(repsRequiredForEstimatedOneRepMaxPr(105, 100)).toBe(1);
  });

  it("does not count an equal estimate as a new record", () => {
    expect(repsRequiredForEstimatedOneRepMaxPr(90, 99)).toBe(4);
  });

  it("returns null when the goal exceeds the display limit", () => {
    expect(
      repsRequiredForEstimatedOneRepMaxPr(40, 100, { maxReps: 20 }),
    ).toBeNull();
  });

  it("rejects an invalid max-rep limit", () => {
    expect(() =>
      repsRequiredForEstimatedOneRepMaxPr(70, 100, { maxReps: 0 }),
    ).toThrow(RangeError);
  });
});

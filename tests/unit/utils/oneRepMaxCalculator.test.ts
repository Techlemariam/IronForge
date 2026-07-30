import {
  calculateE1rm,
  calculateE1rmAllFormulas,
  calculateE1rmBrzycki,
  calculateE1rmEpley,
  calculateE1rmLander,
  calculateRelativeStrength,
  calculateRequiredRepsForE1rm,
  calculateWeightForReps,
  generateRepTable,
} from '@/utils/oneRepMaxCalculator';
import { describe, expect, it } from 'vitest';

describe('oneRepMaxCalculator', () => {
  describe('calculateE1rmEpley', () => {
    it('should return weight for 1 rep', () => {
      expect(calculateE1rmEpley(100, 1)).toBe(100);
    });

    it('should return 0 for invalid weight or reps', () => {
      expect(calculateE1rmEpley(100, 0)).toBe(0);
      expect(calculateE1rmEpley(100, -1)).toBe(0);
      expect(calculateE1rmEpley(0, 10)).toBe(0);
    });

    it('should correctly calculate 1RM', () => {
      expect(calculateE1rmEpley(100, 10)).toBe(133);
    });
  });

  describe('calculateRequiredRepsForE1rm', () => {
    it('returns the minimum reps needed to match a target', () => {
      expect(calculateRequiredRepsForE1rm(70, 98)).toBe(12);
      expect(calculateE1rmEpley(70, 11)).toBeLessThan(98);
      expect(calculateE1rmEpley(70, 12)).toBeGreaterThanOrEqual(98);
    });

    it('returns one rep when load already matches the target', () => {
      expect(calculateRequiredRepsForE1rm(100, 100)).toBe(1);
      expect(calculateRequiredRepsForE1rm(105, 100)).toBe(1);
    });

    it('returns undefined for invalid or unreasonable goals', () => {
      expect(calculateRequiredRepsForE1rm(0, 100)).toBeUndefined();
      expect(calculateRequiredRepsForE1rm(50, 150, 20)).toBeUndefined();
    });
  });

  describe('calculateE1rmBrzycki', () => {
    it('should return weight for 1 rep', () => {
      expect(calculateE1rmBrzycki(100, 1)).toBe(100);
    });

    it('should return 0 for reps > 12', () => {
      expect(calculateE1rmBrzycki(100, 13)).toBe(0);
    });

    it('should correctly calculate 1RM', () => {
      expect(calculateE1rmBrzycki(100, 10)).toBe(133);
    });
  });

  describe('calculateE1rm', () => {
    it('should use Epley by default', () => {
      expect(calculateE1rm(100, 10)).toBe(calculateE1rmEpley(100, 10));
    });

    it('should use specified formula', () => {
      expect(calculateE1rm(100, 10, 'BRZYCKI')).toBe(calculateE1rmBrzycki(100, 10));
      expect(calculateE1rm(100, 10, 'LANDER')).toBe(calculateE1rmLander(100, 10));
    });
  });

  describe('calculateE1rmAllFormulas', () => {
    it('should return results for all formulas', () => {
      const result = calculateE1rmAllFormulas(100, 5);
      expect(result.byFormula.EPLEY).toBeDefined();
      expect(result.byFormula.BRZYCKI).toBeDefined();
      expect(result.average).toBeGreaterThan(100);
      expect(result.min).toBeLessThanOrEqual(result.average);
      expect(result.max).toBeGreaterThanOrEqual(result.average);
    });

    it('should filter out non-positive values from average calculation', () => {
      const result = calculateE1rmAllFormulas(100, 15);
      expect(result.byFormula.BRZYCKI).toBe(0);
      const values = Object.values(result.byFormula).filter((v) => v > 0);
      expect(result.min).toBe(Math.min(...values));
    });
  });

  describe('calculateWeightForReps', () => {
    it('should return 1RM for 0 target reps', () => {
      expect(calculateWeightForReps(100, 0)).toBe(100);
    });

    it('should correctly calculate weight for target reps', () => {
      expect(calculateWeightForReps(133, 10)).toBe(100);
    });

    it('should handle high rep counts', () => {
      expect(calculateWeightForReps(100, 30)).toBe(50);
    });

    it('should round to the nearest whole number', () => {
      expect(calculateWeightForReps(100, 5)).toBe(86);
    });
  });

  describe('generateRepTable', () => {
    it('should generate a table with 10 entries', () => {
      const table = generateRepTable(100);
      expect(table).toHaveLength(10);
      expect(table[0]).toEqual({ reps: 1, weight: 97, percentage: 97 });
    });

    it('should have decreasing weight as reps increase', () => {
      const table = generateRepTable(100);
      for (let i = 1; i < table.length; i++) {
        expect(table[i].weight).toBeLessThanOrEqual(table[i - 1].weight);
      }
    });
  });

  describe('calculateRelativeStrength', () => {
    it('should calculate 1RM / bodyweight', () => {
      expect(calculateRelativeStrength(100, 50)).toBe(2);
      expect(calculateRelativeStrength(150, 100)).toBe(1.5);
    });

    it('should return 0 for bodyweight <= 0', () => {
      expect(calculateRelativeStrength(100, 0)).toBe(0);
      expect(calculateRelativeStrength(100, -10)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateRelativeStrength(100, 75)).toBe(1.33);
    });
  });
});

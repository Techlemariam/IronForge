import { describe, it, expect } from 'vitest';
import {
  calculateE1rmEpley,
  calculateE1rmBrzycki,
  calculateE1rmLander,
  calculateE1rm,
  calculateE1rmAllFormulas,
  calculateWeightForReps,
  generateRepTable,
  calculateRelativeStrength,
} from '@/utils/oneRepMaxCalculator';

describe('oneRepMaxCalculator', () => {
  describe('calculateE1rmEpley', () => {
    it('should return weight for 1 rep', () => {
      expect(calculateE1rmEpley(100, 1)).toBe(100);
    });

    it('should return 0 for 0 or negative reps', () => {
      expect(calculateE1rmEpley(100, 0)).toBe(0);
      expect(calculateE1rmEpley(100, -1)).toBe(0);
    });

    it('should correctly calculate 1RM', () => {
      // 100 * (1 + 10/30) = 100 * 1.3333 = 133.33 -> 133
      expect(calculateE1rmEpley(100, 10)).toBe(133);
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
      // 100 * (36 / (37 - 10)) = 100 * (36 / 27) = 100 * 1.3333 = 133.33 -> 133
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
      // Brzycki returns 0 for reps > 12
      const result = calculateE1rmAllFormulas(100, 15);
      expect(result.byFormula.BRZYCKI).toBe(0);
      // Min should be the smallest non-zero value
      const values = Object.values(result.byFormula).filter(v => v > 0);
      expect(result.min).toBe(Math.min(...values));
    });

    it('should return 0 for average, min, and max when all formulas return 0', () => {
      // reps = 0 makes most formulas return 0
      const result = calculateE1rmAllFormulas(100, 0);
      expect(result.average).toBe(0);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      Object.values(result.byFormula).forEach(val => {
        expect(val).toBe(0);
      });
    });
  });

  describe('calculateWeightForReps', () => {
    it('should return 1RM for 0 target reps (inverse logic check)', () => {
        // e1rm / (1 + 0/30) = e1rm / 1 = e1rm
        expect(calculateWeightForReps(100, 0)).toBe(100);
    });

    it('should correctly calculate weight for target reps', () => {
      // 133 / (1 + 10/30) = 133 / 1.3333 = 99.75 -> 100
      expect(calculateWeightForReps(133, 10)).toBe(100);
    });

    it('should handle high rep counts', () => {
      // 100 / (1 + 30/30) = 100 / 2 = 50
      expect(calculateWeightForReps(100, 30)).toBe(50);
    });

    it('should round to the nearest whole number', () => {
        // 100 / (1 + 5/30) = 100 / 1.1666 = 85.71 -> 86
        expect(calculateWeightForReps(100, 5)).toBe(86);
    });
  });

  describe('generateRepTable', () => {
    it('should generate a table with 10 entries', () => {
      const table = generateRepTable(100);
      expect(table).toHaveLength(10);
      expect(table[0]).toEqual({ reps: 1, weight: 97, percentage: 97 });
      // Wait, let's check reps[0] = 1.
      // 100 / (1 + 1/30) = 100 / (31/30) = 3000 / 31 = 96.77 -> 97
      // percentage = Math.round((97 / 100) * 100) = 97
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
      // 100 / 75 = 1.3333 -> 1.33
      expect(calculateRelativeStrength(100, 75)).toBe(1.33);
    });
  });
});

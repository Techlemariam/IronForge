import { describe, it, expect } from 'vitest';
import { calculatePlates } from '@/utils/root_utils';

describe('root_utils', () => {
  describe('calculatePlates', () => {
    it('calculates standard barbell (100kg total, 20kg bar)', () => {
      // 100 - 20 = 80kg total plates -> 40kg per side
      // 40 = 25 + 15
      expect(calculatePlates(100)).toEqual([25, 15]);
    });

    it('returns empty array when target weight equals bar weight', () => {
      // 20 - 20 = 0 -> 0 per side
      expect(calculatePlates(20)).toEqual([]);
    });

    it('returns empty array when target weight is less than bar weight', () => {
      // Math.max(0, 10 - 20) = 0 -> 0 per side
      expect(calculatePlates(10)).toEqual([]);
    });

    it('calculates single loaded plates (100kg total, 0kg bar)', () => {
      // 100 - 0 = 100kg total -> 100
      // 100 = 25 + 25 + 25 + 25
      expect(calculatePlates(100, 0, true)).toEqual([25, 25, 25, 25]);
    });

    it('calculates different bar weight (60kg total, 15kg bar)', () => {
      // 60 - 15 = 45kg total plates -> 22.5kg per side
      // 22.5 = 20 + 2.5
      expect(calculatePlates(60, 15)).toEqual([20, 2.5]);
    });

    it('handles non-exact matching weights by rounding down to nearest available plates', () => {
      // 101 - 20 = 81kg total plates -> 40.5kg per side
      // 40.5 -> 25 + 15 (40)
      expect(calculatePlates(101)).toEqual([25, 15]);
    });

    it('handles complex plate combinations', () => {
      // 187.5 - 20 = 167.5kg -> 83.75kg per side
      // 83.75 -> 25 + 25 + 25 + 5 + 2.5 + 1.25
      expect(calculatePlates(187.5)).toEqual([25, 25, 25, 5, 2.5, 1.25]);
    });

    it('handles single loaded non-exact weights', () => {
      // 53.5 - 0 = 53.5kg total
      // 53.5 -> 25 + 25 + 2.5 (52.5)
      expect(calculatePlates(53.5, 0, true)).toEqual([25, 25, 2.5]);
    });
  });
});

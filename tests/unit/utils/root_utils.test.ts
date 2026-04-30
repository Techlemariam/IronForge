import { calculatePlates } from '@/utils/root_utils';
import { describe, expect, it } from 'vitest';

describe('root_utils', () => {
  describe('calculatePlates', () => {
    it('calculates standard barbell loading', () => {
      expect(calculatePlates(100)).toEqual([25, 15]);
    });

    it('returns empty array when target weight equals bar weight', () => {
      expect(calculatePlates(20)).toEqual([]);
    });

    it('returns empty array when target weight is less than bar weight', () => {
      expect(calculatePlates(10)).toEqual([]);
    });

    it('calculates single-loaded plates', () => {
      expect(calculatePlates(100, 0, true)).toEqual([25, 25, 25, 25]);
    });

    it('calculates different bar weight', () => {
      expect(calculatePlates(60, 15)).toEqual([20, 2.5]);
    });

    it('rounds down to nearest available plates for non-exact weights', () => {
      expect(calculatePlates(101)).toEqual([25, 15]);
    });

    it('handles complex plate combinations', () => {
      expect(calculatePlates(187.5)).toEqual([25, 25, 25, 5, 2.5, 1.25]);
    });

    it('handles single-loaded non-exact weights', () => {
      expect(calculatePlates(53.5, 0, true)).toEqual([25, 25, 2.5]);
    });
  });
});

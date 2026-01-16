import { describe, it, expect } from 'vitest';
import { calculateApre } from '@/utils/apre';

describe('APRE (Auto-Regulated Progressive Resistance)', () => {
    describe('calculateApre', () => {
        it('should suggest weight increase when RPE is too low', () => {
            // Performed 5 reps at 100kg with RPE 6 (target 8)
            const result = calculateApre(100, 5, 6, 8);

            expect(result).not.toBeNull();
            expect(result?.type).toBe('INCREASE');
            expect(result?.adjustment).toBeGreaterThan(0);
            expect(result?.newWeight).toBeGreaterThan(100);
            expect(result?.reason).toContain('too easy');
        });

        it('should suggest weight decrease when RPE is too high', () => {
            // Performed 5 reps at 100kg with RPE 9.5 (target 8)
            const result = calculateApre(100, 5, 9.5, 8);

            expect(result).not.toBeNull();
            expect(result?.type).toBe('DECREASE');
            expect(result?.adjustment).toBeLessThan(0);
            expect(result?.newWeight).toBeLessThan(100);
            expect(result?.reason).toContain('too high');
        });

        it('should return null when RPE is within 1 point of target', () => {
            // RPE 8.5 with target 8 is acceptable
            const result = calculateApre(100, 5, 8.5, 8);
            expect(result).toBeNull();
        });

        it('should return null when RPE exactly matches target', () => {
            const result = calculateApre(100, 5, 8, 8);
            expect(result).toBeNull();
        });

        it('should cap adjustments at ±10kg', () => {
            // Extreme RPE difference (2 vs 8)
            const result = calculateApre(100, 5, 2, 8);

            expect(result).not.toBeNull();
            expect(Math.abs(result!.adjustment)).toBeLessThanOrEqual(10);
        });

        it('should round adjustments to nearest 2.5kg', () => {
            const result = calculateApre(100, 5, 6, 8);

            if (result) {
                // Adjustment should be multiple of 2.5
                expect(result.adjustment % 2.5).toBe(0);
            }
        });

        it('should calculate reasonable adjustments for typical scenarios', () => {
            // RPE 6 (target 8) = 2 points too easy
            // Expected: ~5% increase = 5kg
            const result = calculateApre(100, 5, 6, 8);

            expect(result).not.toBeNull();
            expect(result?.adjustment).toBeGreaterThanOrEqual(2.5);
            expect(result?.adjustment).toBeLessThanOrEqual(7.5);
        });

        it('should use default target RPE of 8 when not specified', () => {
            const result = calculateApre(100, 5, 6);

            expect(result).not.toBeNull();
            expect(result?.type).toBe('INCREASE');
        });

        it('should handle edge case of 0 adjustment', () => {
            // Very small RPE difference that rounds to 0
            const result = calculateApre(50, 5, 7.9, 8);

            // Should return null if adjustment rounds to 0
            if (result?.adjustment === 0) {
                expect(result).toBeNull();
            }
        });
    });

    describe('APRE Integration Scenarios', () => {
        it('should handle progressive overload scenario', () => {
            // Week 1: 100kg felt easy (RPE 6)
            const week1 = calculateApre(100, 5, 6, 8);
            expect(week1?.newWeight).toBeGreaterThan(100);

            // Week 2: Use suggested weight
            const newWeight = week1!.newWeight;
            const week2 = calculateApre(newWeight, 5, 8, 8);
            expect(week2).toBeNull(); // Perfect RPE, no change needed
        });

        it('should handle deload scenario', () => {
            // Athlete pushed too hard (RPE 9.5)
            const result = calculateApre(100, 5, 9.5, 8);
            expect(result?.type).toBe('DECREASE');
            expect(result?.newWeight).toBeLessThan(100);
        });
    });
});

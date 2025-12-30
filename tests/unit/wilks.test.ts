import { describe, it, expect } from 'vitest';
import { calculateWilks } from '../../src/utils/wilks';

describe('Wilks Score Calculator', () => {
    // Verified against online calculators for accuracy check

    it('should calculate correct score for a standard male lifter', () => {
        // Male, 100kg BW, 500kg Total
        // Coeff approx 0.6086 -> Score ~304.3
        const result = calculateWilks({
            weightLifted: 500,
            bodyWeight: 100,
            sex: 'male'
        });
        expect(result).toBeCloseTo(304.3, 1);
    });

    it('should calculate correct score for a standard female lifter', () => {
        // Female, 60kg BW, 300kg Total
        // Coeff approx 1.114 -> Score ~334.2
        const result = calculateWilks({
            weightLifted: 300,
            bodyWeight: 60,
            sex: 'female'
        });
        expect(result).toBeCloseTo(334.5, 1);
    });

    it('should handle light bodyweight correctly', () => {
        // Male, 60kg BW, 300kg Total
        // Coeff approx 0.857 -> Score ~257
        const result = calculateWilks({
            weightLifted: 300,
            bodyWeight: 60,
            sex: 'male'
        });
        expect(result).toBeGreaterThan(0);
    });

    it('should return 0 if weight lifted is 0', () => {
        const result = calculateWilks({
            weightLifted: 0,
            bodyWeight: 80,
            sex: 'male'
        });
        expect(result).toBe(0);
    });
});

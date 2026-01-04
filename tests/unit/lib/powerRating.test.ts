import { describe, it, expect } from 'vitest';
import { calculatePowerRating, normalizeStrength, normalizeCardio, applyDecay, TrainingPath } from '@/lib/powerRating';

describe('Power Rating Logic', () => {

    describe('Normalization', () => {
        it('normalizes Wilks score correctly', () => {
            expect(normalizeStrength(200)).toBe(0); // Floor
            expect(normalizeStrength(600)).toBe(1000); // Ceiling
            expect(normalizeStrength(400)).toBe(500); // Midpoint
            expect(normalizeStrength(100)).toBe(0); // Below floor
            expect(normalizeStrength(700)).toBe(1000); // Above ceiling
        });

        it('normalizes Cardio (W/kg) correctly', () => {
            expect(normalizeCardio(1.5)).toBe(0);
            expect(normalizeCardio(5.0)).toBe(1000);
            expect(normalizeCardio(3.25)).toBe(500);
        });
    });

    describe('Adherence Bonus', () => {
        it('applies correct weights for WARDEN path', () => {
            // Warden: 50% Str, 50% Cardio
            // Adherence: 100% Str, 100% Cardio -> Bonus 1.15
            const result = calculatePowerRating(400, 3.25, 'WARDEN', 1.0, 1.0);
            // Base: (500 * 0.5) + (500 * 0.5) = 500
            // Bonus: 1.0 + (1.0 * 0.15) = 1.15
            // Final: 500 * 1.15 = 575
            expect(result.powerRating).toBe(575);
        });

        it('applies correct weights for JUGGERNAUT path', () => {
            // Juggernaut: 70% Str, 30% Cardio. Bonus weights: 80% Str, 20% Cardio

            const result = calculatePowerRating(400, 3.25, 'JUGGERNAUT', 1.0, 1.0);
            // Base: (500 * 0.7) + (500 * 0.3) = 350 + 150 = 500
            // Adherence Score: (1.0 * 0.8) + (1.0 * 0.2) = 1.0
            // Bonus: 1.0 + (1.0 * 0.15) = 1.15
            // Final: 500 * 1.15 = 575
            expect(result.powerRating).toBe(575);
        });

        it('penalizes low adherence', () => {
            const result = calculatePowerRating(400, 3.25, 'WARDEN', 0.0, 0.0);
            // Base: 500
            // Adherence Score: 0 -> Bonus: 1.0
            // Final: 500
            expect(result.powerRating).toBe(500);
        });
    });

    describe('Decay', () => {
        it('applies no decay for < 7 days', () => {
            expect(applyDecay(500, 6)).toBe(500);
        });

        it('applies 5% decay for 7 days (1 week)', () => {
            // 500 * 0.95 = 475
            expect(applyDecay(500, 7)).toBe(475);
        });

        it('applies compounded decay for 15 days (2 weeks)', () => {
            // 2 weeks
            // 500 * 0.95 * 0.95 = 451.25 -> 451
            expect(applyDecay(500, 15)).toBe(451);
        });
    });
});

import { describe, it, expect } from 'vitest';
import { calculateDamage, detectSpecialMove, detectJokerOpportunity } from '@/utils/combatMechanics';

describe('Combat Mechanics', () => {
    describe('calculateDamage', () => {
        it('should calculate base damage from weight and reps', () => {
            const result = calculateDamage(100, 5, 7, false);
            expect(result.damage).toBe(500); // 100kg * 5 reps
            expect(result.type).toBe('standard');
            expect(result.isCritical).toBe(false);
        });

        it('should apply 20% bonus for RPE 9', () => {
            const result = calculateDamage(100, 5, 9, false);
            expect(result.damage).toBe(600); // 500 * 1.2
            expect(result.description).toBe('Heavy Strike');
        });

        it('should apply 50% bonus for RPE 10 (critical)', () => {
            const result = calculateDamage(100, 5, 10, false);
            expect(result.damage).toBe(750); // 500 * 1.5
            expect(result.type).toBe('critical');
            expect(result.isCritical).toBe(true);
            expect(result.description).toBe('Limit Break');
        });

        it('should double damage for Personal Records', () => {
            const result = calculateDamage(100, 5, 7, true);
            expect(result.damage).toBe(1000); // 500 * 2.0
            expect(result.type).toBe('critical');
            expect(result.isCritical).toBe(true);
            expect(result.description).toBe('Legendary Strike');
        });

        it('should handle bodyweight exercises (weight = 0)', () => {
            const result = calculateDamage(0, 10, 7, false);
            expect(result.damage).toBe(700); // 70kg * 10 reps
        });

        it('should stack PR bonus with RPE bonus multiplicatively', () => {
            // RPE 10 (1.5x) + PR (2x) = 1.5 * 2 = 3x total
            const result = calculateDamage(100, 5, 10, true);
            expect(result.damage).toBe(1500); // Base 500 * 1.5 (RPE) * 2.0 (PR)
            expect(result.isCritical).toBe(true);
        });
    });

    describe('detectSpecialMove', () => {
        it('should detect Berserker Rage for drop sets', () => {
            const move = detectSpecialMove(8, true, false);
            expect(move).toBe('Berserker Rage');
        });

        it('should detect Flurry of Blows for AMRAP > 10 reps', () => {
            const move = detectSpecialMove(12, false, true);
            expect(move).toBe('Flurry of Blows');
        });

        it('should detect Endurance Assault for 20+ reps', () => {
            const move = detectSpecialMove(20, false, false);
            expect(move).toBe('Endurance Assault');
        });

        it('should return null for standard sets', () => {
            const move = detectSpecialMove(8, false, false);
            expect(move).toBeNull();
        });
    });

    describe('detectJokerOpportunity', () => {
        it('should suggest joker set when RPE < 7 on working sets', () => {
            const shouldOffer = detectJokerOpportunity(6, 2, 3);
            expect(shouldOffer).toBe(true);
        });

        it('should not suggest on first set', () => {
            const shouldOffer = detectJokerOpportunity(6, 0, 3);
            expect(shouldOffer).toBe(false);
        });

        it('should not suggest when RPE >= 7', () => {
            const shouldOffer = detectJokerOpportunity(8, 2, 3);
            expect(shouldOffer).toBe(false);
        });

        it('should not suggest when RPE is 0 (not recorded)', () => {
            const shouldOffer = detectJokerOpportunity(0, 2, 3);
            expect(shouldOffer).toBe(false);
        });
    });
});

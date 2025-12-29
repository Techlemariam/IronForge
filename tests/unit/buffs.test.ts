import { describe, it, expect } from 'vitest';
import { getBuffForZone, ZONE_BUFFS } from '../../src/features/training/logic/buffs';

describe('Cardio Buffs Logic', () => {
    describe('getBuffForZone', () => {
        it('should return the correct buff for Zone 1', () => {
            const buff = getBuffForZone(1);
            expect(buff.id).toBe('restoration');
            expect(buff.zone).toBe(1);
        });

        it('should return the correct buff for Zone 3 (Rhythm)', () => {
            const buff = getBuffForZone(3);
            expect(buff.id).toBe('rhythm');
            expect(buff.effects.goldMultiplier).toBeGreaterThan(1.0);
        });

        it('should return the correct buff for Zone 5 (Titan Fury)', () => {
            const buff = getBuffForZone(5);
            expect(buff.id).toBe('titan_fury');
            expect(buff.effects.xpMultiplier).toBe(2.0);
        });

        it('should return Zone 1 buff as fallback for invalid low zone', () => {
            const buff = getBuffForZone(0);
            expect(buff.id).toBe('restoration');
        });

        it('should return Zone 1 buff as fallback for invalid high zone', () => {
            const buff = getBuffForZone(6);
            expect(buff.id).toBe('restoration'); // Assuming default fallback is Zone 1
        });
    });

    describe('ZONE_BUFFS Integrity', () => {
        it('should have buffs defined for zones 1 through 5', () => {
            expect(ZONE_BUFFS[1]).toBeDefined();
            expect(ZONE_BUFFS[2]).toBeDefined();
            expect(ZONE_BUFFS[3]).toBeDefined();
            expect(ZONE_BUFFS[4]).toBeDefined();
            expect(ZONE_BUFFS[5]).toBeDefined();
        });

        it('should have consistent structure', () => {
            Object.values(ZONE_BUFFS).forEach(buff => {
                expect(buff).toHaveProperty('id');
                expect(buff).toHaveProperty('effects');
                expect(buff.effects).toHaveProperty('xpMultiplier');
            });
        });
    });
});

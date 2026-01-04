import { describe, it, expect } from 'vitest';
import { calculatePowerZone, calculatePaceZone } from '@/features/training/logic/zones';

describe('Cardio Zones Logic', () => {
    describe('calculatePowerZone', () => {
        // Standard FTP for testing: 200W
        const FTP = 200;

        it('should return Zone 1 for very low power (< 68%)', () => {
            // 100W is 50%
            expect(calculatePowerZone(100, FTP)).toBe(1);
        });

        it('should return Zone 1 at the upper boundary (68%)', () => {
            // 136W is exactly 68%
            expect(calculatePowerZone(136, FTP)).toBe(1);
        });

        it('should return Zone 2 for endurance range (69-83%)', () => {
            // 150W is 75%
            expect(calculatePowerZone(150, FTP)).toBe(2);
        });

        it('should return Zone 3 (Rhythm) for tempo range (84-94%)', () => {
            // 180W is 90%
            expect(calculatePowerZone(180, FTP)).toBe(3);
        });

        it('should return Zone 4 (High Voltage) for threshold range (95-105%)', () => {
            // 200W is 100%
            expect(calculatePowerZone(200, FTP)).toBe(4);
        });

        it('should return Zone 5 (Titan Fury) for supra-threshold (> 105%)', () => {
            // 300W is 150%
            expect(calculatePowerZone(300, FTP)).toBe(5);
        });

        // Edge Cases
        it('should handle 0 FTP gracefully (default to Zone 1)', () => {
            expect(calculatePowerZone(200, 0)).toBe(1);
        });

        it('should handle negative input gracefully', () => {
            expect(calculatePowerZone(-50, FTP)).toBe(1);
        });
    });

    describe('calculatePaceZone', () => {
        // Threshold: 12 kph
        const THRESHOLD = 12;

        it('should return Zone 1 for easy pace', () => {
            expect(calculatePaceZone(6, THRESHOLD)).toBe(1);
        });

        it('should return Zone 5 for sprint pace (>105%)', () => {
            // 15 kph > 12 * 1.05 (12.6)
            expect(calculatePaceZone(15, THRESHOLD)).toBe(5);
        });

        it('should handle 0 threshold gracefully', () => {
            expect(calculatePaceZone(10, 0)).toBe(1);
        });
    });
});

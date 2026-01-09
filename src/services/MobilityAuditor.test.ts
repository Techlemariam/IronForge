import { describe, it, expect } from 'vitest';
import { auditMobility, MobilityAuditReport } from './MobilityAuditor';
import { MOBILITY_EXERCISES } from '@/data/mobilityExercises';

describe('MobilityAuditor', () => {
    // Helper to get an exercise ID by partial name
    const getExId = (name: string) => MOBILITY_EXERCISES.find(e => e.name.toLowerCase().includes(name.toLowerCase()))?.id || '';

    it('should correctly calculate total weekly minutes and passive layer', () => {
        const logs = [
            { exerciseId: getExId('tibialis'), durationSecs: 600 }, // 10 mins
            { exerciseId: getExId('couch'), durationSecs: 600 },    // 10 mins
        ];
        // Total 20 mins -> Bronze (>=15)
        const report = auditMobility(logs);
        expect(report.totalWeeklyMinutes).toBe(20);
        expect(report.passiveLayerLevel).toBe('BRONZE');
    });

    it('should identify neglected regions', () => {
        // Log only Ankle work
        const logs = [
            { exerciseId: getExId('tibialis'), durationSecs: 1200 }, // 20 mins ankle
        ];
        const report = auditMobility(logs);

        // Ankle coverage should be high
        expect(report.regionCoverage.ankle).toBe(20);

        // Other regions should be neglected
        expect(report.neglectedRegions).toContain('hip_flexor');
        expect(report.neglectedRegions).toContain('thoracic');
        expect(report.neglectedRegions).not.toContain('ankle');
    });

    it('should recommend exercises for neglected regions', () => {
        const logs: any[] = []; // No work
        const report = auditMobility(logs);

        expect(report.recommendedExercises.length).toBeGreaterThan(0);
        // Should recommend highly neglected regions like hip_flexor or shoulder
        const regions = report.recommendedExercises.map(r => r.region);
        expect(regions.length).toBeLessThan(4); // Only top 3
    });

    it('should detect Gold layer', () => {
        // 60 mins total
        const logs = [
            { exerciseId: getExId('tibialis'), durationSecs: 3600 },
        ];
        const report = auditMobility(logs);
        expect(report.passiveLayerLevel).toBe('GOLD');
    });

    it('should handle unknown exercise IDs gracefully', () => {
        const logs = [
            { exerciseId: 'unknown-id', durationSecs: 600 },
        ];
        const report = auditMobility(logs);
        expect(report.totalWeeklyMinutes).toBe(10); // Still counts duration
        expect(report.regionCoverage.ankle).toBe(0); // But no region coverage
    });
});

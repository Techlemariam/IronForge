import { describe, it, expect } from 'vitest';
import { calculateDailyBudget, wellnessToSystemMetrics } from './BudgetCalculator';
import { WellnessData } from '@/lib/intervals';

describe('BudgetCalculator', () => {
    const baseWellness: WellnessData = {
        id: 'test-1',
        date: '2026-01-08',
        hrv: 50,
        restingHR: 60,
        readiness: 80,
        sleepScore: 85,
        sleepSecs: 28800,
        ctl: 50,
        atl: 50,
        tsb: 0,
        rampRate: 3,
        vo2max: 45,
        avgSleepingHR: null,
        sleepQuality: null,
        hydration: 80,
        hrvSDNN: null,
        baevskySI: null,
        stress: 3,
        mood: 2,
        fatigue: 30,
        menstrualPhase: null,
        menstrualPhasePredicted: null,
        weight: 75,
        spO2: 98,
        respiration: 14,
        bloodGlucose: null,
        injury: null,
        soreness: 2,
        steps: 8000,
    };

    describe('calculateDailyBudget', () => {
        it('should return default budget for healthy wellness', () => {
            const budget = calculateDailyBudget(baseWellness);
            expect(budget.cns).toBeGreaterThanOrEqual(80);
            expect(budget.muscular).toBeGreaterThanOrEqual(80);
            expect(budget.metabolic).toBeGreaterThanOrEqual(80);
        });

        it('should reduce budget on poor sleep', () => {
            const poorSleep = { ...baseWellness, sleepScore: 40 };
            const budget = calculateDailyBudget(poorSleep);
            expect(budget.cns).toBeLessThan(80);
            expect(budget.muscular).toBeLessThan(90);
        });

        it('should reduce budget on high soreness', () => {
            const sore = { ...baseWellness, soreness: 8 };
            const budget = calculateDailyBudget(sore);
            expect(budget.muscular).toBeLessThanOrEqual(50);
        });

        it('should reduce budget during luteal phase', () => {
            const luteal = { ...baseWellness, menstrualPhase: 'LUTEAL' };
            const budget = calculateDailyBudget(luteal);
            expect(budget.cns).toBeLessThan(100);
        });

        it('should hard-lock on injury', () => {
            const injured = { ...baseWellness, injury: 'Sprained ankle' };
            const budget = calculateDailyBudget(injured);
            expect(budget.muscular).toBeLessThanOrEqual(40);
            expect(budget.cns).toBeLessThanOrEqual(60);
        });

        it('should floor budget at 10 (never zero)', () => {
            const crashed: WellnessData = {
                ...baseWellness,
                sleepScore: 10,
                soreness: 10,
                fatigue: 95,
                stress: 9,
                mood: -5,
                injury: 'Major injury',
                tsb: -50,
                hrv: 15,
            };
            const budget = calculateDailyBudget(crashed);
            expect(budget.cns).toBeGreaterThanOrEqual(10);
            expect(budget.muscular).toBeGreaterThanOrEqual(10);
            expect(budget.metabolic).toBeGreaterThanOrEqual(10);
        });
    });

    describe('wellnessToSystemMetrics', () => {
        it('should map wellness to system metrics', () => {
            const metrics = wellnessToSystemMetrics(baseWellness);
            expect(metrics.hrv).toBe(50);
            expect(metrics.tsb).toBe(0);
            expect(metrics.sleepScore).toBe(85);
            expect(metrics.soreness).toBe(2);
            expect(metrics.acwr).toBe(1.0);
        });

        it('should calculate ACWR correctly', () => {
            const fatigued = { ...baseWellness, atl: 80, ctl: 50 };
            const metrics = wellnessToSystemMetrics(fatigued);
            expect(metrics.acwr).toBe(1.6);
        });
    });
});

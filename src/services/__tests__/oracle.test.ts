import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OracleService } from '../oracle';
import { TrainingMemoryManager } from '../trainingMemoryManager';
import { GeminiService } from '../gemini';
import { IntervalsWellness, TTBIndices } from '../../types';

// Mock Dependencies
vi.mock('../storage', () => ({
    StorageService: {
        getOwnedEquipment: vi.fn().mockResolvedValue(['Bodyweight']),
        getHyperProPriority: vi.fn().mockResolvedValue(false)
    }
}));

vi.mock('../trainingMemoryManager', () => ({
    TrainingMemoryManager: {
        calculateDebuffs: vi.fn(),
        shouldEnterSurvivalMode: vi.fn()
    }
}));

vi.mock('../gemini', () => ({
    GeminiService: {
        generateOracleAdvice: vi.fn().mockResolvedValue('AI Rationale')
    }
}));

describe('OracleService', () => {
    const mockWellness: IntervalsWellness = {
        id: '2023-01-01',
        ctl: 50,
        atl: 50,
        tsb: 0,
        sleepScore: 80,
        hrv: 50,
        bodyBattery: 80
    };

    const mockTTB: TTBIndices = {
        strength: 50,
        endurance: 50,
        wellness: 50,
        lowest: 'strength'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mocks
        vi.mocked(TrainingMemoryManager.calculateDebuffs).mockReturnValue([]);
        vi.mocked(TrainingMemoryManager.shouldEnterSurvivalMode).mockReturnValue(false);
    });

    describe('consult', () => {
        it('returns SURVIVAL MODE RECOVERY if survival mode is active', async () => {
            vi.mocked(TrainingMemoryManager.shouldEnterSurvivalMode).mockReturnValue(true);
            // Fix: remove 'type' from mock object to match CapacityModifier
            vi.mocked(TrainingMemoryManager.calculateDebuffs).mockReturnValue([{ reason: 'Poor Sleep', multiplier: 0.5, source: 'SLEEP' }]);

            const rec = await OracleService.consult(mockWellness, mockTTB);

            expect(rec.type).toBe('RECOVERY');
            expect(rec.title).toBe('SURVIVAL MODE ACTIVE');
            expect(rec.priorityScore).toBe(125);
        });

        it('prioritizes Bio-Engine Low Recovery warnings', async () => {
            const rec = await OracleService.consult(
                mockWellness,
                mockTTB,
                [],
                null,
                null,
                { state: 'LOW_RECOVERY', reason: 'HRV Crash' }
            );

            expect(rec.type).toBe('RECOVERY');
            expect(rec.title).toBe('BIO-ENGINE WARNING: RECOVERY');
            expect(rec.priorityScore).toBe(120);
        });

        it('prioritizes upcoming races (Taper)', async () => {
            const raceEvent = {
                id: 'race1',
                name: 'IronMan 70.3',
                start_date_local: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days out
                category: 'race'
            };

            const rec = await OracleService.consult(mockWellness, mockTTB, [raceEvent] as any);

            expect(rec.type).toBe('TAPER');
            expect(rec.title).toBe('TAPER PROTOCOL ACTIVE');
        });

        it('suggests Strength work if strength is lowest TTB', async () => {
            const weakStrengthTTB = { ...mockTTB, lowest: 'strength' as const };

            const rec = await OracleService.consult(mockWellness, weakStrengthTTB);

            // Expect PR_ATTEMPT or similar high priority strength work
            expect(rec.title).toContain('STRENGTH FOCUS');
            expect(rec.type).toBe('PR_ATTEMPT');
        });

        it('suggests Cardio if endurance is lowest TTB', async () => {
            const weakEnduranceTTB = { ...mockTTB, lowest: 'endurance' as const };

            const rec = await OracleService.consult(mockWellness, weakEnduranceTTB);

            expect(rec.title).toBe('AERO ATTACK PROTOCOL');
            expect(rec.type).toBe('CARDIO_VALIDATION');
        });
    });
});

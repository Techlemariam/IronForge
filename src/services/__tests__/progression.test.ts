import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressionService } from '../progression';
import { StorageService } from '../storage';
import { ACHIEVEMENTS } from '../../data/static';

// Mock StorageService
vi.mock('../storage', () => ({
    StorageService: {
        getState: vi.fn(),
        getHistory: vi.fn(),
        getGold: vi.fn(),
        saveGold: vi.fn()
    }
}));

describe('ProgressionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('calculateLevel', () => {
        it('starts at level 1 with 0 XP', () => {
            expect(ProgressionService.calculateLevel(0)).toBe(1);
        });

        it('levels up every 1000 XP', () => {
            expect(ProgressionService.calculateLevel(999)).toBe(1);
            expect(ProgressionService.calculateLevel(1000)).toBe(2);
            expect(ProgressionService.calculateLevel(2500)).toBe(3);
        });
    });

    describe('calculateTotalXp', () => {
        it('calculates XP from achievements correctly', async () => {
            // Mock achievements: Assume first achievement in static list gives 5 points (500 XP)
            const mockAchId = ACHIEVEMENTS[0].id;
            const points = ACHIEVEMENTS[0].points;

            vi.mocked(StorageService.getState).mockResolvedValue([mockAchId]);
            vi.mocked(StorageService.getHistory).mockResolvedValue([]); // No workout XP

            const xp = await ProgressionService.calculateTotalXp();
            expect(xp).toBe(points * 100);
        });

        it('calculates XP from workout history correctly', async () => {
            vi.mocked(StorageService.getState).mockResolvedValue([]); // No achievements
            // Mock 10 workouts
            vi.mocked(StorageService.getHistory).mockResolvedValue(new Array(10));

            const xp = await ProgressionService.calculateTotalXp();
            // 10 workouts * 50 XP = 500 XP
            expect(xp).toBe(500);
        });

        it('sums achievement and workout XP', async () => {
            const mockAchId = ACHIEVEMENTS[0].id;
            const points = ACHIEVEMENTS[0].points;

            vi.mocked(StorageService.getState).mockResolvedValue([mockAchId]);
            vi.mocked(StorageService.getHistory).mockResolvedValue(new Array(10));

            const xp = await ProgressionService.calculateTotalXp();
            expect(xp).toBe((points * 100) + 500);
        });
    });

    describe('awardGold', () => {
        it('adds gold to current balance and saves', async () => {
            vi.mocked(StorageService.getGold).mockResolvedValue(100);

            const newTotal = await ProgressionService.awardGold(50);

            expect(StorageService.saveGold).toHaveBeenCalledWith(150);
            expect(newTotal).toBe(150);
        });
    });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressionService } from '../progression';
import prisma from '@/lib/prisma';
import { ACHIEVEMENTS } from '../../data/static';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            update: vi.fn(),
            findUnique: vi.fn(),
        },
        userAchievement: {
            upsert: vi.fn(),
        }
    }
}));

describe('ProgressionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('awardGold', () => {
        it('increments gold balance via prisma', async () => {
            await ProgressionService.awardGold('user_123', 50);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user_123' },
                data: { gold: { increment: 50 } }
            });
        });
    });

    describe('addExperience', () => {
        it('calculates level and updates user experience', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                totalExperience: 500,
                level: 1
            } as any);

            await ProgressionService.addExperience('user_123', 600);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user_123' },
                data: {
                    totalExperience: 1100,
                    level: 2
                }
            });
        });
    });

    describe('awardAchievement', () => {
        it('awards achievement, gold and xp', async () => {
            const achievement = ACHIEVEMENTS[0];
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                totalExperience: 0,
                level: 1
            } as any);

            const awardGoldSpy = vi.spyOn(ProgressionService, 'awardGold');
            const addExpSpy = vi.spyOn(ProgressionService, 'addExperience');

            await ProgressionService.awardAchievement('user_123', achievement.id);

            expect(prisma.userAchievement.upsert).toHaveBeenCalled();
            expect(awardGoldSpy).toHaveBeenCalledWith('user_123', achievement.points * 50);
            expect(addExpSpy).toHaveBeenCalledWith('user_123', achievement.points * 100);
        });
    });

    describe('getProgressionState', () => {
        it('maps user state to progression object', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                totalExperience: 1200,
                level: 2,
                gold: 500,
                kineticEnergy: 100
            } as any);

            const state = await ProgressionService.getProgressionState('user_123');

            expect(state).toEqual({
                level: 2,
                totalXp: 1200,
                xpToNextLevel: 800,
                progressPct: 20,
                gold: 500,
                kineticEnergy: 100
            });
        });
    });
});

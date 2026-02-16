import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCardioDuelProgressInternalWithUser } from '@/actions/pvp/duel';
import prisma from '@/lib/prisma';
import { DuelRewardsService } from '@/services/pvp/DuelRewardsService';

// Mock Rewards Service
vi.mock('@/services/pvp/DuelRewardsService', () => ({
    DuelRewardsService: {
        calculateRewards: vi.fn()
    }
}));

// Mock Next Cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Cardio Duel Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('updates challenger distance correctly', async () => {
        const duel = {
            id: 'duel1',
            status: 'ACTIVE',
            challengerId: 'user1',
            defenderId: 'user2',
            challengerDistance: 2.0,
            defenderDistance: 1.0,
            targetDistance: 5.0,
            duelType: 'DISTANCE_RACE',
            activityType: 'RUNNING'
        };

        vi.mocked(prisma.duelChallenge.findUnique).mockResolvedValue(duel as any);

        await updateCardioDuelProgressInternalWithUser('duel1', 'user1', 1.5, 10);

        expect(prisma.duelChallenge.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'duel1' },
            data: {
                challengerDistance: 3.5,
                challengerDuration: 10,
                challengerElevation: 0
            }
        }));
    });

    it('detects win condition and awards rewards', async () => {
        const duel = {
            id: 'duel1',
            status: 'ACTIVE',
            challengerId: 'user1',
            defenderId: 'user2',
            challengerDistance: 4.5, // Almost there
            defenderDistance: 1.0,
            targetDistance: 5.0,
            duelType: 'DISTANCE_RACE',
            activityType: 'RUNNING'
        };

        vi.mocked(prisma.duelChallenge.findUnique).mockResolvedValue(duel as any);
        vi.mocked(DuelRewardsService.calculateRewards).mockResolvedValue({ xp: 100, gold: 50, kineticEnergy: 10 } as any);

        const result = await updateCardioDuelProgressInternalWithUser('duel1', 'user1', 1.0, 10);

        // Win confirmed
        expect(result.isWin).toBe(true);

        // Status updated to COMPLETED
        expect(prisma.duelChallenge.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'duel1' },
            data: expect.objectContaining({
                status: 'COMPLETED',
                winnerId: 'user1'
            })
        }));

        // Rewards distributed
        expect(DuelRewardsService.calculateRewards).toHaveBeenCalledTimes(2); // Winner and Loser
        expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });

    it('does not update if duel is not active', async () => {
        vi.mocked(prisma.duelChallenge.findUnique).mockResolvedValue({ status: 'PENDING' } as any);
        const result = await updateCardioDuelProgressInternalWithUser('duel1', 'user1', 1.0, 10);
        expect(result.success).toBe(false);
    });
});

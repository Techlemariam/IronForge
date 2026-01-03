import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCardioDuelProgressInternalWithUser } from '../../src/actions/duel';
import prisma from '../../src/lib/prisma';
import { DuelRewardsService } from '../../src/services/pvp/DuelRewardsService';

// Mock Prisma (Handle both default and named imports)
vi.mock('../../src/lib/prisma', () => {
    const mockPrisma = {
        duelChallenge: {
            findUnique: vi.fn(),
            update: vi.fn()
        },
        user: {
            update: vi.fn()
        }
    };
    return {
        default: mockPrisma,
        prisma: mockPrisma
    };
});

// Mock Rewards Service
vi.mock('../../src/services/pvp/DuelRewardsService', () => ({
    DuelRewardsService: {
        calculateRewards: vi.fn().mockResolvedValue({ xp: 100, gold: 50, kineticEnergy: 10 })
    }
}));

// Mock Supabase (to avoid import errors)
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn()
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

        (prisma.duelChallenge.findUnique as any).mockResolvedValue(duel);

        await updateCardioDuelProgressInternalWithUser('duel1', 'user1', 1.5, 10);

        expect(prisma.duelChallenge.update).toHaveBeenCalledWith({
            where: { id: 'duel1' },
            data: { challengerDistance: 3.5 }
        });
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

        (prisma.duelChallenge.findUnique as any).mockResolvedValue(duel);

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
        (prisma.duelChallenge.findUnique as any).mockResolvedValue({ status: 'PENDING' });
        const result = await updateCardioDuelProgressInternalWithUser('duel1', 'user1', 1.0, 10);
        expect(result.success).toBe(false);
    });
});

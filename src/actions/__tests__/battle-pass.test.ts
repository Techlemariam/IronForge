import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as battlePassActions from '../battle-pass';
import { prisma } from '@/lib/prisma';

// Mock Modules
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        battlePassSeason: { findFirst: vi.fn() },
        userBattlePass: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
        },
        battlePassTier: { findMany: vi.fn(), findUnique: vi.fn() },
        user: { update: vi.fn() },
        userEquipment: { upsert: vi.fn() },
        userTitle: { upsert: vi.fn() },
        userBattlePassClaim: { create: vi.fn() },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

describe('Battle Pass Actions', () => {
    const mockSeason = {
        id: 'season_1',
        name: 'Season 1',
        tiers: [
            { tierLevel: 1, requiredXp: 100, freeRewardId: 'r1', freeRewardData: { type: 'GOLD', amount: 100 }, premiumRewardId: 'p1', premiumRewardData: { type: 'ITEM', itemId: 'sword' } },
            { tierLevel: 2, requiredXp: 200, freeRewardId: 'r2', freeRewardData: null, premiumRewardId: 'p2', premiumRewardData: { type: 'TITLE', titleId: 'hero' } },
        ],
    };

    const mockUserPass = {
        id: 'pass_1',
        userId: 'user_1',
        seasonId: 'season_1',
        seasonXp: 150,
        currentTier: 1,
        hasPremium: false,
        claims: [{ tierLevel: 1, isPremium: false }], // Level 1 free claimed
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getActiveSeasonAction', () => {
        it('should return the active season', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            const result = await battlePassActions.getActiveSeasonAction();
            expect(result).toEqual(mockSeason);
            expect(prisma.battlePassSeason.findFirst).toHaveBeenCalledWith({
                where: { isActive: true },
                include: { tiers: { orderBy: { tierLevel: 'asc' } } },
            });
        });

        it('should return null on error', async () => {
            (prisma.battlePassSeason.findFirst as any).mockRejectedValue(new Error('DB Error'));
            const result = await battlePassActions.getActiveSeasonAction();
            expect(result).toBeNull();
        });
    });

    describe('getUserBattlePassProgressAction', () => {
        it('should return null if no active season', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(null);
            const result = await battlePassActions.getUserBattlePassProgressAction('user_1');
            expect(result).toBeNull();
        });

        it('should return existing user progress with mapped tiers', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            (prisma.userBattlePass.findUnique as any).mockResolvedValue(mockUserPass);

            const result = await battlePassActions.getUserBattlePassProgressAction('user_1');

            expect(result).not.toBeNull();
            expect(result!.level).toBe(1);
            expect(result!.xp).toBe(150);
            expect(result!.tiers).toHaveLength(2);
            // Tier 1: Unlocked (XP 150 >= 100), Free Claimed (in claims list)
            expect(result!.tiers[0].isUnlocked).toBe(true);
            expect(result!.tiers[0].isClaimedFree).toBe(true);
            expect(result!.tiers[0].isClaimedPremium).toBe(false);
            // Tier 2: Locked (XP 150 < 200)
            expect(result!.tiers[1].isUnlocked).toBe(false);
        });

        it('should create new progress if missing', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            (prisma.userBattlePass.findUnique as any).mockResolvedValue(null);
            (prisma.userBattlePass.create as any).mockResolvedValue({ ...mockUserPass, seasonXp: 0, claims: [] });

            const result = await battlePassActions.getUserBattlePassProgressAction('user_1');

            expect(prisma.userBattlePass.create).toHaveBeenCalledWith({
                data: { userId: 'user_1', seasonId: 'season_1' },
                include: { claims: true },
            });
            expect(result).not.toBeNull();
        });
    });

    describe('addBattlePassXpAction', () => {
        it('should add xp and calculate new tier', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            // First find inside tx
            (prisma.userBattlePass.findUnique as any).mockResolvedValue({ ...mockUserPass, seasonXp: 50 }); // Start with 50 XP
            (prisma.battlePassTier.findMany as any).mockResolvedValue(mockSeason.tiers);

            // Invoke action adds 160 XP -> Total 210
            await battlePassActions.addBattlePassXpAction('user_1', 160);

            // Expect Update
            expect(prisma.userBattlePass.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: mockUserPass.id },
                data: {
                    seasonXp: 210,
                    currentTier: 2, // 210 >= 200 (Tier 2)
                },
            }));
        });
    });

    describe('claimBattlePassRewardAction', () => {
        it('should claim free reward successfully', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            (prisma.userBattlePass.findUnique as any).mockResolvedValue(mockUserPass); // XP 150, Tier 1 claimed
            // Claim Tier 2? No, Tier 1 is already claimed.
            // Let's modify mock for this test to specific state
            // Let's claim Level 1 Premium
            (prisma.userBattlePass.findUnique as any).mockResolvedValue({ ...mockUserPass, hasPremium: true });
            (prisma.battlePassTier.findUnique as any).mockResolvedValue(mockSeason.tiers[0]); // Tier 1

            const result = await battlePassActions.claimBattlePassRewardAction('user_1', 1, true);

            expect(result.success).toBe(true);
            expect(prisma.userEquipment.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId_equipmentId: { userId: 'user_1', equipmentId: 'sword' } }
            }));
            expect(prisma.userBattlePassClaim.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    tierLevel: 1,
                    isPremium: true
                })
            }));
        });

        it('should fail if premium required but not owned', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            (prisma.userBattlePass.findUnique as any).mockResolvedValue({ ...mockUserPass, hasPremium: false });
            (prisma.battlePassTier.findUnique as any).mockResolvedValue(mockSeason.tiers[0]);

            const result = await battlePassActions.claimBattlePassRewardAction('user_1', 1, true);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Premium Pass required');
        });

        it('should fail if already claimed', async () => {
            (prisma.battlePassSeason.findFirst as any).mockResolvedValue(mockSeason);
            (prisma.userBattlePass.findUnique as any).mockResolvedValue(mockUserPass); // Tier 1 Free ALREADY claimed
            (prisma.battlePassTier.findUnique as any).mockResolvedValue(mockSeason.tiers[0]);

            const result = await battlePassActions.claimBattlePassRewardAction('user_1', 1, false);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Already claimed');
        });
    });
});

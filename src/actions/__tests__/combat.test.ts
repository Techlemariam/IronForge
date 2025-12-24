import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startBossFight, performCombatAction } from '../combat';

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mocks
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(),
        },
    })),
}));

vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        monster: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('@/services/game/CombatEngine', () => ({
    CombatEngine: {
        processTurn: vi.fn(),
    },
}));

vi.mock('@/services/game/LootSystem', () => ({
    LootSystem: {
        rollForLoot: vi.fn(() => Promise.resolve({ item: 'Rare Sword' })),
    },
}));

vi.mock('@/utils', () => ({
    calculateTitanAttributes: vi.fn(() => ({ strength: 10, endurance: 10 })),
}));

// Import mocks to manipulate them
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { CombatEngine } from '@/services/game/CombatEngine';

describe('Combat Server Actions', () => {
    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createClient as any).mockResolvedValue(mockSupabase);
    });

    describe('startBossFight', () => {
        it('should initialize combat state for valid boss', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user-1',
                level: 5,
                achievements: [],
                skills: []
            });

            (prisma.monster.findUnique as any).mockResolvedValue({
                id: 'boss-1',
                hp: 1000,
                name: 'Boss',
                level: 5
            });

            const result = await startBossFight('boss-1');

            expect(result.success).toBe(true);
            expect(result.state).toBeDefined();
            expect(result.state?.bossHp).toBe(1000);
            expect(result.state?.playerHp).toBeDefined();
        });

        it('should fail if boss not found', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user-1',
                achievements: [],
                skills: []
            });
            (prisma.monster.findUnique as any).mockResolvedValue(null);

            const result = await startBossFight('missing-boss');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Boss not found');
        });
    });

    describe('performCombatAction', () => {
        it('should process turn and return new state', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

            // Mock for startBossFight
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user-1',
                level: 5,
                achievements: [],
                skills: []
            });

            (prisma.monster.findUnique as any).mockResolvedValue({
                id: 'boss-1',
                name: 'Boss',
                hp: 1000,
                level: 5
            });

            // Call startBossFight to populate session
            await startBossFight('boss-1');

            // Mock for performCombatAction (re-fetch user)
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user-1',
                level: 5,
                achievements: [],
                skills: []
            });

            (CombatEngine.processTurn as any).mockReturnValue({
                newState: { playerHp: 90, bossHp: 900, isVictory: false },
                logs: []
            });

            const result = await performCombatAction({ type: 'ATTACK' } as any);

            expect(result.success).toBe(true);
            expect(result.newState.bossHp).toBe(900);
            expect(CombatEngine.processTurn).toHaveBeenCalled();
        });

        it('should handle victory and award loot', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

            // Mock consistently
            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user-1',
                level: 5,
                achievements: [],
                skills: []
            });
            (prisma.monster.findUnique as any).mockResolvedValue({
                id: 'boss-1',
                name: 'Boss',
                hp: 1000,
                level: 5
            });

            await startBossFight('boss-1');

            (CombatEngine.processTurn as any).mockReturnValue({
                newState: { isVictory: true, isDefeat: false },
                logs: []
            });

            const result = await performCombatAction({ type: 'ATTACK' } as any);

            expect(result.success).toBe(true);
            expect(result.loot).toBeDefined(); // From mocked LootSystem
            expect(result.reward).toEqual({ xp: 250, gold: 125 }); // 5 * 50, 5 * 25
            expect(prisma.user.update).toHaveBeenCalled();
        });
    });
});

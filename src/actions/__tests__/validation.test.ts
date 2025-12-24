import { describe, it, expect, vi } from 'vitest';
import { awardGoldAction } from '../progression';
import { startBossFight, performCombatAction } from '../combat';
import { craftItem } from '../forge';

// Mock Supabase and DB
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } }))
        }
    }))
}));

vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            update: vi.fn(),
            findUnique: vi.fn()
        },
        monster: {
            findUnique: vi.fn()
        }
    }
}));

vi.mock('@/services/progression', () => ({
    ProgressionService: {
        awardGold: vi.fn()
    }
}));

describe('Security Validation (Zod)', () => {

    describe('Progression Actions', () => {
        it('should reject negative gold amount', async () => {
            const result = await awardGoldAction(-100);
            expect(result).toBeNull(); // Should catch error and return null
        });

        it('should reject excessive gold amount (overflow protection)', async () => {
            const result = await awardGoldAction(2000000); // Limit is 1M
            expect(result).toBeNull();
        });
    });

    describe('Combat Actions', () => {
        it('should reject empty bossId', async () => {
            // startBossFight throws validation error directly (no try/catch wrapper in action)
            await expect(startBossFight('')).rejects.toThrow();
        });

        it('should reject invalid action type', async () => {
            // performCombatAction also throws validation error
            await expect(performCombatAction({ type: 'DANCE' as any })).rejects.toThrow();
        });
    });

    describe('Forge Actions', () => {
        it('should return failure for invalid recipeId format', async () => {
            // craftItem catches validation error and returns success: false
            const result = await craftItem('INVALID @ ID');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Server error');
        });
    });
});

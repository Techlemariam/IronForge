import { describe, it, expect, vi } from 'vitest';
import { createDuelChallengeAction, getDuelStatusAction, updateCardioDuelProgressAction } from '@/actions/pvp/duel';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        duelChallenge: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
        user: { findUnique: vi.fn() }
    }
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn()
}));

describe('PvP Duel Actions', () => {
    it('should have access to createDuelChallengeAction', () => {
        expect(createDuelChallengeAction).toBeDefined();
        expect(typeof createDuelChallengeAction).toBe('function');
    });

    it('should have access to getDuelStatusAction', () => {
        expect(getDuelStatusAction).toBeDefined();
        expect(typeof getDuelStatusAction).toBe('function');
    });

    it('should have access to updateCardioDuelProgressAction', () => {
        expect(updateCardioDuelProgressAction).toBeDefined();
        expect(typeof updateCardioDuelProgressAction).toBe('function');
    });
});

import { describe, it, expect, vi } from 'vitest';
import { createSegmentBattleAction } from '@/actions/pvp/segment';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        segmentBattle: { create: vi.fn(), findMany: vi.fn() }
    }
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn()
}));

describe('PvP Segment Actions', () => {
    it('should have access to createSegmentBattleAction', () => {
        expect(createSegmentBattleAction).toBeDefined();
        expect(typeof createSegmentBattleAction).toBe('function');
    });
});

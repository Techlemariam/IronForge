import {
  awardTitanXpAction,
  checkAndIncrementStreakAction,
  modifyTitanHealthAction,
} from '@/actions/titan/core';
import { prisma } from '@/lib/prisma';
import { TitanService } from '@/services/game/TitanService';
import { createClient } from '@/utils/supabase/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    titan: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return {
    default: mockPrisma,
    prisma: mockPrisma,
  };
});

// Mock TitanService
vi.mock('@/services/game/TitanService', () => ({
  TitanService: {
    getTitan: vi.fn(),
    ensureTitan: vi.fn(),
    modifyHealth: vi.fn(),
    awardXp: vi.fn(),
    consumeEnergy: vi.fn(),
    syncWellness: vi.fn(),
    updateStreak: vi.fn(),
  },
}));

// Mock GameContextService to prevent side-effects
vi.mock('@/services/game/GameContextService', () => ({
  GameContextService: {
    getPlayerContext: vi.fn(),
  },
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Titan Server Actions', () => {
  const mockTitan = {
    id: 't1',
    userId: 'u1',
    currentHp: 100,
    maxHp: 100,
    xp: 0,
    level: 1,
    energy: 100,
    mood: 'NEUTRAL',
    isInjured: false,
    streak: 0,
    lastActive: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default User mock
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'u1',
      subscriptionTier: 'FREE',
    });

    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
      },
    });
  });

  describe('modifyTitanHealthAction', () => {
    it('should reduce HP and withstand death if HP > 0', async () => {
      const updatedTitan = { ...mockTitan, currentHp: 80 };
      (TitanService.modifyHealth as any).mockResolvedValue(updatedTitan);

      const result = await modifyTitanHealthAction({ delta: -20, reason: 'Test Damage' });

      expect(result?.data?.success).toBe(true);
      expect(TitanService.modifyHealth).toHaveBeenCalledWith('u1', -20, 'Test Damage');
      expect(result?.data?.data).toEqual(updatedTitan);
    });

    it('should clamp HP to 0 and set isInjured if damage exceeds HP', async () => {
      const deadTitan = { ...mockTitan, currentHp: 0, isInjured: true, mood: 'WEAKENED' };
      (TitanService.modifyHealth as any).mockResolvedValue(deadTitan);

      const result = await modifyTitanHealthAction({ delta: -150, reason: 'Fatal Damage' });

      expect(result?.data?.success).toBe(true);
      expect(TitanService.modifyHealth).toHaveBeenCalledWith('u1', -150, 'Fatal Damage');
      expect(result?.data?.data).toEqual(deadTitan);
    });
  });

  describe('awardTitanXpAction', () => {
    it('should award XP without leveling up', async () => {
      const updatedTitan = { ...mockTitan, xp: 750 };
      (TitanService.awardXp as any).mockResolvedValue({ titan: updatedTitan, leveledUp: false });

      const result = await awardTitanXpAction({ amount: 500, source: 'Quest' });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.leveledUp).toBe(false);
      expect(TitanService.awardXp).toHaveBeenCalledWith('u1', 500, 'Quest');
      expect(result?.data?.data).toEqual(updatedTitan);
    });

    it('should level up when XP crosses threshold', async () => {
      const leveledTitan = { ...mockTitan, xp: 200, level: 2, currentHp: 120, maxHp: 120 };
      (TitanService.awardXp as any).mockResolvedValue({ titan: leveledTitan, leveledUp: true });

      const result = await awardTitanXpAction({ amount: 200, source: 'Big Quest' });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.leveledUp).toBe(true);
      expect(TitanService.awardXp).toHaveBeenCalledWith('u1', 200, 'Big Quest');
      expect(result?.data?.data).toEqual(leveledTitan);
    });

    it('should apply XP multipliers (Streak + Mood + Sub + Decree)', async () => {
      const richTitan = { ...mockTitan, xp: 220 };
      (TitanService.awardXp as any).mockResolvedValue({ titan: richTitan, leveledUp: false });

      const result = await awardTitanXpAction({ amount: 100, source: 'Test' });

      expect(result?.data?.success).toBe(true);
      expect(TitanService.awardXp).toHaveBeenCalledWith('u1', 100, 'Test');
      expect(result?.data?.data).toEqual(richTitan);
    });
  });
  describe('checkAndIncrementStreakAction', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should increment streak if last active was yesterday', async () => {
      // Mock Today: 2024-01-02
      vi.setSystemTime(new Date('2024-01-02T12:00:00Z'));

      (TitanService.updateStreak as any).mockResolvedValue({
        streak: 6,
        status: 'UPDATED',
      });

      const result = await checkAndIncrementStreakAction({ timezone: 'UTC' });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.streak).toBe(6);
      expect(TitanService.updateStreak).toHaveBeenCalledWith('u1', 'UTC');
    });

    it('should reset streak if missed a day', async () => {
      // Mock Today: 2024-01-03
      vi.setSystemTime(new Date('2024-01-03T12:00:00Z'));

      (TitanService.updateStreak as any).mockResolvedValue({
        streak: 1,
        status: 'UPDATED',
      });

      const result = await checkAndIncrementStreakAction({ timezone: 'UTC' });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.streak).toBe(1); // Reset to 1 (today)
      expect(TitanService.updateStreak).toHaveBeenCalledWith('u1', 'UTC');
    });

    it('should do nothing if already active today', async () => {
      // Mock Today: 2024-01-02
      vi.setSystemTime(new Date('2024-01-02T18:00:00Z'));

      (TitanService.updateStreak as any).mockResolvedValue({
        streak: 5,
        status: 'SAME_DAY',
      });

      const result = await checkAndIncrementStreakAction({ timezone: 'UTC' });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.streak).toBe(5);
      expect(TitanService.updateStreak).toHaveBeenCalledWith('u1', 'UTC');
    });
  });
});

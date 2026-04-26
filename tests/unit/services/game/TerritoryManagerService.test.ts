import prisma from '@/lib/prisma';
import { TerritoryManagerService } from '@/services/game/TerritoryManagerService';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getISOWeek, getISOWeekYear } from 'date-fns';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    territoryContestEntry: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    territory: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    territoryHistory: {
      create: vi.fn(),
    },
    guild: {
      updateMany: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('TerritoryManagerService', () => {
  const now = new Date();
  const weekNumber = getISOWeek(now);
  const year = getISOWeekYear(now);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordActivity', () => {
    it('should upsert activity for the current week', async () => {
      await TerritoryManagerService.recordActivity('guild-1', 'territory-1', {
        volume: 1000,
        xp: 100,
      });

      expect(prisma.territoryContestEntry.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            territoryId_guildId_weekNumber_year: {
              guildId: 'guild-1',
              territoryId: 'territory-1',
              weekNumber,
              year,
            },
          },
          update: {
            workoutCount: { increment: 1 },
            totalVolume: { increment: 1000 },
            xpEarned: { increment: 100 },
            memberCount: undefined,
          },
        })
      );
    });
  });

  describe('enforceTerritoryCap', () => {
    it('should forfeit oldest territory if guild exceeds 3 tiles', async () => {
      const mockGuildId = 'guild-cap-test';
      
      // Mock 4 territories owned by the guild
      const mockOwnedTerritories = [
        { id: 't1', controlledAt: new Date('2024-01-01') },
        { id: 't2', controlledAt: new Date('2024-01-02') },
        { id: 't3', controlledAt: new Date('2024-01-03') },
        { id: 't4', controlledAt: new Date('2024-01-04') },
      ];

      (prisma.territory.findMany as any).mockResolvedValue(mockOwnedTerritories);

      const mockTx = {
        territory: {
          findMany: vi.fn().mockResolvedValue(mockOwnedTerritories),
          update: vi.fn(),
        },
        territoryHistory: {
          create: vi.fn(),
        }
      };

      await TerritoryManagerService.enforceTerritoryCap(mockGuildId, mockTx as any);

      // Should update the oldest one (t1) to be neutral
      expect(mockTx.territory.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: {
          controlledById: null,
          controlledAt: null,
        }
      });
    });

    it('should do nothing if guild owns 3 or fewer territories', async () => {
      const mockGuildId = 'guild-ok-test';
      const mockOwned = [{ id: 't1' }, { id: 't2' }];

      const mockTx = {
        territory: {
          findMany: vi.fn().mockResolvedValue(mockOwned),
          update: vi.fn(),
        },
      };

      await TerritoryManagerService.enforceTerritoryCap(mockGuildId, mockTx as any);
      expect(mockTx.territory.update).not.toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TerritoryControlService } from '@/services/TerritoryControlService';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        territory: {
            findMany: vi.fn(),
            update: vi.fn()
        },
        territoryContestEntry: {
            findUnique: vi.fn(),
            findMany: vi.fn()
        },
        territoryHistory: {
            create: vi.fn()
        }
    }
}));

describe('TerritoryControlService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getMapState', () => {
        it('should return all territories with control status', async () => {
            const mockTerritories = [
                {
                    id: 'territory-1',
                    name: 'Mount Olympus',
                    region: 'iron_peaks',
                    type: 'TRAINING_GROUNDS',
                    coordX: 50,
                    coordY: 20,
                    controlledById: 'guild-1',
                    controlledBy: { id: 'guild-1', name: 'Iron Legion' }
                }
            ];

            vi.mocked(prisma.territory.findMany).mockResolvedValue(mockTerritories as any);

            const result = await TerritoryControlService.getMapState();

            expect(result.territories).toHaveLength(1);
            expect(result.territories[0].name).toBe('Mount Olympus');
            expect(result.territories[0].controlledByName).toBe('Iron Legion');
        });
    });

    describe('calculateInfluence', () => {
        it('should return 0 if no contest entry exists', async () => {
            vi.mocked(prisma.territoryContestEntry.findUnique).mockResolvedValue(null);

            const influence = await TerritoryControlService.calculateInfluence('guild-1', 'territory-1');

            expect(influence).toBe(0);
        });

        it('should calculate influence from volume and XP', async () => {
            const mockEntry = {
                totalVolume: 50000,
                xpEarned: 1000
            };

            vi.mocked(prisma.territoryContestEntry.findUnique).mockResolvedValue(mockEntry as any);

            const influence = await TerritoryControlService.calculateInfluence('guild-1', 'territory-1');

            expect(influence).toBe(51000);
        });
    });

    describe('processConquest', () => {
        it('should award territory to guild with highest volume', async () => {
            const mockEntries = [
                { guildId: 'guild-1', totalVolume: 100000 },
                { guildId: 'guild-2', totalVolume: 50000 }
            ];

            vi.mocked(prisma.territoryContestEntry.findMany).mockResolvedValue(mockEntries as any);
            vi.mocked(prisma.territory.update).mockResolvedValue({} as any);
            vi.mocked(prisma.territoryHistory.create).mockResolvedValue({} as any);

            await TerritoryControlService.processConquest('territory-1');

            expect(prisma.territory.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'territory-1' },
                    data: expect.objectContaining({
                        controlledById: 'guild-1'
                    })
                })
            );
        });
    });
});

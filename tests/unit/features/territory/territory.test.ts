import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTerritoryAppData } from '@/actions/systems/territory';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Mock dependencies (Keep these specific ones)
vi.mock('@/services/notifications', () => ({
    NotificationService: {
        create: vi.fn(),
    },
}));

// Mock tileUtils functions we use
vi.mock('@/lib/territory/tileUtils', () => ({
    coordsToTileId: () => '892e0b6012bffff',
    tileIdToCoords: () => ({ lat: 59.3, lng: 18.0 }),
    isWithinHomeZone: (tileId: string) => tileId === 'home_zone_tile',
    tilesToGeoJsonFeatureCollection: (tiles: any[]) => ({ features: tiles }), // Simple mock
    HOME_ZONE_RADIUS_METERS: 500,
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

describe('territory actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getTerritoryAppData', () => {
        it('should return territory data when user is found', async () => {
            // Mock session - Must be inside it for mockReset compatibility
            vi.mocked(getSession).mockResolvedValue({
                user: { id: 'user-123', email: 'test@example.com' },
            } as any);

            // Mock happy path where user exists
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-123',
                homeLatitude: 59.32,
                homeLongitude: 18.06
            } as any);

            // Mock Stats
            vi.mocked(prisma.userTerritoryStats.findUnique).mockResolvedValue({
                userId: 'user-123',
                ownedTiles: 10,
                controlPoints: 500,
            } as any);

            // Mock Control Records with nested tile relation
            vi.mocked(prisma.tileControl.findMany).mockResolvedValue([
                {
                    tileId: 'tile-1',
                    controllerId: 'user-123',
                    controlPoints: 100,
                    status: 'OWNED',
                    tile: {
                        id: 'tile-1',
                        currentOwnerId: 'user-123',
                        currentOwner: { heroName: 'Hero' }
                    }
                },
                {
                    tileId: 'home_zone_tile',
                    controllerId: 'user-123',
                    controlPoints: 100,
                    status: 'OWNED',
                    tile: {
                        id: 'home_zone_tile',
                        currentOwnerId: 'user-123',
                        currentOwner: { heroName: 'Hero' }
                    }
                }
            ] as any);

            const result = await getTerritoryAppData();

            expect(result).toBeDefined();
            expect(result.homeLocation).toEqual({ lat: 59.32, lng: 18.06 });
            expect(result.stats).toBeDefined();

            // Verify Home Zone logic
            const homeTile = result.tiles.find((t: any) => t.id === 'home_zone_tile');
            expect(homeTile).toBeDefined();
            expect(homeTile?.state).toBe('HOME_ZONE');

            const normalTile = result.tiles.find((t: any) => t.id === 'tile-1');
            expect(normalTile).toBeDefined();
            expect(normalTile?.state).toBe('OWNED');
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTerritoryAppData } from '@/actions/systems/territory';

// Mock dependencies
const prismaMock = vi.hoisted(() => ({
    tileControl: {
        findMany: vi.fn(),
    },
    user: {
        findUnique: vi.fn(),
    },
    userTerritoryStats: {
        findUnique: vi.fn(),
    },
    territoryTile: {
        findMany: vi.fn().mockResolvedValue([]),
    }
}));

const notificationServiceMock = vi.hoisted(() => ({
    create: vi.fn(),
}));

// Mock modules
vi.mock('@/lib/prisma', () => ({
    default: prismaMock,
    prisma: prismaMock,
}));

vi.mock('@/services/notifications', () => ({
    NotificationService: notificationServiceMock,
}));

// Mock tileUtils functions we use
vi.mock('@/lib/territory/tileUtils', () => ({
    coordsToTileId: () => '892e0b6012bffff',
    tileIdToCoords: () => ({ lat: 59.3, lng: 18.0 }),
    isWithinHomeZone: (tileId: string) => tileId === 'home_zone_tile',
    tilesToGeoJsonFeatureCollection: (tiles: any[]) => ({ features: tiles }), // Simple mock
    HOME_ZONE_RADIUS_METERS: 500,
}));

// Mock server auth
vi.mock('@/utils/supabase/server', () => ({
    createClient: () => ({
        auth: {
            getUser: () => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null }),
        },
    }),
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn().mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
    }),
}));

describe('territory actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getTerritoryAppData', () => {
        it('should return territory data when user is found', async () => {
            // Mock happy path where user exists
            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user-123',
                homeLatitude: 59.32,
                homeLongitude: 18.06
            });

            // Mock Stats
            prismaMock.userTerritoryStats.findUnique.mockResolvedValue({
                userId: 'user-123',
                ownedTiles: 10,
                controlPoints: 500,
            });

            // Mock Control Records with nested tile relation
            prismaMock.tileControl.findMany.mockResolvedValue([
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
            ]);

            const result = await getTerritoryAppData();

            expect(result).toBeDefined();
            expect(result.homeLocation).toEqual({ lat: 59.32, lng: 18.06 });
            expect(result.stats).toBeDefined();

            // Verify Home Zone logic
            // We mocked isWithinHomeZone to return true for 'home_zone_tile'
            const homeTile = result.tiles.find((t: any) => t.id === 'home_zone_tile');
            expect(homeTile).toBeDefined();
            expect(homeTile?.state).toBe('HOME_ZONE');

            const normalTile = result.tiles.find((t: any) => t.id === 'tile-1');
            expect(normalTile).toBeDefined();
            expect(normalTile?.state).toBe('OWNED');
        });
    });
});

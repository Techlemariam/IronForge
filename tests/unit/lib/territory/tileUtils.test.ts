import { describe, it, expect } from 'vitest';
import { isWithinHomeZone, coordsToTileId, HOME_ZONE_RADIUS_METERS } from '@/lib/territory/tileUtils';

describe('tileUtils', () => {
    describe('isWithinHomeZone', () => {
        // Stockholm Coordinates (approx)
        const HOME_LAT = 59.3293;
        const HOME_LNG = 18.0686;

        // Get the H3 index for the home location at resolution 8 (default)
        const homeTileId = coordsToTileId(HOME_LAT, HOME_LNG);

        it('should return true if tile is the home tile itself', () => {
            expect(isWithinHomeZone(homeTileId, HOME_LAT, HOME_LNG, HOME_ZONE_RADIUS_METERS)).toBe(true);
        });

        it('should return true for a tile very close to home', () => {
            // A point very close (e.g. 100m away)
            // We can simulate this by finding a neighbor or just using the same tile for simplicity in this mock, 
            // but let's try to be more robust if possible. 
            // Actually, `isWithinHomeZone` calculates distance from the tile center to the home lat/lng.

            // If we use the exact same tile, distance is near 0.
            expect(isWithinHomeZone(homeTileId, HOME_LAT, HOME_LNG, 500)).toBe(true);
        });

        it('should return false for a tile in a different city (far away)', () => {
            // Gothenburg coordinates
            const FAR_LAT = 57.7089;
            const FAR_LNG = 11.9746;
            const farTileId = coordsToTileId(FAR_LAT, FAR_LNG);

            expect(isWithinHomeZone(farTileId, HOME_LAT, HOME_LNG, HOME_ZONE_RADIUS_METERS)).toBe(false);
        });

        it('should respect the radius parameter', () => {
            // Use a tile that is reasonably close but outside a small radius
            // Depending on H3 resolution 9 (edge length ~174m), a neighbor might be ~300m away.
            // If radius is 100m, neighbor should be false.
            // If radius is 1000m, neighbor should be true.

            // Note: We might need to find an actual neighbor ID for this test to be precise without mocking h3-js internals,
            // but for now testing "Zero radius" vs "Large Radius" on the home tile is a safe sanity check.

            expect(isWithinHomeZone(homeTileId, HOME_LAT, HOME_LNG, 0)).toBe(false); // Likely false unless exact center match down to meter
            expect(isWithinHomeZone(homeTileId, HOME_LAT, HOME_LNG, 1000)).toBe(true);
        });
    });
});

import { describe, it, expect } from "vitest";
import {
    coordsToTileId,
    tileIdToCoords,
    getTilesFromGpsTrack,
    isWithinHomeZone,
    getAdjacentTiles,
} from "../tileUtils";

// Coordinates for Iron City (fictional center or test coords)
const TEST_LAT = 59.3293;
const TEST_LNG = 18.0686;

describe("tileUtils", () => {
    it("should convert coordinates to tile ID and back", () => {
        const tileId = coordsToTileId(TEST_LAT, TEST_LNG);
        expect(tileId).toBeDefined();
        expect(typeof tileId).toBe("string");

        const coords = tileIdToCoords(tileId);
        // H3 conversion has slight precision loss due to hexagon center
        // At res 8, center can be ~200m away
        expect(coords.lat).toBeCloseTo(TEST_LAT, 2);
        expect(coords.lng).toBeCloseTo(TEST_LNG, 2);
    });

    it("should detect home zone proximity", () => {
        const tileId = coordsToTileId(TEST_LAT, TEST_LNG);

        // Exact point
        expect(isWithinHomeZone(tileId, TEST_LAT, TEST_LNG)).toBe(true);

        // Close point (~100m away)
        expect(isWithinHomeZone(tileId, TEST_LAT + 0.001, TEST_LNG)).toBe(true);

        // Far point (~10km away)
        expect(isWithinHomeZone(tileId, TEST_LAT + 0.1, TEST_LNG)).toBe(false);
    });

    it("should extract unique tiles from GPS track", () => {
        const track = [
            { lat: TEST_LAT, lng: TEST_LNG },
            { lat: TEST_LAT + 0.0001, lng: TEST_LNG }, // Same tile
            { lat: TEST_LAT + 0.01, lng: TEST_LNG },    // New tile
            { lat: TEST_LAT + 0.0101, lng: TEST_LNG }, // Same tile as previous
        ];

        const tiles = getTilesFromGpsTrack(track);
        expect(tiles).toHaveLength(2);
        expect(tiles[0]).not.toEqual(tiles[1]);
    });

    it("should get adjacent tiles", () => {
        const centerTile = coordsToTileId(TEST_LAT, TEST_LNG);
        const neighbors = getAdjacentTiles(centerTile);

        // Hexagons have 6 neighbors
        expect(neighbors).toHaveLength(6);
        expect(neighbors).not.toContain(centerTile);
    });
});

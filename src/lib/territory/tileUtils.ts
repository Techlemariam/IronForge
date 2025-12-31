/**
 * Territory tile utilities using H3 hexagonal spatial indexing
 * 
 * H3 Resolution 8 gives us ~200m hexagons which is ideal for urban running
 * https://h3geo.org/docs/core-library/restable
 */

import {
    latLngToCell,
    cellToLatLng,
    gridDisk,
    greatCircleDistance,
    UNITS,
} from "h3-js";

/** H3 resolution for territory tiles (~200m hexagons) */
export const H3_RESOLUTION = 8;

/** Home zone radius in meters */
export const HOME_ZONE_RADIUS_METERS = 500;

/**
 * Convert lat/lng coordinates to H3 tile ID
 */
export function coordsToTileId(lat: number, lng: number): string {
    return latLngToCell(lat, lng, H3_RESOLUTION);
}

/**
 * Convert H3 tile ID back to center coordinates
 */
export function tileIdToCoords(tileId: string): { lat: number; lng: number } {
    const [lat, lng] = cellToLatLng(tileId);
    return { lat, lng };
}

/**
 * Get all adjacent tiles around a tile (ring of 1)
 */
export function getAdjacentTiles(tileId: string): string[] {
    // gridDisk returns the center tile + neighbors
    // k=1 gives us immediate neighbors only
    const disk = gridDisk(tileId, 1);
    // Remove the center tile to get only neighbors
    return disk.filter((id) => id !== tileId);
}

/**
 * Extract unique tile IDs from a GPS track
 * 
 * @param points Array of GPS coordinates
 * @returns Unique tile IDs in order of first encounter
 */
export function getTilesFromGpsTrack(
    points: Array<{ lat: number; lng: number }>
): string[] {
    if (points.length === 0) return [];

    const seen = new Set<string>();
    const orderedTiles: string[] = [];

    for (const point of points) {
        const tileId = coordsToTileId(point.lat, point.lng);
        if (!seen.has(tileId)) {
            seen.add(tileId);
            orderedTiles.push(tileId);
        }
    }

    return orderedTiles;
}

/**
 * Check if a tile is within the home zone radius
 */
export function isWithinHomeZone(
    tileId: string,
    homeLat: number,
    homeLng: number,
    radiusMeters: number = HOME_ZONE_RADIUS_METERS
): boolean {
    const tileCenter = tileIdToCoords(tileId);
    const distance = greatCircleDistance(
        [homeLat, homeLng],
        [tileCenter.lat, tileCenter.lng],
        UNITS.m
    );
    return distance <= radiusMeters;
}

/**
 * Calculate distance between two tiles in meters
 */
export function getDistanceBetweenTiles(
    tileA: string,
    tileB: string
): number {
    const coordsA = tileIdToCoords(tileA);
    const coordsB = tileIdToCoords(tileB);
    return greatCircleDistance(
        [coordsA.lat, coordsA.lng],
        [coordsB.lat, coordsB.lng],
        UNITS.m
    );
}

/**
 * Get all tiles within a radius from a center point
 * Useful for getting all home zone tiles
 */
export function getTilesInRadius(
    centerLat: number,
    centerLng: number,
    radiusMeters: number
): string[] {
    const centerTile = coordsToTileId(centerLat, centerLng);

    // H3 resolution 8 hexagon edge is ~66m, so radius/66 gives approximate k for gridDisk
    // We add 1 to be safe
    const approximateK = Math.ceil(radiusMeters / 66) + 1;

    const disk = gridDisk(centerTile, approximateK);

    // Filter to only include tiles actually within radius
    return disk.filter((tileId) =>
        isWithinHomeZone(tileId, centerLat, centerLng, radiusMeters)
    );
}

/**
 * Count connected tiles (for adjacency bonus calculation)
 * Uses BFS to find all connected owned tiles
 */
export function countConnectedTiles(
    ownedTileIds: Set<string>,
    startTileId: string
): number {
    if (!ownedTileIds.has(startTileId)) return 0;

    const visited = new Set<string>();
    const queue: string[] = [startTileId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = getAdjacentTiles(current);
        for (const neighbor of neighbors) {
            if (ownedTileIds.has(neighbor) && !visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }

    return visited.size;
}

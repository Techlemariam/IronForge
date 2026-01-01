"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getUserTerritoryStats } from "@/services/game/TerritoryService";
import { MapTile } from "@/features/territory/types";
import { tileIdToCoords } from "@/lib/territory/tileUtils";

/**
 * Get all tiles and stats for the current user's territory view
 */
export async function getTerritoryAppData() {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    const [stats, controlRecords, ownedTiles] = await Promise.all([
        getUserTerritoryStats(userId),
        prisma.tileControl.findMany({
            where: { userId },
            include: {
                tile: {
                    include: {
                        currentOwner: {
                            select: { heroName: true }
                        }
                    }
                }
            }
        }),
        prisma.territoryTile.findMany({
            where: { currentOwnerId: userId },
            include: {
                currentOwner: {
                    select: { heroName: true }
                }
            }
        })
    ]);

    // Map to UI format
    const mapTiles: MapTile[] = controlRecords.map(c => {
        const coords = tileIdToCoords(c.tileId);
        let state: MapTile["state"] = "CONTESTED";

        if (c.tile.currentOwnerId === userId) {
            state = "OWNED";
        } else if (c.tile.currentOwnerId) {
            state = "HOSTILE";
        }

        return {
            id: c.tileId,
            lat: coords.lat,
            lng: coords.lng,
            state,
            controlPoints: c.controlPoints,
            ownerName: c.tile.currentOwner?.heroName || undefined,
            cityName: c.tile.cityName || undefined
        };
    });

    return {
        stats,
        tiles: mapTiles
    };
}

/**
 * Get global or city leaderboards
 */
export async function getTerritoryLeaderboard(cityId?: string) {
    // Aggregated query for leaderboard
    const users = await prisma.user.findMany({
        where: cityId ? { city: cityId } : {},
        select: {
            id: true,
            heroName: true,
            _count: {
                select: { ownedTiles: true }
            }
        },
        orderBy: {
            ownedTiles: {
                _count: "desc"
            }
        },
        take: 20
    });

    return users.map(u => ({
        userId: u.id,
        name: u.heroName || "Unknown Titan",
        ownedTiles: u._count.ownedTiles
    }));
}

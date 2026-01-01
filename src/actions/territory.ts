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

    const [stats, controlRecords, user] = await Promise.all([
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
        prisma.user.findUnique({
            where: { id: userId },
            select: { homeLatitude: true, homeLongitude: true }
        })
    ]);

    const { HOME_ZONE_RADIUS_METERS, isWithinHomeZone } = await import("@/lib/territory/tileUtils");

    // Map to UI format
    const mapTiles: MapTile[] = controlRecords.map(c => {
        const coords = tileIdToCoords(c.tileId);
        let state: MapTile["state"] = "CONTESTED";

        if (c.tile.currentOwnerId === userId) {
            state = "OWNED";
        } else if (c.tile.currentOwnerId) {
            state = "HOSTILE";
        }

        // Home Zone Override
        if (user?.homeLatitude && user?.homeLongitude) {
            if (isWithinHomeZone(c.tileId, user.homeLatitude, user.homeLongitude, HOME_ZONE_RADIUS_METERS)) {
                state = "HOME_ZONE";
            }
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
        tiles: mapTiles,
        homeLocation: user?.homeLatitude && user?.homeLongitude
            ? { lat: user.homeLatitude, lng: user.homeLongitude }
            : null
    };
}

/**
 * Get global or city leaderboards
 */
export async function getTerritoryLeaderboard(cityId?: string) {
    const users = await prisma.user.findMany({
        where: {
            AND: [
                cityId ? { city: cityId } : {},
                {
                    ownedTiles: {
                        some: {} // Only fetch users who own tiles
                    }
                }
            ]
        },
        select: {
            id: true,
            heroName: true,
            city: true,
            _count: {
                select: { ownedTiles: true }
            },
            guild: {
                select: {
                    name: true,
                    tag: true
                }
            }
        },
        orderBy: {
            ownedTiles: {
                _count: "desc"
            }
        },
        take: 50
    });

    return users.map((u, index) => ({
        rank: index + 1,
        userId: u.id,
        name: u.heroName || "Unknown Titan",
        city: u.city,
        ownedTiles: u._count.ownedTiles,
        guildTag: u.guild?.tag
    }));
}

/**
 * Get Guild Leaderboard by aggregated territory
 */
export async function getGuildLeaderboard() {
    // Group by Guild is bit tricky with Prisma alone if we want deep relations
    // But we can fetch guilds and count their members' tiles

    // Efficient approach: Fetch guilds with sum of ownedTiles
    // Note: Prisma doesn't support deep aggregation easily in one go without raw query or grouping
    // We'll use a raw query for performance or a simplified relation fetch

    const guilds = await prisma.guild.findMany({
        select: {
            id: true,
            name: true,
            tag: true,
            members: {
                select: {
                    _count: {
                        select: { ownedTiles: true }
                    }
                }
            }
        }
    });

    // Aggregate in application layer (works fine for < 1000 guilds)
    const guildStats = guilds.map(g => {
        const totalTiles = g.members.reduce((sum, m) => sum + m._count.ownedTiles, 0);
        return {
            id: g.id,
            name: g.name,
            tag: g.tag,
            totalTiles
        };
    });

    // Sort and take top 20
    return guildStats
        .filter(g => g.totalTiles > 0)
        .sort((a, b) => b.totalTiles - a.totalTiles)
        .slice(0, 20)
        .map((g, index) => ({
            rank: index + 1,
            ...g
        }));
}

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { TerritoryService } from "@/services/game/TerritoryService";
import { MapTile } from "@/features/territory/types";
import { tileIdToCoords } from "@/lib/territory/tileUtils";
import { contestTerritoryAction as contestTerritoryInternal, getContestLeaderboardAction as getContestLeaderboardInternal } from "@/actions/guild-actions";
import { z } from "zod";
import { actionClient, authActionClient } from "@/lib/safe-action";

/**
 * Get all tiles and stats for the current user's territory view
 */
export const getTerritoryAppData = authActionClient.action(
    async ({ ctx: { userId } }) => {
        const [stats, controlRecords, user] = await Promise.all([
            TerritoryService.getUserTerritoryStats(userId),
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
);

/**
 * Get global or city leaderboards
 */
const GetTerritoryLeaderboardSchema = z.object({ cityId: z.string().optional() });
export const getTerritoryLeaderboard = actionClient
    .schema(GetTerritoryLeaderboardSchema)
    .action(async ({ parsedInput: { cityId } }) => {
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
    });

/**
 * Get Guild Leaderboard by aggregated territory
 */
export const getGuildLeaderboard = actionClient.action(async () => {
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
});

/**
 * Get World Map (Zones/Territories)
 * Returns all predefined territories (Zones) like "Iron Peaks"
 */
export const getTerritoryMapAction = actionClient.action(async () => {
    try {
        const territories = await prisma.territory.findMany({
            include: {
                controlledBy: {
                    select: { name: true, tag: true }
                }
            }
        });
        return { success: true, data: territories };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

/**
 * Contest a Territory (Zone)
 */
const ContestTerritorySchema = z.object({ territoryId: z.string(), guildId: z.string() });
export const contestTerritoryAction = authActionClient
    .schema(ContestTerritorySchema)
    .action(async ({ parsedInput: { territoryId, guildId }, ctx: { userId } }) => {
        try {
            // Use the service which charges the user
            const result = await contestTerritoryInternal(guildId, territoryId, userId);

            revalidatePath("/territory");
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

/**
 * Get Contest Leaderboard for a Territory
 */
const GetContestLeaderboardSchema = z.object({ territoryId: z.string() });
export const getContestLeaderboardAction = actionClient
    .schema(GetContestLeaderboardSchema)
    .action(async ({ parsedInput: { territoryId } }) => {
        try {
            const leaderboard = await getContestLeaderboardInternal(territoryId);
            return { success: true, data: leaderboard };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });


"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Types
export interface WorldMapData {
    territories: TerritoryWithControl[];
    regions: string[];
    userGuildId: string | null;
}

export interface TerritoryWithControl {
    id: string;
    name: string;
    region: string;
    type: "TRAINING_GROUNDS" | "RESOURCE_NODE" | "FORTRESS";
    bonuses: { xpBonus?: number; goldBonus?: number; defenseBonus?: number };
    coordX: number;
    coordY: number;
    controlledBy: { id: string; name: string; tag: string } | null;
    controlledAt: Date | null;
    contestProgress?: ContestProgress;
}

export interface ContestProgress {
    entries: Array<{
        guildId: string;
        guildName: string;
        totalVolume: number;
        workoutCount: number;
        xpEarned: number;
        averagePerMember: number;
    }>;
    currentWeek: number;
    year: number;
}

// Get current ISO week number
function getISOWeekNumber(date: Date): { week: number; year: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week: weekNo, year: d.getUTCFullYear() };
}

/**
 * Get the full world map with all territories
 */
export async function getWorldMapAction(): Promise<WorldMapData> {
    const session = await getSession();
    if (!session?.user?.id) {
        return { territories: [], regions: [], userGuildId: null };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { guildId: true },
    });

    const { week, year } = getISOWeekNumber(new Date());

    const territories = await prisma.territory.findMany({
        include: {
            controlledBy: {
                select: { id: true, name: true, tag: true },
            },
            contestEntries: {
                where: { weekNumber: week, year },
                orderBy: { totalVolume: "desc" },
            },
        },
        orderBy: [{ region: "asc" }, { name: "asc" }],
    });

    const regions = [...new Set(territories.map((t) => t.region))];

    const territoriesWithProgress: TerritoryWithControl[] = territories.map((t) => ({
        id: t.id,
        name: t.name,
        region: t.region,
        type: t.type,
        bonuses: t.bonuses as TerritoryWithControl["bonuses"],
        coordX: t.coordX,
        coordY: t.coordY,
        controlledBy: t.controlledBy,
        controlledAt: t.controlledAt,
        contestProgress:
            t.contestEntries.length > 0
                ? {
                    entries: t.contestEntries.map((e) => ({
                        guildId: e.guildId,
                        guildName: "", // Populated below
                        totalVolume: e.totalVolume,
                        workoutCount: e.workoutCount,
                        xpEarned: e.xpEarned,
                        averagePerMember: e.memberCount > 0 ? e.totalVolume / e.memberCount : 0,
                    })),
                    currentWeek: week,
                    year,
                }
                : undefined,
    }));

    return {
        territories: territoriesWithProgress,
        regions,
        userGuildId: user?.guildId ?? null,
    };
}

/**
 * Get detailed territory info
 */
export async function getTerritoryDetailsAction(territoryId: string) {
    const territory = await prisma.territory.findUnique({
        where: { id: territoryId },
        include: {
            controlledBy: {
                select: { id: true, name: true, tag: true, level: true },
            },
            history: {
                orderBy: { claimedAt: "desc" },
                take: 10,
            },
            contestEntries: {
                where: {
                    ...getISOWeekNumber(new Date()),
                },
                orderBy: { totalVolume: "desc" },
            },
        },
    });

    return territory;
}

/**
 * Get territories controlled by a guild
 */
export async function getGuildTerritoriesAction(guildId: string) {
    const territories = await prisma.territory.findMany({
        where: { controlledById: guildId },
        include: {
            controlledBy: {
                select: { id: true, name: true, tag: true },
            },
        },
    });

    return territories;
}

/**
 * Record guild activity for territory contest
 * Called when a guild member completes a workout
 */
export async function recordTerritoryActivityAction(input: {
    guildId: string;
    volume: number;
    xp: number;
}) {
    const schema = z.object({
        guildId: z.string().min(1),
        volume: z.number().min(0),
        xp: z.number().min(0),
    });

    const validated = schema.parse(input);
    const { week, year } = getISOWeekNumber(new Date());

    // Get all territories (guild competes for all)
    const territories = await prisma.territory.findMany({
        select: { id: true },
    });

    // Count guild members
    const memberCount = await prisma.user.count({
        where: { guildId: validated.guildId },
    });

    // Upsert contest entry for each territory
    for (const territory of territories) {
        await prisma.territoryContestEntry.upsert({
            where: {
                territoryId_guildId_weekNumber_year: {
                    territoryId: territory.id,
                    guildId: validated.guildId,
                    weekNumber: week,
                    year,
                },
            },
            update: {
                totalVolume: { increment: validated.volume },
                workoutCount: { increment: 1 },
                xpEarned: { increment: validated.xp },
                memberCount,
            },
            create: {
                territoryId: territory.id,
                guildId: validated.guildId,
                weekNumber: week,
                year,
                totalVolume: validated.volume,
                workoutCount: 1,
                xpEarned: validated.xp,
                memberCount,
            },
        });
    }
}

/**
 * Process weekly territory claims (called by cron job)
 * Determines winner for each territory based on weekly activity
 */
export async function processWeeklyTerritoryClaimsAction() {
    const { week, year } = getISOWeekNumber(new Date());
    const lastWeek = week === 1 ? 52 : week - 1;
    const lastYear = week === 1 ? year - 1 : year;

    const territories = await prisma.territory.findMany({
        include: {
            contestEntries: {
                where: { weekNumber: lastWeek, year: lastYear },
                orderBy: { totalVolume: "desc" },
            },
        },
    });

    const results: Array<{
        territoryId: string;
        territoryName: string;
        previousOwner: string | null;
        newOwner: string | null;
        reason: string;
    }> = [];

    for (const territory of territories) {
        const topEntry = territory.contestEntries[0];
        const previousOwner = territory.controlledById;

        if (!topEntry || topEntry.totalVolume === 0) {
            // No activity, territory becomes unclaimed
            if (previousOwner) {
                await prisma.territory.update({
                    where: { id: territory.id },
                    data: { controlledById: null, controlledAt: null },
                });

                // Close history record
                await prisma.territoryHistory.updateMany({
                    where: {
                        territoryId: territory.id,
                        guildId: previousOwner,
                        lostAt: null,
                    },
                    data: { lostAt: new Date() },
                });
            }

            results.push({
                territoryId: territory.id,
                territoryName: territory.name,
                previousOwner,
                newOwner: null,
                reason: "No guild activity",
            });
            continue;
        }

        // Check for tie (second place within 5% of first)
        const secondEntry = territory.contestEntries[1];
        let winner = topEntry;

        if (secondEntry) {
            const diff = (topEntry.totalVolume - secondEntry.totalVolume) / topEntry.totalVolume;
            if (diff < 0.05) {
                // Tiebreaker: average per member
                const topAvg = topEntry.memberCount > 0 ? topEntry.totalVolume / topEntry.memberCount : 0;
                const secondAvg =
                    secondEntry.memberCount > 0 ? secondEntry.totalVolume / secondEntry.memberCount : 0;
                winner = topAvg >= secondAvg ? topEntry : secondEntry;
            }
        }

        // Update territory ownership
        if (winner.guildId !== previousOwner) {
            // Close previous owner's history
            if (previousOwner) {
                await prisma.territoryHistory.updateMany({
                    where: {
                        territoryId: territory.id,
                        guildId: previousOwner,
                        lostAt: null,
                    },
                    data: { lostAt: new Date() },
                });
            }

            // Create new history entry
            await prisma.territoryHistory.create({
                data: {
                    territoryId: territory.id,
                    guildId: winner.guildId,
                    weekNumber: lastWeek,
                    year: lastYear,
                },
            });

            await prisma.territory.update({
                where: { id: territory.id },
                data: {
                    controlledById: winner.guildId,
                    controlledAt: new Date(),
                },
            });
        }

        results.push({
            territoryId: territory.id,
            territoryName: territory.name,
            previousOwner,
            newOwner: winner.guildId,
            reason: `Won with ${winner.totalVolume.toFixed(0)}kg total volume`,
        });
    }

    revalidatePath("/world-map");
    return results;
}

/**
 * Get guild's territory bonuses
 */
export async function getGuildTerritoryBonusesAction(guildId: string) {
    const territories = await prisma.territory.findMany({
        where: { controlledById: guildId },
    });

    let xpBonus = 0;
    let goldBonus = 0;
    let defenseBonus = 0;

    for (const territory of territories) {
        const bonuses = territory.bonuses as TerritoryWithControl["bonuses"];
        xpBonus += bonuses.xpBonus ?? 0;
        goldBonus += bonuses.goldBonus ?? 0;
        defenseBonus += bonuses.defenseBonus ?? 0;
    }

    // Region control bonus (all territories in a region)
    const regions = [...new Set(territories.map((t) => t.region))];
    for (const region of regions) {
        const regionTerritories = await prisma.territory.findMany({
            where: { region },
        });
        const allControlled = regionTerritories.every((t) => t.controlledById === guildId);
        if (allControlled && regionTerritories.length > 0) {
            // +10% bonus for full region control
            xpBonus += 0.1;
            goldBonus += 0.1;
        }
    }

    return {
        xpBonus,
        goldBonus,
        defenseBonus,
        territoriesControlled: territories.length,
        regionsControlled: regions.length,
    };
}

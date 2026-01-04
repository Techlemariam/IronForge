"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPvpRank } from "@/lib/pvpRanks";
import { getCurrentSeasonAction } from "./pvp/ranked";

export type LeaderboardType = "PVP" | "DUEL" | "STRENGTH" | "GUILD";

export interface UnifiedLeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    score: number;
    faction?: string;
    level?: number;
    metadata?: any;
}

/**
 * Main entry point for all leaderboard requests.
 * Consolidates PVP, Duel, Strength (e1RM), and Guild rankings.
 */
export async function getLeaderboardAction(type: LeaderboardType, options: {
    limit?: number;
    exerciseId?: string; // For STRENGTH
    seasonId?: string;   // For PVP
    scope?: "GLOBAL" | "COUNTRY" | "CITY";
    userId?: string;     // To get specific user rank
} = {}) {
    const limit = options.limit || 20;

    let result: UnifiedLeaderboardEntry[] = [];
    switch (type) {
        case "PVP":
            result = await getPvpLeaderboard(options.seasonId, limit);
            break;
        case "DUEL":
            result = await getDuelLeaderboard(limit);
            break;
        case "STRENGTH":
            if (!options.exerciseId) throw new Error("Exercise ID required for strength leaderboard");
            result = await getStrengthLeaderboard(options.exerciseId, limit, options.scope);
            break;
        case "GUILD":
            result = await getGuildLeaderboard(limit);
            break;
        default:
            throw new Error(`Unsupported leaderboard type: ${type}`);
    }

    let userRank = null;
    if (options.userId) {
        const entry = result.find(e => e.userId === options.userId);
        if (entry) {
            userRank = entry.rank;
        }
    }

    return {
        leaderboard: result,
        userRank
    };
}

async function getPvpLeaderboard(seasonId?: string, limit: number = 20) {
    let activeSeasonId = seasonId;
    if (!activeSeasonId) {
        const season = await getCurrentSeasonAction();
        activeSeasonId = season?.id;
    }

    if (!activeSeasonId) return [];

    const ratings = await prisma.pvpRating.findMany({
        where: { seasonId: activeSeasonId },
        orderBy: { rating: 'desc' },
        take: limit,
        include: {
            user: { select: { heroName: true, faction: true, activeTitle: { select: { name: true } } } }
        }
    });

    return ratings.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.user.heroName || "Unknown Titan",
        score: r.rating,
        faction: r.user.faction || "HORDE",
        metadata: {
            peakRating: r.peakRating,
            wins: r.wins,
            losses: r.losses,
            title: r.user.activeTitle?.name
        }
    }));
}

async function getDuelLeaderboard(limit: number = 20) {
    const profiles = await prisma.pvpProfile.findMany({
        orderBy: { duelElo: 'desc' },
        take: limit,
        include: {
            user: { select: { heroName: true, faction: true, level: true } }
        }
    });

    return profiles.map((p, i) => ({
        rank: i + 1,
        userId: p.userId,
        name: p.user.heroName || "Unknown Titan",
        score: p.duelElo,
        faction: p.user.faction || "HORDE",
        level: p.user.level,
        metadata: {
            wins: p.duelsWon,
            losses: p.duelsLost
        }
    }));
}

async function getStrengthLeaderboard(exerciseId: string, limit: number = 20, scope: "GLOBAL" | "COUNTRY" | "CITY" = "GLOBAL") {
    // Note: Reusing logic from segment-leaderboard for now but normalized
    const logs = await prisma.exerciseLog.findMany({
        where: { exerciseId, weight: { gt: 0 } },
        include: { user: { select: { id: true, heroName: true, country: true, city: true, faction: true } } }
    });

    const entries = logs.map(l => ({
        ...l,
        e1rm: (l.weight || 0) * (1 + (l.reps || 0) / 30)
    }));

    // Grouping logic...
    const bestByUser = new Map<string, typeof entries[0]>();
    entries.forEach(e => {
        const existing = bestByUser.get(e.userId);
        if (!existing || e.e1rm > existing.e1rm) bestByUser.set(e.userId, e);
    });

    return Array.from(bestByUser.values())
        .sort((a, b) => b.e1rm - a.e1rm)
        .slice(0, limit)
        .map((e, i) => ({
            rank: i + 1,
            userId: e.userId,
            name: e.user.heroName || "Unknown Titan",
            score: Math.round(e.e1rm),
            faction: e.user.faction || "HORDE",
            metadata: {
                date: e.date,
                exerciseId: e.exerciseId
            }
        }));
}

async function getGuildLeaderboard(limit: number = 20) {
    const guilds = await prisma.guild.findMany({
        orderBy: { powerRating: 'desc' },
        take: limit,
        include: {
            _count: { select: { members: true } }
        }
    });

    return guilds.map((g, i) => ({
        rank: i + 1,
        userId: g.id, // Using guild ID for guilds
        name: g.name,
        score: g.powerRating,
        metadata: {
            tag: g.tag,
            memberCount: g._count.members
        }
    }));
}

/**
 * Get user's rankings across all exercises.
 */
export async function getUserRankingsAction(userId: string): Promise<{
    globalRanks: { exerciseId: string; rank: number; score: number }[];
    medalCount: { gold: number; silver: number; bronze: number };
}> {
    try {
        const userLogs = await prisma.exerciseLog.findMany({
            where: { userId, weight: { gt: 0 } },
        });

        const exerciseIds = [...new Set(userLogs.map(l => l.exerciseId))];
        const rankings: { exerciseId: string; rank: number; score: number }[] = [];
        let gold = 0, silver = 0, bronze = 0;

        for (const exerciseId of exerciseIds) {
            const { leaderboard, userRank } = await getLeaderboardAction("STRENGTH", {
                exerciseId,
                scope: "GLOBAL",
                userId
            });

            if (userRank) {
                const logsForEx = userLogs.filter(l => l.exerciseId === exerciseId);
                const bestE1rm = Math.max(...logsForEx.map(l => (l.weight || 0) * (1 + (l.reps || 0) / 30)));

                rankings.push({
                    exerciseId,
                    rank: userRank,
                    score: Math.round(bestE1rm)
                });

                if (userRank === 1) gold++;
                else if (userRank === 2) silver++;
                else if (userRank === 3) bronze++;
            }
        }

        return {
            globalRanks: rankings.sort((a, b) => a.rank - b.rank),
            medalCount: { gold, silver, bronze },
        };
    } catch (error) {
        console.error("Error fetching user rankings:", error);
        return { globalRanks: [], medalCount: { gold: 0, silver: 0, bronze: 0 } };
    }
}


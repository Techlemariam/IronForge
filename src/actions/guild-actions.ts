"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";

// --- Constants ---
const CONTEST_COST_GOLD = 1000;

// --- Helper Functions ---
function getISOWeek(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// --- Schemas ---

const contestTerritorySchema = z.object({
    guildId: z.string(),
    territoryId: z.string(),
    userId: z.string(),
});

const recordActivitySchema = z.object({
    guildId: z.string(),
    territoryId: z.string(),
    metrics: z.object({
        volume: z.number(),
        xp: z.number(),
    }),
});

// --- Actions ---

export async function contestTerritoryAction(guildId: string, territoryId: string, userId: string) {
    const parsed = contestTerritorySchema.safeParse({ guildId, territoryId, userId });
    if (!parsed.success) {
        throw new Error("Invalid input: " + parsed.error.message);
    }

    const territory = await prisma.territory.findUnique({ where: { id: territoryId } });
    if (!territory) throw new Error("Territory not found");

    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();

    const existingEntry = await prisma.territoryContestEntry.findUnique({
        where: {
            territoryId_guildId_weekNumber_year: {
                territoryId,
                guildId,
                weekNumber,
                year
            }
        }
    });

    if (existingEntry) throw new Error("Already contesting this territory this week");

    // Charge User
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user || user.gold < CONTEST_COST_GOLD) {
            throw new Error(`Insufficient gold. Requires ${CONTEST_COST_GOLD} Gold.`);
        }

        await tx.user.update({
            where: { id: userId },
            data: { gold: { decrement: CONTEST_COST_GOLD } }
        });

        return await tx.territoryContestEntry.create({
            data: {
                territoryId,
                guildId,
                weekNumber,
                year,
                workoutCount: 0,
                totalVolume: 0,
                xpEarned: 0,
            }
        });
    });
}

export async function recordActivityAction(guildId: string, territoryId: string, metrics: { volume: number; xp: number }) {
    const parsed = recordActivitySchema.safeParse({ guildId, territoryId, metrics });
    if (!parsed.success) {
        // In critical loop, usually log error, but throwing is fine for action
        throw new Error("Invalid input");
    }

    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();

    const entry = await prisma.territoryContestEntry.findUnique({
        where: {
            territoryId_guildId_weekNumber_year: {
                territoryId,
                guildId,
                weekNumber,
                year
            }
        }
    });

    if (entry) {
        return prisma.territoryContestEntry.update({
            where: { id: entry.id },
            data: {
                workoutCount: { increment: 1 },
                totalVolume: { increment: metrics.volume },
                xpEarned: { increment: metrics.xp }
            }
        });
    }
}

export async function getContestLeaderboardAction(territoryId: string) {
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();

    const entries = await prisma.territoryContestEntry.findMany({
        where: {
            territoryId,
            weekNumber,
            year
        },
        orderBy: {
            xpEarned: 'desc'
        }
    });

    const guildIds = entries.map(e => e.guildId);
    const guilds = await prisma.guild.findMany({
        where: { id: { in: guildIds } },
        select: { id: true, name: true, tag: true }
    });

    const guildMap = new Map(guilds.map(g => [g.id, g]));

    return entries.map(e => ({
        ...e,
        guildName: guildMap.get(e.guildId)?.name || 'Unknown Guild',
        guildTag: guildMap.get(e.guildId)?.tag || '???'
    }));
}

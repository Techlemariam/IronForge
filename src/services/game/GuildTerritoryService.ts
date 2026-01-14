import prisma from "@/lib/prisma";
import { TerritoryType } from "@prisma/client";

export const CONTEST_COST_GOLD = 1000;

export class GuildTerritoryService {
    /**
     * Allows a guild to enter a contest for a territory.
     * Deducts gold from Guild bank (if implemented) or Leader (for now).
     * Actually, let's assume Guild has gold. Schema check: Guild has `xp`, but no `gold` field in schema provided earlier?
     * Checking schema provided in context... Guild model has `xp`, `level`, `powerRating`. No `gold`.
     * For Phase 1, we might waive the cost or charge the Leader.
     * Plan says "Contest Cost: 1000; // Guild gold".
     * Let's charge the LEADER for now as a proxy, or add gold to Guild later.
     * Spec says "Guild gold to contest". Let's assume we charge the accessing user (Leader/Officer) for now.
     */
    static async contestTerritory(guildId: string, territoryId: string, userId: string) {
        const territory = await prisma.territory.findUnique({ where: { id: territoryId } });
        if (!territory) throw new Error("Territory not found");

        // Check if already contesting this week
        const now = new Date();
        // get ISO week
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

        // Charge Leader (User) - Transaction
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

    /**
     * Records activity from a guild member towards a territory.
     * Should be called when a workout finishes if the user is in a guild and in a territory being contested.
     */
    static async recordActivity(guildId: string, territoryId: string, metrics: { volume: number; xp: number }) {
        const now = new Date();
        const weekNumber = getISOWeek(now);
        const year = now.getFullYear();

        // Only update if there is an active contest entry
        // We don't throw if not found, just ignore (not contesting)
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
            await prisma.territoryContestEntry.update({
                where: { id: entry.id },
                data: {
                    workoutCount: { increment: 1 },
                    totalVolume: { increment: metrics.volume },
                    xpEarned: { increment: metrics.xp }
                }
            });
        }
    }

    /**
     * Gets the current leaderboard for a territory contest (active week).
     */
    static async getContestLeaderboard(territoryId: string) {
        const now = new Date();
        const weekNumber = getISOWeek(now);
        const year = now.getFullYear();

        const entries = await prisma.territoryContestEntry.findMany({
            where: {
                territoryId,
                weekNumber,
                year
            },
            include: {
                // Include Guild info locally if needed, but schema relations might be minimal?
                // TerritoryContestEntry has guildId. We don't have a direct relation in schema shown in context?
                // "guildId String". "territory Territory @relation..."
                // Wait, schema check:
                // model TerritoryContestEntry { ... guildId String ... territory Territory ... }
                // It does NOT show a `guild Guild` relation in the provided schema snippet!
                // Line 733: "guildId String"
                // Line 743: "territory Territory..."
                // Missing `guild Guild @relation...`?
                // Let's rely on manual fetch or assume relation exists (it should).
                // Actually, checking schema provided:
                // Guild model (line 676) has `territories Territory[]`.
                // TerritoryContestEntry (line 730) has ONLY `territory`.
                // This suggests a missing relation in TerritoryContestEntry for `guild`.
                // I should use `guildId` to fetch guild details separately or fixing schema is out of scope for now?
                // I'll fetch entries then fetch guilds.
            },
            orderBy: {
                xpEarned: 'desc' // Default metric
            }
        });

        // Manually join Guild names
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
}

// Helper for ISO Week
function getISOWeek(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

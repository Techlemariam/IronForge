import { prisma } from '@/lib/prisma';

export interface TerritoryMapState {
    territories: {
        id: string;
        name: string;
        region: string;
        type: string;
        coordX: number;
        coordY: number;
        controlledBy: string | null;
        controlledByName: string | null;
        influencePoints: number;
    }[];
}

export class TerritoryControlService {
    /**
     * Returns the current state of all territories for map rendering.
     */
    static async getMapState(): Promise<TerritoryMapState> {
        const now = new Date();
        const weekNumber = this.getISOWeek(now);
        const year = now.getFullYear();

        const territories = await prisma.territory.findMany({
            include: {
                controlledBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Batch fetch all contest entries for these territories for the current week
        // We only care about the entry of the CONTROLLING guild to show their strength/influence
        const controlledTerritories = territories.filter(t => t.controlledById);

        let influenceMap = new Map<string, number>();

        if (controlledTerritories.length > 0) {
            const entries = await prisma.territoryContestEntry.findMany({
                where: {
                    weekNumber,
                    year,
                    territoryId: { in: controlledTerritories.map(t => t.id) },
                    // Optimization: We could filter by guildId too, but a territory has many entries.
                    // We need the entry specifically for the controlling guild.
                }
            });

            // Build map: TerritoryId -> Influence Score of Controller
            entries.forEach(e => {
                const territory = territories.find(t => t.id === e.territoryId);
                // Only count the influence if this entry belongs to the current controller
                if (territory && territory.controlledById === e.guildId) {
                    influenceMap.set(territory.id, e.totalVolume + e.xpEarned);
                }
            });
        }

        return {
            territories: territories.map(t => ({
                id: t.id,
                name: t.name,
                region: t.region,
                type: t.type,
                coordX: t.coordX,
                coordY: t.coordY,
                controlledBy: t.controlledById,
                controlledByName: t.controlledBy?.name || null,
                influencePoints: influenceMap.get(t.id) || 0
            }))
        };
    }

    /**
     * Calculates the total influence a guild has over a territory for the current week.
     */
    static async calculateInfluence(guildId: string, territoryId: string): Promise<number> {
        const now = new Date();
        const weekNumber = this.getISOWeek(now);
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

        if (!entry) return 0;

        // Influence = Total Volume (kg) + XP Earned
        return entry.totalVolume + entry.xpEarned;
    }

    /**
     * Processes conquest for a territory. Awards control to the guild with the highest influence.
     */
    static async processConquest(territoryId: string): Promise<void> {
        const now = new Date();
        const weekNumber = this.getISOWeek(now);
        const year = now.getFullYear();

        // Get all contest entries for this territory this week
        // Also fetch current owner to notify loss (optional enhancement)
        const currentTerritory = await prisma.territory.findUnique({
            where: { id: territoryId },
            select: { controlledById: true }
        });

        const entries = await prisma.territoryContestEntry.findMany({
            where: {
                territoryId,
                weekNumber,
                year
            },
            orderBy: {
                totalVolume: 'desc' // Simple: highest volume wins
            },
            take: 1
        });

        if (entries.length === 0) return;

        const winner = entries[0];

        // Update territory control
        await prisma.territory.update({
            where: { id: territoryId },
            data: {
                controlledById: winner.guildId,
                controlledAt: new Date()
            }
        });

        // Log history
        await prisma.territoryHistory.create({
            data: {
                territoryId,
                guildId: winner.guildId,
                weekNumber,
                year
            }
        });

        // Notify Guild Members (New Owner)
        await this.notifyGuildMembers(winner.guildId, "VICTORY", `Our guild has conquered territory!`);

        // Notify Previous Owner Members (if any)
        // Note: We need to know previous owner. Since we already updated, this is tricky unless we fetched before.
        // For V1 mechanics, we focus on the Winner notification.
    }

    /**
     * Calculates active bonuses for a user based on their guild's controlled territories.
     * Returns a composite bonus object.
     */
    static async getActiveTerritoryBonuses(userId: string): Promise<{ xpMultiplier: number; goldMultiplier: number }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { guildId: true }
        });

        if (!user || !user.guildId) {
            return { xpMultiplier: 1.0, goldMultiplier: 1.0 };
        }

        const territories = await prisma.territory.findMany({
            where: { controlledById: user.guildId }
        });

        let xpBonus = 0;
        let goldBonus = 0;

        // Aggregate bonuses
        // Bonuses stored as Json: { xpBonus: 0.05, goldBonus: 0.02 }
        for (const t of territories) {
            const bonuses = t.bonuses as { xpBonus?: number; goldBonus?: number } | null;
            if (bonuses) {
                if (bonuses.xpBonus) xpBonus += bonuses.xpBonus;
                if (bonuses.goldBonus) goldBonus += bonuses.goldBonus;
            }
        }

        // Cap bonuses (e.g. max 50% bonus)
        const MAX_BONUS = 0.5;
        xpBonus = Math.min(xpBonus, MAX_BONUS);
        goldBonus = Math.min(goldBonus, MAX_BONUS);

        return {
            xpMultiplier: 1.0 + xpBonus,
            goldMultiplier: 1.0 + goldBonus
        };
    }

    private static async notifyGuildMembers(guildId: string, type: string, message: string) {
        // Fetch all members
        const members = await prisma.user.findMany({
            where: { guildId },
            select: { id: true }
        });

        // Batch create notifications
        // Note: prisma.notification.createMany is supported in recent versions
        if (members.length > 0) {
            await prisma.notification.createMany({
                data: members.map(m => ({
                    userId: m.id,
                    type: "TERRITORY_UPDATE",
                    message,
                    read: false,
                    createdAt: new Date()
                }))
            });
        }
    }

    /**
     * Helper: Get ISO week number.
     */
    private static getISOWeek(date: Date): number {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    }
}

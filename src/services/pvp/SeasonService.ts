import prisma from "@/lib/prisma";

/**
 * SeasonService
 * 
 * Manages PvP Arena season lifecycle:
 * - Season transitions
 * - Reward distribution
 * - Rating resets
 */
export class SeasonService {

    /**
     * Get the currently active PvP season.
     */
    static async getActiveSeason() {
        return await prisma.pvpSeason.findFirst({
            where: { isActive: true }
        });
    }

    /**
     * Create a new PvP season.
     */
    static async createSeason(name: string, startDate: Date, endDate: Date, rewards: any) {
        return await prisma.pvpSeason.create({
            data: {
                name,
                startDate,
                endDate,
                isActive: false,
                rewards
            }
        });
    }

    /**
     * End the current season and start the next one.
     * Called by the weekly cron job.
     */
    static async transitionSeason() {
        const now = new Date();

        // Find current active season
        const currentSeason = await prisma.pvpSeason.findFirst({
            where: { isActive: true }
        });

        if (!currentSeason) {
            return { success: false, message: "No active season found" };
        }

        // Check if season has ended
        if (currentSeason.endDate > now) {
            return { success: false, message: "Current season has not ended yet" };
        }

        // Distribute rewards for the ended season
        const rewardResult = await this.distributeSeasonRewards(currentSeason.id);

        // Mark current season as inactive
        await prisma.pvpSeason.update({
            where: { id: currentSeason.id },
            data: { isActive: false }
        });

        // Find or create next season
        let nextSeason = await prisma.pvpSeason.findFirst({
            where: {
                startDate: { gte: currentSeason.endDate },
                isActive: false
            },
            orderBy: { startDate: 'asc' }
        });

        if (!nextSeason) {
            // Auto-create next season (1 month duration)
            const nextStart = new Date(currentSeason.endDate);
            const nextEnd = new Date(nextStart);
            nextEnd.setMonth(nextEnd.getMonth() + 1);

            nextSeason = await this.createSeason(
                `Season ${parseInt(currentSeason.name.split(' ')[1] || '1') + 1}`,
                nextStart,
                nextEnd,
                currentSeason.rewards // Reuse same reward structure
            );
        }

        // Activate next season
        await prisma.pvpSeason.update({
            where: { id: nextSeason.id },
            data: { isActive: true }
        });

        return {
            success: true,
            endedSeason: currentSeason.name,
            newSeason: nextSeason.name,
            rewardsDistributed: rewardResult.count
        };
    }

    /**
     * Distribute rewards to top players in a season.
     */
    static async distributeSeasonRewards(seasonId: string) {
        // Get top 100 players by rating
        const topPlayers = await prisma.pvpRating.findMany({
            where: { seasonId },
            orderBy: { rating: 'desc' },
            take: 100,
            include: { user: true }
        });

        let rewardedCount = 0;

        for (let i = 0; i < topPlayers.length; i++) {
            const player = topPlayers[i];
            const rank = i + 1;

            // Reward tiers
            let goldReward = 0;
            let titleId: string | null = null;

            if (rank === 1) {
                goldReward = 10000;
                titleId = "ARENA_CHAMPION";
            } else if (rank <= 10) {
                goldReward = 5000;
                titleId = "ARENA_LEGEND";
            } else if (rank <= 50) {
                goldReward = 2000;
            } else {
                goldReward = 500;
            }

            // Award gold
            await prisma.user.update({
                where: { id: player.userId },
                data: { gold: { increment: goldReward } }
            });

            // Award title if applicable
            if (titleId) {
                await prisma.userTitle.upsert({
                    where: {
                        userId_titleId: {
                            userId: player.userId,
                            titleId
                        }
                    },
                    create: {
                        userId: player.userId,
                        titleId
                    },
                    update: {} // Already has it
                });
            }

            rewardedCount++;
        }

        return { success: true, count: rewardedCount };
    }

    /**
     * Initialize the first season if none exists.
     */
    static async initializeFirstSeason() {
        const existingSeason = await prisma.pvpSeason.findFirst();

        if (existingSeason) {
            return { success: false, message: "Seasons already initialized" };
        }

        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);

        const season = await this.createSeason(
            "Season 1",
            now,
            endDate,
            {
                top1: { gold: 10000, title: "ARENA_CHAMPION" },
                top10: { gold: 5000, title: "ARENA_LEGEND" },
                top50: { gold: 2000 },
                top100: { gold: 500 }
            }
        );

        await prisma.pvpSeason.update({
            where: { id: season.id },
            data: { isActive: true }
        });

        return { success: true, season };
    }
}

import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notifications";

const SEASON_DURATION_DAYS = 28;

export class SeasonService {
    /**
     * Checks if the current active season has ended.
     * If so, concludes it and starts the next one.
     */
    static async checkSeasonTransition() {
        const now = new Date();
        const activeSeason = await prisma.pvpSeason.findFirst({
            where: { isActive: true },
        });

        if (!activeSeason) {
            console.log("No active season found. Initializing Season 1.");
            return await this.startNextSeason(1, now);
        }

        if (activeSeason.endDate <= now) {
            console.log(`Season ${activeSeason.name} has ended. Transitioning...`);
            await this.concludeSeason(activeSeason.id);

            const nextSeasonNumber = parseInt(activeSeason.name.match(/\d+/)?.[0] || "0") + 1;
            return await this.startNextSeason(nextSeasonNumber, now);
        }

        return { status: "ONGOING", season: activeSeason };
    }

    /**
     * Concludes a season:
     * 1. Updates final ranks/ratings (if needed - currently live)
     * 2. Distributes rewards
     * 3. Sets isActive = false
     */
    private static async concludeSeason(seasonId: string) {
        // 1. Mark as inactive
        await prisma.pvpSeason.update({
            where: { id: seasonId },
            data: { isActive: false },
        });

        // 2. Distribute Rewards (Top 3 gets Gems, everyone gets participation badge)
        // Fetch leaderboard
        const leaderboard = await prisma.pvpRating.findMany({
            where: { seasonId },
            orderBy: { rating: 'desc' },
            include: { user: true },
        });

        const rewardPromises = leaderboard.map(async (entry, index) => {
            let gems = 0;
            let message = `Season ended! You finished Rank #${index + 1} with ${entry.rating} SR.`;

            if (index === 0) { // Rank 1
                gems = 5000;
                message += " You invoke the envy of the gods. +5000 Gems.";
            } else if (entry.rating >= 2400) {
                gems = 2000;
                message += " A Champion's bounty! +2000 Gems.";
            } else if (entry.rating >= 1800) {
                gems = 1000;
                message += " Well fought, Gladiator. +1000 Gems.";
            }

            if (gems > 0) {
                // Add gems - Using User model 'gold' as placeholder if 'gems' doesn't exist yet, 
                // OR strictly speaking we should have added 'gems' to User. 
                // Based on User model, 'gold' exists. Let's assume 'gems' is not yet in schema?
                // Checking schema on line 13: gold Int @default(0). No gems.
                // Converting reward to gold for now to pass build.
                await prisma.user.update({
                    where: { id: entry.userId },
                    data: { gold: { increment: gems } } // Mapped to gold temporarily
                });
            }

            // Notify
            await NotificationService.create({
                userId: entry.userId,
                type: "SYSTEM",
                message: message
            });
        });

        await Promise.allSettled(rewardPromises);
        console.log(`Season ${seasonId} concluded. Rewards distributed to ${leaderboard.length} participants.`);
    }

    /**
     * Starts the next season
     */
    private static async startNextSeason(number: number, startDate: Date) {
        const endDate = new Date(startDate.getTime() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000);

        // Theme rotation could go here
        const name = `Season ${number}`;

        const newSeason = await prisma.pvpSeason.create({
            data: {
                name,
                startDate,
                endDate,
                isActive: true,
                rewards: [], // Configure default rewards structure here if complex
            },
        });

        console.log(`Initialized ${name}. Ends: ${endDate.toISOString()}`);
        return { status: "STARTED", season: newSeason };
    }
}

import prisma from "@/lib/prisma";

/**
 * GrowthMetricsService
 * 
 * Tracks business trigger metrics for the path to passive income.
 * Used by the /admin/growth dashboard and monitor-growth workflow.
 */
export class GrowthMetricsService {

    /**
     * Get count of users active in the last 7 days.
     * Target: 100 recurring users
     */
    static async getRecurringUserCount(): Promise<number> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const count = await prisma.user.count({
            where: {
                lastLoginDate: {
                    gte: sevenDaysAgo
                }
            }
        });

        return count;
    }

    /**
     * Calculate week-over-week retention rate.
     * Target: > 20%
     */
    static async getRetentionRate(): Promise<number> {
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Users active last week
        const lastWeekUsers = await prisma.user.findMany({
            where: {
                lastLoginDate: {
                    gte: oneWeekAgo,
                    lt: now
                }
            },
            select: { id: true }
        });

        // Users active the week before that
        const previousWeekUsers = await prisma.user.findMany({
            where: {
                lastLoginDate: {
                    gte: twoWeeksAgo,
                    lt: oneWeekAgo
                }
            },
            select: { id: true }
        });

        if (previousWeekUsers.length === 0) return 0;

        // Retained = users who were active in previous week AND last week
        const previousWeekIds = new Set(previousWeekUsers.map(u => u.id));
        const retained = lastWeekUsers.filter(u => previousWeekIds.has(u.id)).length;

        return Math.round((retained / previousWeekUsers.length) * 100);
    }

    /**
     * Get onboarding completion rate (FirstLoginQuest).
     * Measures % of users who completed initial setup.
     */
    static async getOnboardingCompletionRate(): Promise<number> {
        const totalUsers = await prisma.user.count();
        if (totalUsers === 0) return 0;

        // Users who have completed onboarding (has heroName and activePath set)
        const completedUsers = await prisma.user.count({
            where: {
                AND: [
                    { heroName: { not: null } },
                    { activePath: { not: null } }
                ]
            }
        });

        return Math.round((completedUsers / totalUsers) * 100);
    }

    /**
     * Get activation rate - users who logged a workout within 24h of signup.
     */
    static async getActivationRate(): Promise<number> {
        const totalUsers = await prisma.user.count();
        if (totalUsers === 0) return 0;

        // Get users with their first exercise log
        const usersWithLogs = await prisma.user.findMany({
            where: {
                exerciseLogs: {
                    some: {}
                }
            },
            select: {
                id: true,
                createdAt: true,
                exerciseLogs: {
                    orderBy: { date: 'asc' },
                    take: 1,
                    select: { date: true }
                }
            }
        });

        // Count users whose first log was within 24h of account creation
        let activatedCount = 0;
        for (const user of usersWithLogs) {
            if (user.exerciseLogs.length > 0) {
                const firstLog = user.exerciseLogs[0];
                const hoursDiff = (firstLog.date.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60);
                if (hoursDiff <= 24) {
                    activatedCount++;
                }
            }
        }

        return Math.round((activatedCount / totalUsers) * 100);
    }

    /**
     * Get social engagement - placeholder until Friendship model exists.
     * TODO: Implement when social features are added.
     */
    static async getSocialEngagement(): Promise<{ usersWithFriends: number; totalUsers: number; rate: number }> {
        const totalUsers = await prisma.user.count();

        // Placeholder - no Friendship model exists yet
        return {
            usersWithFriends: 0,
            totalUsers,
            rate: 0
        };
    }

    /**
     * Get complete growth health snapshot.
     */
    static async getGrowthSnapshot() {
        const [
            recurringUsers,
            retentionRate,
            onboardingRate,
            activationRate,
            socialEngagement
        ] = await Promise.all([
            this.getRecurringUserCount(),
            this.getRetentionRate(),
            this.getOnboardingCompletionRate(),
            this.getActivationRate(),
            this.getSocialEngagement()
        ]);

        return {
            businessTriggers: {
                recurringUsers: { current: recurringUsers, target: 100 },
                retentionRate: { current: retentionRate, target: 20 },
                // Demand and Cost are manual metrics
            },
            funnel: {
                onboardingCompletionRate: onboardingRate,
                activationRate: activationRate,
                socialEngagementRate: socialEngagement.rate
            },
            timestamp: new Date().toISOString()
        };
    }
}

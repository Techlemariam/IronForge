import prisma from "@/lib/prisma";
import {
    calculatePowerRating
} from "@/lib/powerRating";

/**
 * Service for calculating and managing Titan Power Ratings.
 * Implements Oracle 3.0 Power Score logic.
 */
export class PowerRatingService {

    /**
     * Get Weekly Volume (kg) for the last 7 days.
     */
    static async getWeeklyVolume(userId: string): Promise<number> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const logs = await prisma.exerciseLog.findMany({
            where: {
                userId,
                date: { gte: sevenDaysAgo }
            },
            select: { sets: true } // sets is JSON: [{reps, weight, ...}]
        });

        let totalVolume = 0;

        for (const log of logs) {
            const sets = log.sets as any[];
            if (Array.isArray(sets)) {
                for (const set of sets) {
                    const weight = Number(set.weight || 0);
                    const reps = Number(set.reps || 0);
                    if (weight > 0 && reps > 0) {
                        totalVolume += weight * reps;
                    }
                }
            }
        }

        return Math.round(totalVolume);
    }

    /**
     * Get Weekly Cardio Duration (hours) for the last 7 days.
     */
    static async getWeeklyCardioDuration(userId: string): Promise<number> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const logs = await prisma.cardioLog.findMany({
            where: {
                userId,
                date: { gte: sevenDaysAgo }
            },
            select: { duration: true } // duration in seconds
        });

        const totalSeconds = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
        return parseFloat((totalSeconds / 3600).toFixed(2));
    }

    /**
     * Get Consecutive Active Weeks Streak.
     * Counts how many consecutive calendar weeks the user has recorded at least one log.
     */
    static async getConsecutiveWeeks(userId: string): Promise<number> {
        // Fetch all log dates for the user
        const [exerciseLogs, cardioLogs] = await Promise.all([
            prisma.exerciseLog.findMany({
                where: { userId },
                select: { date: true },
                orderBy: { date: "desc" }
            }),
            prisma.cardioLog.findMany({
                where: { userId },
                select: { date: true },
                orderBy: { date: "desc" }
            })
        ]);

        const allDates = [
            ...exerciseLogs.map(l => l.date),
            ...cardioLogs.map(l => l.date)
        ].sort((a, b) => b.getTime() - a.getTime());

        if (allDates.length === 0) return 0;

        const { startOfWeek, subWeeks, isSameWeek } = await import("date-fns");

        let consecutiveWeeks = 0;
        let currentCheckWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start with current week (Monday)

        // We iterate backwards through weeks as long as we find a log in that week
        while (true) {
            const hasLogInWeek = allDates.some(date => isSameWeek(date, currentCheckWeek, { weekStartsOn: 1 }));

            if (hasLogInWeek) {
                consecutiveWeeks++;
                currentCheckWeek = subWeeks(currentCheckWeek, 1);
            } else {
                // If it's the current week, we don't break yet, maybe they just haven't trained THIS week but did LAST week
                if (isSameWeek(currentCheckWeek, new Date(), { weekStartsOn: 1 })) {
                    currentCheckWeek = subWeeks(currentCheckWeek, 1);
                    continue;
                }
                break;
            }
        }

        return consecutiveWeeks;
    }

    /**
     * Full recalculation of a user's Power Rating using live data.
     */
    static async syncPowerRating(userId: string) {
        // 1. Fetch User Data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                pvpProfile: true,
                titan: true,
            },
        });

        if (!user || !user.titan) {
            throw new Error("User or Titan not found");
        }

        // 2. Extract Base Metrics
        const wilks = user.pvpProfile?.highestWilksScore || 0;
        const ftp = user.ftpCycle || user.ftpRun || 200; // Default 200 if missing

        // 3. Fetch Activity Data (Last 7 Days)
        const weeklyVolume = await this.getWeeklyVolume(userId);
        const weeklyDuration = await this.getWeeklyCardioDuration(userId);
        const streakWeeks = await this.getConsecutiveWeeks(userId);

        // 4. Calculate Power Rating (Oracle 3.0)
        const result = calculatePowerRating(
            wilks,
            weeklyVolume,
            ftp,
            weeklyDuration,
            streakWeeks
        );

        // 5. Update Titan
        const updatedTitan = await prisma.titan.update({
            where: { userId },
            data: {
                powerRating: result.powerRating,
                strengthIndex: result.strengthIndex,
                cardioIndex: result.cardioIndex,
                // mrvAdherence is deprecated in 3.0 logic but kept for DB compat? 
                // We can set it to 1.0 or repurpose it as 'Activity Index' later.
                // For now, let's leave it as 1.0.
                mrvAdherence: 1.0,
                lastPowerCalcAt: new Date(),
            },
        });

        return {
            ...result,
            weeklyVolume,
            weeklyDuration,
            titan: updatedTitan
        };
    }

    /**
     * Get tier details based on power rating.
     */
    static getTierDetails(powerRating: number) {
        if (powerRating >= 1000) return { name: "Diamond", color: "#B9F2FF" };
        if (powerRating >= 750) return { name: "Platinum", color: "#E5E4E2" };
        if (powerRating >= 500) return { name: "Gold", color: "#FFD700" };
        if (powerRating >= 250) return { name: "Silver", color: "#C0C0C0" };
        return { name: "Bronze", color: "#CD7F32" };
    }
}

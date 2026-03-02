import prisma from "@/lib/prisma";
import {
    calculatePowerRating
} from "@/lib/powerRating";

/**
 * Interface for a single set within an exercise log.
 */
interface WorkoutSet {
    reps?: number | string;
    weight?: number | string;
}

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
            const sets = log.sets as unknown as WorkoutSet[];
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
        const { startOfWeek, subWeeks, getISOWeek, getISOWeekYear } = await import("date-fns");

        // Caching week-year keys for performance. Streak bonus caps at 10, so we only need ~15 weeks of data maximum
        // to determine if the current streak is at least 10.
        const [exerciseLogs, cardioLogs] = await Promise.all([
            prisma.exerciseLog.findMany({
                where: { userId },
                select: { date: true },
                orderBy: { date: "desc" },
                take: 100 // Optimization: We don't need all training history for a 10-week cap
            }),
            prisma.cardioLog.findMany({
                where: { userId },
                select: { date: true },
                orderBy: { date: "desc" },
                take: 100
            })
        ]);

        const logWeeksSet = new Set<string>();
        const appendToSet = (date: Date) => {
            const week = getISOWeek(date);
            const year = getISOWeekYear(date);
            logWeeksSet.add(`${year}-W${week}`);
        };

        exerciseLogs.forEach(l => appendToSet(l.date));
        cardioLogs.forEach(l => appendToSet(l.date));

        if (logWeeksSet.size === 0) return 0;

        let consecutiveWeeks = 0;
        let currentCheckDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        const now = new Date();

        while (true) {
            const week = getISOWeek(currentCheckDate);
            const year = getISOWeekYear(currentCheckDate);
            const key = `${year}-W${week}`;

            if (logWeeksSet.has(key)) {
                consecutiveWeeks++;
                currentCheckDate = subWeeks(currentCheckDate, 1);
            } else {
                // Grace Period: If no log this week, but it's the current week, continue to last week
                const isCurrentWeek = getISOWeek(now) === week && getISOWeekYear(now) === year;
                if (isCurrentWeek) {
                    currentCheckDate = subWeeks(currentCheckDate, 1);
                    continue;
                }
                break;
            }

            // Safety break: Consistency bonus caps at 10, no need to count forever
            if (consecutiveWeeks >= 20) break;
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
                // mrvAdherence is deprecated in 3.0 logic but kept for database compatibility.
                // Defaults to 1.0 (perfect adherence).
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
        if (powerRating >= 500) return { name: "Gold", color: "var(--color-gold-bright)" };
        if (powerRating >= 250) return { name: "Silver", color: "#C0C0C0" };
        return { name: "Bronze", color: "#CD7F32" };
    }
}


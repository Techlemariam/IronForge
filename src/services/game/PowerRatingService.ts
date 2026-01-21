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
     * Get Consecutive Weeks Streak.
     * Uses user.loginStreak or titan.streak as a proxy for now, 
     * or counts active weeks from logs.
     * MVP: Use Titan Streak / 7 if available, otherwise 0.
     * 
     * Actually, let's calculate it accurately from logs if possible, 
     * or fallback to `titan.streak` (which tracks daily logins) / 7.
     */
    static async getConsecutiveWeeks(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { loginStreak: true } // Daily login streak
        });

        // MVP Proxy: Streak Days / 7
        return user ? Math.floor(user.loginStreak / 7) : 0;
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
}

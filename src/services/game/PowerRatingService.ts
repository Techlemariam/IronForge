import prisma from "@/lib/prisma";
import {
    calculatePowerRating,
    TrainingPath
} from "@/lib/powerRating";
import { TrainingContextService } from "@/services/data/TrainingContextService";

/**
 * Service for calculating and managing Titan Power Ratings.
 * Combines Strength (Wilks), Cardio (Watts/kg), and Adherence (MRV/Consistency).
 */
export class PowerRatingService {

    /**
     * Calculate MRV Adherence based on recent exercise logs vs planned counts.
     * Returns 0.0 - 1.0
     */
    static async calculateStrengthAdherence(userId: string): Promise<number> {
        // For MVP: Look at last 14 days of logs vs a baseline expectation (e.g. 3 sessions/week)
        // TODO: In V2, link to actual WeeklyPlan MRV targets
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const logs = await prisma.exerciseLog.findMany({
            where: {
                userId,
                date: { gte: twoWeeksAgo }
            },
            select: { date: true }
        });

        // Group by day to count sessions
        const sessionDates = new Set(logs.map(l => l.date.toISOString().split('T')[0]));
        const sessionCount = sessionDates.size;

        // Target: 3 sessions/week * 2 weeks = 6 sessions
        const targetSessions = 6;

        return Math.min(1.0, sessionCount / targetSessions);
    }

    /**
     * Calculate Cardio Adherence based on recent cardio logs.
     * Returns 0.0 - 1.0
     */
    static async calculateCardioAdherence(userId: string): Promise<number> {
        // For MVP: Look at last 14 days. Target 2 sessions/week.
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const logs = await prisma.cardioLog.findMany({
            where: {
                userId,
                date: { gte: twoWeeksAgo }
            },
            select: { date: true }
        });

        const sessionCount = logs.length;
        // Target: 2 sessions/week * 2 weeks = 4 sessions
        const targetSessions = 4;

        return Math.min(1.0, sessionCount / targetSessions);
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

        // 2. Extract Metrics
        const wilks = user.pvpProfile?.highestWilksScore || 0;

        // Determine Cardio Metric (Watts/kg)
        let wkg = 0;
        if (user.ftpCycle && user.bodyWeight > 0) {
            wkg = user.ftpCycle / user.bodyWeight;
        } else if (user.ftpRun && user.bodyWeight > 0) {
            wkg = user.ftpRun / user.bodyWeight;
        }

        // 3. Determine Path
        const path = (user.activePath as TrainingPath) || 'WARDEN';

        // 4. Calculate Real Adherence
        const mrvAdherence = await this.calculateStrengthAdherence(userId);
        const cardioAdherence = await this.calculateCardioAdherence(userId);

        // 5. Calculate Power Rating
        const result = calculatePowerRating(
            wilks,
            wkg,
            path,
            mrvAdherence,
            cardioAdherence
        );

        // 6. Update Titan
        const updatedTitan = await prisma.titan.update({
            where: { userId },
            data: {
                powerRating: result.powerRating,
                strengthIndex: result.strengthIndex,
                cardioIndex: result.cardioIndex,
                mrvAdherence: 1.0 + (mrvAdherence * 0.15), // Storing the multiplier for UI display logic matching lib
                lastPowerCalcAt: new Date(),
            },
        });

        return {
            ...result,
            mrvAdherence,
            cardioAdherence,
            titan: updatedTitan
        };
    }
}

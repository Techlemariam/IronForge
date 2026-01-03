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
     * Helper to get target sessions from WeeklyPlan or Fallback defaults.
     */
    private static async getTargetSessions(userId: string, type: 'STRENGTH' | 'CARDIO'): Promise<number> {
        // Find the most recent WeeklyPlan
        const plan = await prisma.weeklyPlan.findFirst({
            where: { userId },
            orderBy: { weekStart: 'desc' }
        });

        if (plan && plan.plan) {
            // Parse the JSON plan
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dayPlans = plan.plan as any[];

            // Count scheduled non-rest days
            // Note: This assumes the Oracle schedules mixed strength/cardio. A simplistic check for !isRestDay is a good proxy for "Activity Days".
            // A more advanced check would parse the recommendation title/type.
            const plannedDays = dayPlans.filter(d => !d.isRestDay).length;

            // For now, assume total activity is split 60/40 Strength/Cardio roughly, 
            // or just use total volume as adherence target if we don't distinguish types in the Plan JSON yet.
            // Since OracleRecommendation types are coarse (RECOVERY vs GRIND), let's estimate:

            if (plannedDays > 0) {
                // Fallback Logic based on type since Plan doesn't strictly tag "Cardio Day" vs "Leg Day" in types yet
                if (type === 'STRENGTH') return Math.max(2, Math.ceil(plannedDays * 0.6));
                if (type === 'CARDIO') return Math.max(1, Math.ceil(plannedDays * 0.4));
            }
        }

        // Default Fallback (MVP)
        return type === 'STRENGTH' ? 3 : 2;
    }

    /**
     * Calculate MRV Adherence based on recent exercise logs vs planned counts.
     * Returns 0.0 - 1.0 (capped)
     */
    static async calculateStrengthAdherence(userId: string): Promise<number> {
        // Look at last 14 days
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const logs = await prisma.exerciseLog.findMany({
            where: {
                userId,
                date: { gte: twoWeeksAgo }
            },
            select: { date: true }
        });

        // Group by day to count unique sessions
        const sessionDates = new Set(logs.map(l => l.date.toISOString().split('T')[0]));
        const actualSessions = sessionDates.size;

        // Target: 2 weeks of volume
        const weeklyTarget = await this.getTargetSessions(userId, 'STRENGTH');
        const totalTarget = weeklyTarget * 2;

        return Math.min(1.1, actualSessions / totalTarget); // Allow small over-adherence buffer (110%)
    }

    /**
     * Calculate Cardio Adherence based on recent cardio logs.
     * Returns 0.0 - 1.0 (capped)
     */
    static async calculateCardioAdherence(userId: string): Promise<number> {
        // Look at last 14 days
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const logs = await prisma.cardioLog.findMany({
            where: {
                userId,
                date: { gte: twoWeeksAgo }
            },
            select: { date: true }
        });

        const actualSessions = logs.length;

        // Target: 2 weeks of volume
        const weeklyTarget = await this.getTargetSessions(userId, 'CARDIO');
        const totalTarget = weeklyTarget * 2;

        return Math.min(1.1, actualSessions / totalTarget);
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

import prisma from '../lib/prisma';
import { runFullAudit } from './auditorOrchestrator';
import { OracleService } from './oracle';
import { getWellness } from '../lib/intervals';
import { TrainingMemoryManager } from './trainingMemoryManager';
import { AnalyticsService } from './analytics';
import { TrainingPath, WeeklyMastery, InAppWorkoutLog } from '../types';
import { getHevyWorkouts } from '../lib/hevy';

// Re-implement or import dependencies if they are client-safe.
// auditorOrchestrator should be client-safe, but it calls getHevyWorkouts using fetch which is isomorphic.
// However, calculateTTB probably needs the full merged history.

/**
 * Server-Side Planner Service
 * Orchestrates data from DB, Hevy, and Intervals to generate weekly plans.
 */
export const PlannerService = {

    /**
     * Triggers the generation of a weekly plan for a user.
     * Can be called from Server Actions or Cron Jobs.
     */
    triggerWeeklyPlanGeneration: async (userId: string) => {
        console.log(`Planner: Generating plan for user ${userId}`);

        // 1. Fetch User Credentials & Settings
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                exerciseLogs: {
                    where: {
                        date: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days for TTB/Audit
                        }
                    }
                },
                cardioLogs: {
                    where: {
                        date: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                }
            }
        });

        if (!user) throw new Error('User not found');

        // 2. Fetch Hevy Data
        // We use the runFullAudit function to get hevy data + analysis
        // Note: runFullAudit calls getHevyWorkouts.
        const auditReport = await runFullAudit(true, user.hevyApiKey);

        // 3. Fetch Intervals Wellness
        let wellness = { id: 'unknown', ctl: 0, atl: 0, tsb: 0 };
        if (user.intervalsApiKey && user.intervalsAthleteId) {
            const today = new Date().toISOString().split('T')[0];
            const w = await getWellness(today, user.intervalsApiKey, user.intervalsAthleteId);
            if (w) wellness = w as any;
        }

        // 4. Map Data for Analytics (TTB Calculation)
        // Map Prisma CardioLogs to IntervalsActivity format expected by Analytics
        const activities: any[] = user.cardioLogs.map((l: any) => ({
            id: l.intervalsId,
            start_date_local: l.date.toISOString(),
            name: l.type,
            moving_time: l.duration,
            icu_intensity: (l.averageHr || 140) > 160 ? 90 : 60, // Rough estimate if load not available
            type: l.type
        }));

        // Use AnalyticsService for TTB
        // Note: Prisma ExerciseLog matches the shape roughly but we need to verify.
        // Analytics expects: { isEpic: boolean, date: Date/string }
        // Prisma: { isEpic: Boolean, date: Date }
        const ttb = AnalyticsService.calculateTTB(
            user.exerciseLogs as any[],
            activities,
            wellness as any
        );

        // If auditor says we are neglecting something, that becomes lowest TTB
        if (auditReport.highestPriorityGap) {
            ttb.lowest = 'strength'; // Weakness found
        }

        // 5. Aggregate Logs for Oracle Context
        const inAppLogs: InAppWorkoutLog[] = [
            ...user.exerciseLogs.map((l: any) => ({
                id: l.id.toString(),
                date: l.date.toISOString(),
                type: 'STRENGTH' as const,
                durationMin: 45, // Estimate
                setsCompleted: 1,
            })),
            ...user.cardioLogs.map((l: any) => ({
                id: l.id.toString(),
                date: l.date.toISOString(),
                type: 'CARDIO' as const,
                durationMin: l.duration / 60,
                tssEstimate: l.load
            }))
        ];

        // 6. Generate Plan via Oracle
        const plan = await OracleService.generateWeekPlan({
            wellness: wellness as any,
            ttb,
            auditReport,
            activePath: (user.activePath as TrainingPath) || 'HYBRID_WARDEN',
            inAppLogs
        });

        // 7. Save to DB
        await prisma.weeklyPlan.create({
            data: {
                userId: user.id,
                weekStart: new Date(plan.weekStart),
                plan: plan.days as any // JSON
            }
        });

        console.log(`Planner: Plan generated and saved for user ${userId}`);
        return plan;
    }
};

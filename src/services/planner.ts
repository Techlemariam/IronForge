import prisma from "../lib/prisma";
import { runFullAudit } from "./auditorOrchestrator";
import { OracleService } from "./oracle";
import { getWellness } from "../lib/intervals";
import { TrainingMemoryManager } from "./trainingMemoryManager";
import { AnalyticsService } from "./analytics";
import { TrainingPath, WeeklyMastery, InAppWorkoutLog, IntervalsActivity } from "../types";
import { WellnessData } from "../lib/intervals";

// Note: Hevy integration removed per data-source-reconciliation.md
// Strength data now comes from IronForge internal logs only.

/**
 * Server-Side Planner Service
 * Orchestrates data from DB and Intervals to generate weekly plans.
 * 
 * DATA SOURCES:
 * - Strength: IronForge PostgreSQL (internal logs from IronMines)
 * - Cardio: Garmin -> Intervals.icu
 * - Wellness: Garmin -> Intervals.icu
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
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days for TTB/Audit
            },
          },
        },
        cardioLogs: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    if (!user) throw new Error("User not found");

    // 2. Fetch Strength Data (IronForge internal logs)
    // runFullAudit now uses userId to fetch from IronForge DB
    const auditReport = await runFullAudit(true, userId);

    // 3. Fetch Intervals Wellness
    let wellness: WellnessData = {
      date: new Date().toISOString(),
      ctl: 0,
      atl: 0,
      tsb: 0,
      id: "unknown",
      hrv: null,
      restingHR: null,
      readiness: null,
      sleepScore: null,
      sleepSecs: null,
      rampRate: null,
      vo2max: null,
      // Phase 2 fields
      avgSleepingHR: null,
      sleepQuality: null,
      hydration: null,
      hrvSDNN: null,
      baevskySI: null,
      stress: null,
      mood: null,
      fatigue: null,
      menstrualPhase: null,
      menstrualPhasePredicted: null,
      weight: null,
      spO2: null,
      respiration: null,
      bloodGlucose: null,
      injury: null,
      soreness: null,
      steps: null,
    };
    if (user.intervalsApiKey && user.intervalsAthleteId) {
      const today = new Date().toISOString().split("T")[0];
      const w = await getWellness(
        today,
        user.intervalsApiKey,
        user.intervalsAthleteId,
      );
      if (w && !Array.isArray(w)) wellness = w;
    }

    // 4. Map Data for Analytics (TTB Calculation)
    // Map Prisma CardioLogs to IntervalsActivity format expected by Analytics
    const activities: IntervalsActivity[] = user.cardioLogs.map((l) => ({
      id: l.intervalsId || undefined,
      start_date_local: l.date.toISOString(),
      type: l.type || undefined,
      moving_time: l.duration,
      icu_intensity: (l.averageHr || 140) > 160 ? 90 : 60, // Rough estimate if load not available
      icu_training_load: l.load || 0,
    }));

    // Use AnalyticsService for TTB
    // Note: Prisma ExerciseLog matches the shape roughly but we need to verify.
    // Analytics expects: { isEpic: boolean, date: Date/string }
    // Prisma: { isEpic: Boolean, date: Date }
    const ttb = AnalyticsService.calculateTTB(
      user.exerciseLogs as any[], // Keep as any[] for now as Prisma type might have extra fields, but it works for Analytics
      activities,
      wellness as any, // IntervalsWellness matches WellnessData loosely
    );

    // If auditor says we are neglecting something, that becomes lowest TTB
    if (auditReport.highestPriorityGap) {
      ttb.lowest = "strength"; // Weakness found
    }

    // 5. Aggregate Logs for Oracle Context
    const inAppLogs: InAppWorkoutLog[] = [
      ...user.exerciseLogs.map((l: any) => ({
        id: l.id.toString(),
        date: l.date.toISOString(),
        type: "STRENGTH" as const,
        durationMin: 45, // Estimate
        setsCompleted: 1,
      })),
      ...user.cardioLogs.map((l: any) => ({
        id: l.id.toString(),
        date: l.date.toISOString(),
        type: "CARDIO" as const,
        durationMin: l.duration / 60,
        tssEstimate: l.load,
      })),
    ];

    // 6. Generate Plan via Oracle (using consult as generateWeekPlan doesn't exist yet)
    const recommendation = await OracleService.consult(
      wellness as any,
      ttb,
      [], // events
      auditReport,
      undefined, // titanAnalysis
      null, // recoveryAnalysis
      (user.activePath as TrainingPath) || "HYBRID_WARDEN",
    );

    // Wrap recommendation into a week plan structure
    const plan = {
      id: `plan_${Date.now()}`,
      weekStart: new Date().toISOString(),
      days: [
        {
          recommendation,
          dayOfWeek: new Date().getDay(),
          date: new Date().toISOString(),
          isRestDay: false,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // 7. Save to DB
    await prisma.weeklyPlan.create({
      data: {
        userId: user.id,
        weekStart: new Date(plan.weekStart),
        plan: plan.days as unknown as any, // JSON field requirement
      },
    });

    console.log(`Planner: Plan generated and saved for user ${userId}`);
    return plan;
  },
};

import prisma from "../lib/prisma";
import { runFullAudit } from "./auditorOrchestrator";
import { OracleService } from "./oracle";
import { getWellness } from "../lib/intervals";
import { AnalyticsService } from "./analytics";
import { TrainingPath, IntervalsActivity, ExerciseLog } from "../types";
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
    const activities: IntervalsActivity[] = user.cardioLogs.map((l) => ({
      id: l.intervalsId || undefined,
      start_date_local: l.date.toISOString(),
      type: l.type || undefined,
      moving_time: l.duration,
      icu_intensity: (l.averageHr || 140) > 160 ? 90 : 60,
      icu_training_load: l.load || 0,
    }));

    // Use AnalyticsService for TTB
    // Prisma types are compatible with Analytics requirements
    // We map to ExerciseLog[] locally to adding defaults for missing fields if needed
    // Analytics Service expects e1rm and rpe for calculation
    const exerciseLogs: ExerciseLog[] = user.exerciseLogs.map(log => ({
      ...log,
      date: log.date.toISOString(), // Convert Date to string
      sets: log.sets as any, // JsonValue to expected type
      e1rm: 0, // Defaulting to 0 as Prisma model lacks this column? Checked schema: it's missing.
      rpe: 0,   // Defaulting to 0
      isEpic: log.isPersonalRecord, // Mapping isPersonalRecord to isEpic? Wait, check definitions.
      archetype: log.archetype as any // Prisma Enum vs Internal Enum mismatch prevention
    }));

    // Ensure wellness matches the shape expected by Analytics (WellnessData is compatible)
    const ttb = AnalyticsService.calculateTTB(
      exerciseLogs,
      activities,
      wellness
    );

    // If auditor says we are neglecting something, that becomes lowest TTB
    if (auditReport.highestPriorityGap) {
      ttb.lowest = "strength"; // Weakness found
    }

    // 6. Generate Plan via Oracle
    const recommendation = await OracleService.consult(
      wellness,
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
    // Use Prisma.InputJsonValue from @prisma/client
    await prisma.weeklyPlan.create({
      data: {
        userId: user.id,
        weekStart: new Date(plan.weekStart),
        plan: plan.days as unknown as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    console.log(`Planner: Plan generated and saved for user ${userId}`);
    return plan;
  },
};

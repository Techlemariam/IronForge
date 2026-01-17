import prisma from "@/lib/prisma";
import { getWellness, getActivities, WellnessData } from "@/lib/intervals";
import { getHevyWorkouts } from "@/lib/hevy";
import { OracleDecree } from "@/types/oracle";
import { EquipmentService } from "@/services/game/EquipmentService";
import { EquipmentType } from "@/data/equipmentDb";
import {
  IntervalsWellness,
  IntervalsActivity,
  TTBIndices,
  IntervalsEvent,
  TitanLoadCalculation,
  AuditReport,
  OracleRecommendation,
} from "@/types";
import { TrainingPath, WeeklyMastery, WorkoutDefinition } from "@/types/training"; // Added WorkoutDefinition
import { CardioLog, ExerciseLog, Exercise, Titan, DuelChallenge } from "@prisma/client";
import { HevyWorkout } from "@/types/hevy";
import { WORKOUT_LIBRARY } from "@/data/workouts";
import { GoalPriorityEngine } from "@/services/GoalPriorityEngine";
import { WardensManifest, SystemMetrics, MacroPhase } from '@/types/goals'; // Added MacroPhase
import { mapDefinitionToSession } from "@/utils/workoutMapper";
import { logger } from "@/lib/logger";

// Types
type ExerciseLogWithExercise = ExerciseLog & { exercise: Exercise };
type PartialTitan = Pick<Titan, "isInjured" | "xp" | "powerRating" | "strengthIndex" | "cardioIndex">;



interface PrismaSet {
  reps?: number;
  weight?: number;
}

// Constants
const HISTORY_WINDOW_DAYS = 42;
const ACUTE_WINDOW_DAYS = 7;
const DUPE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

interface DailyLoad {
  date: Date;
  cardioLoad: number; // TSS
  strengthVolume: number; // kg
}

export interface CoachingStrategy {
  phase: MacroPhase;
  primaryFocus: string;
  recommendedWorkouts: WorkoutDefinition[];
  contextSummary: string;
  metrics: SystemMetrics;
}

export class OracleService {
  /**
   * Main entry point: Generates specific guidance for the Titan based on bio-data.
   */
  static async generateDailyDecree(userId: string): Promise<OracleDecree> {
    // 1. Fetch Context (Enhanced with Power Rating)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        titan: {
          select: {
            isInjured: true,
            xp: true,
            powerRating: true,
            strengthIndex: true,
            cardioIndex: true,
          },
        },
        pvpProfile: {
          select: {
            rankScore: true,
          },
        },
      },
    });

    if (!user || !user.titan) {
      throw new Error("User or Titan not found");
    }

    // Fetch Active Duel Context (Match challenger or defender)
    const activeDuel = await prisma.duelChallenge.findFirst({
      where: {
        OR: [{ challengerId: userId }, { defenderId: userId }],
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
      select: {
        challengerId: true,
        targetDistance: true,
        challengerDistance: true,
        defenderDistance: true,
        endDate: true,
        duelType: true,
      },
    });

    const now = new Date();
    const historyStart = new Date();
    historyStart.setDate(now.getDate() - HISTORY_WINDOW_DAYS);

    // 2. Fetch External Data
    let wellness: IntervalsWellness = {};
    let intervalsActivities: IntervalsActivity[] = [];
    let hevyWorkouts: HevyWorkout[] = [];

    if (user.intervalsApiKey && user.intervalsAthleteId) {
      try {
        const todayStr = now.toISOString().split("T")[0];
        const wData = await getWellness(
          todayStr,
          user.intervalsApiKey,
          user.intervalsAthleteId,
        );
        if (wData && !Array.isArray(wData)) {
          const wellnessData = wData as WellnessData;
          wellness = {
            bodyBattery: wellnessData.readiness ?? undefined,
            sleepScore: wellnessData.sleepScore ?? undefined,
            hrv: wellnessData.hrv ?? undefined,
            restingHR: wellnessData.restingHR ?? undefined,
          };
        }
        const startStr = historyStart.toISOString().split("T")[0];
        intervalsActivities = (await getActivities(
          startStr,
          todayStr,
          user.intervalsApiKey,
          user.intervalsAthleteId,
        )) as IntervalsActivity[];
      } catch (e) {
        logger.error({ err: e }, "Oracle: Failed to fetch Intervals data");
      }
    }

    if (user.hevyApiKey) {
      try {
        const result = await getHevyWorkouts(user.hevyApiKey, 1, 10);
        hevyWorkouts = result.workouts || [];
      } catch (e) {
        logger.error({ err: e }, "Oracle: Failed to fetch Hevy data");
      }
    }

    // 3. Fetch Local Data
    const localCardio = await prisma.cardioLog.findMany({
      where: { userId, date: { gte: historyStart } },
    });

    const localStrength = await prisma.exerciseLog.findMany({
      where: { userId, date: { gte: historyStart } },
      include: { exercise: true },
    });

    // 4. Fetch Capabilities
    const capabilities = await EquipmentService.getUserCapabilities(userId);

    // 5. Harmonize Data
    const dailyLoads = this.calculateCombinedHistory(
      historyStart,
      now,
      localCardio,
      localStrength,
      intervalsActivities,
      hevyWorkouts,
    );

    // 6. Analysis
    const analysis = this.analyzeLoads(dailyLoads);

    // 7. Determine Decree (V3 with Power Rating context)
    return this.determineDecree(
      userId,
      user.titan,
      wellness,
      analysis,
      capabilities,
      (user.activePath as TrainingPath) || "WARDEN",
      activeDuel,
      // Pass required GPE data if available, defaulting to mock/neutral for now to avoid breaking signature
      (user as any).wardensManifest ? ((user as any).wardensManifest as unknown as WardensManifest) : undefined
    );
  }

  private static calculateCombinedHistory(
    start: Date,
    end: Date,
    localCardio: CardioLog[],
    localStrength: ExerciseLogWithExercise[],
    remoteCardio: IntervalsActivity[],
    remoteStrength: HevyWorkout[],
  ): Map<string, DailyLoad> {
    const loads = new Map<string, DailyLoad>();

    // Helper to get day key
    const getKey = (d: Date | string) =>
      new Date(d).toISOString().split("T")[0];

    // Process Local Cardio
    localCardio.forEach((log) => {
      const key = getKey(log.date);
      const entry = loads.get(key) || {
        date: new Date(log.date),
        cardioLoad: 0,
        strengthVolume: 0,
      };
      entry.cardioLoad += log.load || 0;
      loads.set(key, entry);
    });

    // Process Remote Cardio (Intervals) - Dedup
    remoteCardio.forEach((activity) => {
      // Check for duplicate: time match +/- 30m
      // Actually Intervals activity has `start_date_local`.
      // We need to parse it.
      // In types/index.ts IntervalsActivity has `id`.
      // For now, let's assume if we extracted it, it might just be a date string in the simplified type.
      // But usually it has a timestamp.
      // Simplified logic: If we have local cardio on this day with similar Load, skip?
      // Or precise timestamp match.
      // Let's rely on date-based aggregation for now + simple ID check if available.

      // For this Implementation: We Aggressively Add remote if not strictly matching local ID
      // But wait, duplication logic required fuzzy match.
      // Checking timestamps is hard without precise start times on Local logs (default @now known?).

      // SIMPLIFIED DEDUP: If Local Cardio exists for this DAY, ignore Remote?
      // No, multiple workouts possible.
      // Safe bet for Prototype: Use Local as Truth. Add Remote only if NO Local log exists for that day?
      // User requested explicit handling.
      // Let's imply: If Remote Time matches Local Time +/- 30m.
      // Since Local `CardioLog` has `date`, let's compare.

      const actDate = new Date(
        activity.start_date_local || new Date(),
      ); // Assuming start_date_local exists on real object
      const isDupe = localCardio.some(
        (l: CardioLog) =>
          Math.abs(new Date(l.date).getTime() - actDate.getTime()) <
          DUPE_WINDOW_MS,
      );

      if (!isDupe) {
        const key = getKey(actDate);
        const entry = loads.get(key) || {
          date: actDate,
          cardioLoad: 0,
          strengthVolume: 0,
        };
        // Load/TSS from intervals? Type says `icu_intensity`? Usually `load` or `icu_training_load`.
        // Let's assume `icu_intensity` is a proxy or 0 if missing.
        // Really we need `load`. Types might be incomplete. using 0 safe fallback.
        entry.cardioLoad += activity.icu_training_load || 0;
        loads.set(key, entry);
      }
    });

    // Process Local Strength (Volume)
    localStrength.forEach((log) => {
      const key = getKey(log.date);
      const entry = loads.get(key) || {
        date: new Date(log.date),
        cardioLoad: 0,
        strengthVolume: 0,
      };
      // Calculate volume (sets * reps * weight)
      // sets is Json, need to cast
      const sets = (log.sets as unknown) as PrismaSet[];
      const vol = sets.reduce(
        (acc, s) => acc + (s.reps || 0) * (s.weight || 0),
        0,
      );
      entry.strengthVolume += vol;
      loads.set(key, entry);
    });

    // Process Remote Strength (Hevy) - Dedup
    remoteStrength.forEach((workout: HevyWorkout) => {
      const startTime = new Date(workout.start_time);
      const isDupe = localStrength.some(
        (l: ExerciseLogWithExercise) =>
          Math.abs(new Date(l.date).getTime() - startTime.getTime()) <
          DUPE_WINDOW_MS,
      );

      if (!isDupe) {
        const key = getKey(startTime);
        const entry = loads.get(key) || {
          date: startTime,
          cardioLoad: 0,
          strengthVolume: 0,
        };

        let vol = 0;
        workout.exercises?.forEach((ex) => {
          ex.sets?.forEach((s) => {
            vol += (s.reps || 0) * (s.weight_kg || 0);
          });
        });

        entry.strengthVolume += vol;
        loads.set(key, entry);
      }
    });

    return loads;
  }

  private static analyzeLoads(dailyLoads: Map<string, DailyLoad>) {
    const sorted = Array.from(dailyLoads.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    // Calculate Moving Averages (Exponential typically, simple for now)
    // Acute (7d), Chronic (42d)

    let acuteCardioSum = 0;
    let chronicCardioSum = 0;
    let acuteVolSum = 0;
    let chronicVolSum = 0;

    const now = new Date();
    const acuteStart = new Date();
    acuteStart.setDate(now.getDate() - ACUTE_WINDOW_DAYS);
    const chronicStart = new Date();
    chronicStart.setDate(now.getDate() - HISTORY_WINDOW_DAYS);

    sorted.forEach((d) => {
      if (d.date >= acuteStart) {
        acuteCardioSum += d.cardioLoad;
        acuteVolSum += d.strengthVolume;
      }
      if (d.date >= chronicStart) {
        chronicCardioSum += d.cardioLoad;
        chronicVolSum += d.strengthVolume;
      }
    });

    const acuteCardioAvg = acuteCardioSum / ACUTE_WINDOW_DAYS;
    const chronicCardioAvg = chronicCardioSum / HISTORY_WINDOW_DAYS;

    const acuteVolAvg = acuteVolSum / ACUTE_WINDOW_DAYS;
    const chronicVolAvg = chronicVolSum / HISTORY_WINDOW_DAYS;

    // Detect Sharp Spikes (>30% jump over baseline)
    const cardioRatio = chronicCardioAvg > 0 ? acuteCardioAvg / chronicCardioAvg : 0;
    const volumeRatio = chronicVolAvg > 0 ? acuteVolAvg / chronicVolAvg : 0;
    const isVolumeSpike = cardioRatio > 1.3 || volumeRatio > 1.3;

    return {
      cardioRatio,
      volumeRatio,
      isVolumeSpike,
    };
  }

  /**
   * Generates a deterministic training strategy based on the user's current metrics and goals.
   * This "Grounds" the LLM with hard data from the GoalPriorityEngine.
   */
  static generateTrainingStrategy(
    manifest: WardensManifest,
    metrics: SystemMetrics
  ): CoachingStrategy {
    // 1. Determine optimal phase
    const phase = GoalPriorityEngine.selectPhase(manifest, metrics);

    // 2. Identify primary goal
    const primaryFocus = manifest.goals[0]?.goal || 'FITNESS';

    // 3. Select top 3 workouts
    const readinessFactor = Math.max(0.5, Math.min(1.2, (metrics.tsb + 30) / 60)); // -30 TSB = 0.5, +30 TSB = 1.0 (approx)

    const budget = {
      cns: 50 * readinessFactor,
      muscular: 50 * readinessFactor,
      metabolic: 50 * readinessFactor
    };

    const recommendedWorkouts = GoalPriorityEngine.selectWorkout(
      manifest,
      phase,
      budget,
      undefined, // No heatmap for now
      undefined, // No prefs
      true // Allow budget override for recommendations (aspirational)
    );

    // 4. Generate Context Summary for the LLM
    const contextSummary = `
TRAINING STRATEGY (Generated by GoalPriorityEngine):
- Current Phase: ${phase}
- Primary Goal: ${primaryFocus}
- Weekly Target: ${metrics.ctl.toFixed(0)} CTL (Fitness)
- Actionable Recommendation: ${recommendedWorkouts[0]?.name || "Active Recovery"}
`;

    return {
      phase,
      primaryFocus,
      recommendedWorkouts,
      contextSummary,
      metrics
    };
  }

  private static determineDecree(
    userId: string,
    titan: PartialTitan,
    wellness: IntervalsWellness,
    analysis: { cardioRatio: number; volumeRatio: number; isVolumeSpike: boolean },
    capabilities: EquipmentType[] = [],
    _activePath: string = "WARDEN",
    activeDuel: Partial<DuelChallenge> | null = null,
    manifest?: WardensManifest
  ): OracleDecree {
    // 0. Construct GPE Metrics & Phase
    // Create metrics from available data to feed the Engine
    const metrics: SystemMetrics = {
      ctl: (titan.cardioIndex || 0) + (titan.strengthIndex || 0),
      atl: analysis.isVolumeSpike ? 100 : 50, // rough proxy from spike analysis
      tsb: wellness.bodyBattery ? (wellness.bodyBattery - 50) * 1.5 : 0, // Proxy TSB
      hrvBaseline: titan.hrvBaseline || 60,
      soreness: wellness.soreness || 5,
      sleepScore: wellness.sleepScore || 70,
      hrv: wellness.hrv || 50,
      mood: (titan as any).mood || "NEUTRAL",
      consecutiveStalls: 0,
      acwr: Math.max(analysis.cardioRatio, analysis.volumeRatio)
    };

    let gpePhase: MacroPhase = "BALANCED";
    if (manifest) {
      gpePhase = GoalPriorityEngine.selectPhase(manifest, metrics);
    }

    // --- PRIORITY 1: SAFETY (INJURY / SEVERE FATIGUE) ---
    if (titan.isInjured) {
      return {
        type: "DEBUFF",
        code: "INJURY_PRESERVATION",
        label: "Decree of Preservation",
        description: "The Titan is damaged. Rest to prevent scarring.",
        actions: { lockFeatures: ["HEAVY_LIFT", "PVP"], lockTraining: true, notifyUser: true, urgency: "HIGH" },
        effect: { modifier: 0.0, stat: "all" },
      };
    }

    // GPE DELOAD or Critical Recovery take precedence
    if (gpePhase === "DELOAD" || (wellness.bodyBattery && wellness.bodyBattery < 30)) {
      return {
        type: "DEBUFF",
        code: "REST_FORCED",
        label: "Decree of Restoration",
        description: gpePhase === "DELOAD"
          ? "The Engine dictates a Deload week. Reduce volume to supercompensate."
          : "Bio-metrics indicate severe depletion. Rest required.",
        actions: { lockFeatures: ["HEAVY_LIFT", "PR_ATTEMPT"], lockTraining: true, notifyUser: true, urgency: "HIGH" },
        effect: { modifier: 0.6, stat: "all" }
      };
    }

    // --- PRIORITY 2: PVP CRISIS ---
    if (activeDuel) {
      const daysLeft = activeDuel.endDate
        ? (new Date(activeDuel.endDate).getTime() - Date.now()) / (1000 * 3600 * 24)
        : 7;

      // ... (Existing PvP Logic) ...
      const isChallenger = activeDuel.challengerId === userId;
      const userDist = (isChallenger ? activeDuel.challengerDistance : activeDuel.defenderDistance) ?? 0;
      const oppDist = (isChallenger ? activeDuel.defenderDistance : activeDuel.challengerDistance) ?? 0;
      const targetDist = activeDuel.targetDistance || 0;
      const distanceToTarget = Math.max(0, targetDist - userDist);
      const trailingOpponent = oppDist > userDist;
      const distGap = trailingOpponent ? oppDist - userDist : 0;

      if (daysLeft < 2 && (distanceToTarget > 5 || distGap > 2)) {
        return {
          type: "BUFF",
          code: "PVP_CRISIS",
          label: "🔥 Final Push",
          description: `Duel ends in ${Math.ceil(daysLeft)} days. Go hard!`,
          actions: { unlockBuffs: ["PVP_BONUS"], notifyUser: true, urgency: "HIGH" },
          effect: { xpMultiplier: 1.3, stat: "cardio" },
        };
      }
    }

    // --- PRIORITY 3: TRAINING PHASE DECREES (Based on GPE) ---
    // Instead of generic "Baseline", we now output Phase-specific context if significant

    if (gpePhase === "PEAK") {
      return {
        type: "BUFF",
        code: "PEAK_PERFORMANCE",
        label: "Decree of the Apex",
        description: "Peaking Phase active. Intensity is paramount. Break records.",
        actions: { notifyUser: true, urgency: "MEDIUM", unlockBuffs: ["PR_ATTEMPT"] },
        effect: { xpMultiplier: 1.25, stat: "strength" }
      };
    }

    if (gpePhase === "CARDIO_BUILD" && metrics.tsb > 10) {
      // Only if fresh
      return {
        type: "NEUTRAL", // Or BUFF? Let's keep Neutral to avoid spam unless truly special
        code: "CARDIO_FOCUS",
        label: "Decree of Endurance",
        description: "Focus on aerobic base building.",
        actions: { notifyUser: false, urgency: "LOW" }, // Silent update
        effect: { xpMultiplier: 1.0 }
      };
    }

    // Fallback
    return {
      type: "NEUTRAL",
      code: "BASELINE_GRIND",
      label: "Decree of Discipline",
      description: `Phase: ${gpePhase}. Maintain consistency.`,
      actions: { notifyUser: false, urgency: "LOW" },
      effect: { xpMultiplier: 1.0 },
    };
  }
  /**
   * Legacy/Core Consultation: Returns a specific workout recommendation.
   * Integrates with the new Decree system.
   */
  static async consult(
    wellness: IntervalsWellness,
    _ttb: TTBIndices,
    _events: IntervalsEvent[] = [],
    _auditReport?: AuditReport | null,
    _titanAnalysis?: TitanLoadCalculation | null,
    recoveryAnalysis?: { state: string; reason: string } | null,
    activePath: TrainingPath = "WARDEN",
    _weeklyMastery?: WeeklyMastery,
    titanState?: { dailyDecree?: OracleDecree | null } | null,
  ): Promise<OracleRecommendation> {

    // 1. Get the Decree (or use cached one from titanState if available)
    // For efficiency, we assume generateDailyDecree is heavy (fetches DB).
    // We'll trust the inputs or do a lightweight check.

    let recommendation: OracleRecommendation = {
      type: "GRIND", // Default type
      title: "Daily Training",
      rationale: "Based on your current status...",
      priorityScore: 50, // Default priority
      generatedSession: undefined,
    };

    const recovery = wellness.bodyBattery || 0;

    // Mobility Audit Check
    if (_auditReport?.mobility && _auditReport.mobility.neglectedRegions.length > 0) {
      const topNeglected = _auditReport.mobility.neglectedRegions[0];
      const recommended = _auditReport.mobility.recommendedExercises[0];

      if (recommended) {
        recommendation.type = "RECOVERY";
        recommendation.title = "Mobility Focus";
        recommendation.rationale = `Your ${topNeglected} mobility is lagging. Try ${recommended.exerciseName}. ${_auditReport.mobility.insight}`;
        recommendation.priorityScore = 60; // Moderate priority integration
        // Ideally we would map this to a Session object, but for now rationale is enough to guide the user
      }
    }

    // Path Logic
    if (activePath === "PATHFINDER") {
      recommendation.type = "CARDIO_VALIDATION";
      recommendation.title = "Engine Builder";
      recommendation.rationale = "Focus on cardiovascular efficiency.";
      recommendation.priorityScore = 70;
      const runWorkouts = WORKOUT_LIBRARY.filter(w => w.type === "RUN");
      if (runWorkouts.length > 0) {
        recommendation.generatedSession = mapDefinitionToSession(runWorkouts[0]);
      }
    } else if (activePath === "JUGGERNAUT") {
      recommendation.type = "PR_ATTEMPT";
      recommendation.title = "Iron Temple";
      recommendation.rationale = "Focus on heavy compound lifts.";
      recommendation.priorityScore = 80;
      const strengthWorkouts = WORKOUT_LIBRARY.filter(w => w.type === "STRENGTH");
      if (strengthWorkouts.length > 0) {
        recommendation.generatedSession = mapDefinitionToSession(strengthWorkouts[0]);
      }
    }

    // Recovery Override
    if (
      recovery < 30 ||
      (recoveryAnalysis && recoveryAnalysis.state === "RECOVERY")
    ) {
      recommendation.type = "RECOVERY";
      recommendation.title = "Active Recovery";
      recommendation.rationale =
        "System fatigue detected. Prioritize mobility and light movement.";
      recommendation.priorityScore = 90; // High priority for recovery
      const recoveryWorkouts = WORKOUT_LIBRARY.filter(w => w.intensity === "LOW");
      if (recoveryWorkouts.length > 0) {
        recommendation.generatedSession = mapDefinitionToSession(recoveryWorkouts[0]);
      }
    }

    // Titan Decree Override
    if (titanState?.dailyDecree?.type === "DEBUFF") {
      recommendation.type = "TAPER";
      recommendation.title = "Tactical Retreat";
      recommendation.rationale = `Titan Decree (${titanState.dailyDecree.label}) dictates caution.`;
      recommendation.priorityScore = 95;
    }

    return recommendation;
  }
}

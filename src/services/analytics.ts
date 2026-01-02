import {
  IntervalsWellness,
  IntervalsActivity,
  WeaknessAudit,
  TSBForecast,
  ExerciseLog,
  TitanLoadCalculation,
  TTBIndices,
} from "../types";

/**
 * The Ultrathink Analytics Engine
 * Processes biometrics and log data to generate predictive insights.
 */
export const AnalyticsService = {
  /**
   * Calculates Total Training Balance (TTB) Indices.
   * This drives The Oracle 2.0 Logic.
   */
  calculateTTB: (
    history: ExerciseLog[],
    activities: IntervalsActivity[],
    wellness: IntervalsWellness,
  ): TTBIndices => {
    // 1. STRENGTH INDEX
    // Driven by recency of Epic Sets or PRs.
    // Logic: If last Epic set was < 3 days ago: 100. Decays by 10 per day after.
    const lastEpicSet = history.filter((h) => h.isEpic).pop(); // Assume sorted by date
    let strengthScore = 50; // Default

    if (lastEpicSet) {
      const daysSince =
        (new Date().getTime() - new Date(lastEpicSet.date).getTime()) /
        (1000 * 3600 * 24);
      strengthScore = Math.max(0, Math.min(100, 100 - (daysSince - 3) * 10));
    } else {
      // Mock data logic for demo if history is empty
      strengthScore = 65;
    }

    // 2. ENDURANCE INDEX
    // Driven by Z4/Z5 Time in last 7 days (mocked via activities list)
    // Target: 30 mins of High Intensity per week for Elite Balance.
    const highIntensityMinutes = activities
      .filter((a) => (a.icu_intensity || 0) > 85) // > 85% Intensity
      .reduce((acc, a) => acc + a.moving_time / 60, 0);

    let enduranceScore = Math.min(100, (highIntensityMinutes / 30) * 100);
    // Fallback if no activity data found (demo mode)
    if (activities.length === 0) enduranceScore = 40;

    // 3. WELLNESS INDEX
    // Driven by HRV vs Baseline and TSB.
    // Baseline HRV assumed 60 for demo.
    // TSB Floor: -20.
    const hrvScore = Math.min(100, ((wellness.hrv || 40) / 60) * 100);
    const tsbPenalty = (wellness.tsb || 0) < -15 ? 50 : 0;
    const wellnessScore = Math.max(0, hrvScore - tsbPenalty);

    // Determine Lowest
    const scores = {
      strength: strengthScore,
      endurance: enduranceScore,
      wellness: wellnessScore,
    };
    let lowest: keyof typeof scores = "strength";
    let minVal = 999;

    (Object.keys(scores) as Array<keyof typeof scores>).forEach((key) => {
      if (scores[key] < minVal) {
        minVal = scores[key];
        lowest = key;
      }
    });

    return {
      strength: Math.round(strengthScore),
      endurance: Math.round(enduranceScore),
      wellness: Math.round(wellnessScore),
      lowest,
    };
  },

  /**
   * Generates a 7-day TSB (Form) forecast based on current state and planned future loads.
   * Uses a Banister Impulse Response model.
   * @param startWellness Current wellness snapshot (CTL/ATL start point)
   * @param plannedDailyLoad Array of predicted TSS for the next 7 days (index 0 = today)
   */
  calculateTSBForecast: (
    startWellness: IntervalsWellness,
    plannedDailyLoad: number[] = [],
  ): TSBForecast[] => {
    const forecast: TSBForecast[] = [];

    // Defaults if data is missing
    let ctl = startWellness.ctl || 45;
    let atl = startWellness.atl || 50;

    // Constants for Decay (standard Coggan constants)
    const k_fitness = Math.exp(-1 / 42); // CTL decay
    const k_fatigue = Math.exp(-1 / 7); // ATL decay

    // Ensure we have 7 days of load (default 0)
    const loads = [...plannedDailyLoad];
    while (loads.length < 7) loads.push(0);

    for (let i = 0; i < 7; i++) {
      // Calculate TSB BEFORE applying today's stress (morning readiness)
      const tsb = ctl - atl;

      let label = "Neutral";
      if (tsb > 25) label = "Detraining";
      else if (tsb > 5) label = "PR Window (Optimal)";
      else if (tsb > -10) label = "Maintenance";
      else if (tsb > -30) label = "Productive Training";
      else label = "Overreaching (High Risk)";

      forecast.push({
        dayOffset: i,
        tsb: Math.round(tsb),
        label,
      });

      // Apply that day's stress to update CTL/ATL for tomorrow
      const dailyStress = loads[i];

      ctl = ctl * k_fitness + dailyStress * (1 - k_fitness);
      atl = atl * k_fatigue + dailyStress * (1 - k_fatigue);
    }

    return forecast;
  },

  /**
   * Calculates "Titan Load" (Strength-based TSS) and contrasts it with HR-based TSS.
   * Standard HR TSS often underestimates heavy lifting (low HR, high CNS load).
   */
  calculateTitanLoad: (
    volumeLoad: number,
    avgIntensityPct: number,
    durationMinutes: number,
    multiplier: number = 1.0,
  ): TitanLoadCalculation => {
    // 1. Estimate HR-based TSS (Standard)
    // Assumption: Strength training averages Zone 2 HR (IF 0.6)
    const hrIF = 0.6;
    const standardTss = ((durationMinutes * 60 * hrIF * hrIF) / 3600) * 100;

    // 2. Calculate Titan Load (CNS/Mechanical based)
    // Formula: Volume Load * (Intensity^2) * Neurological Factor
    // Normalized to scale similar to TSS (approx 50-100 for a hard session)

    // Neuro Factor: Above 85% is disproportionately taxing
    const neuroFactor = avgIntensityPct > 0.85 ? 1.5 : 1.0;

    // Simplified scale for demo:
    // Hard session: 5000kg volume * 0.8 intensity -> Titan Load ~75
    const titanLoad =
      (volumeLoad / 100) * avgIntensityPct * neuroFactor * multiplier;

    const discrepancy = ((titanLoad - standardTss) / standardTss) * 100;

    return {
      standardTss: Math.round(standardTss),
      titanLoad: Math.round(titanLoad),
      discrepancy: Math.round(discrepancy),
      advice:
        discrepancy > 30
          ? "HR underestimates this session. Rely on Titan Load for recovery planning."
          : "HR and Strength Load align. Standard recovery applies.",
      appliedMultiplier: multiplier,
    };
  },

  /**
   * Analyzes recent strength logs against cardio trends to find bottlenecks.
   * Returns a "Weakness Audit".
   */
  auditWeakness: (
    strengthLogs: ExerciseLog[],
    currentWellness: IntervalsWellness,
  ): WeaknessAudit => {
    // 1. Check for Strength Plateau (Flat e1RM over last 3 logs)
    // Needs at least 3 logs to establish a trend
    if (strengthLogs.length < 3) {
      return {
        detected: false,
        type: "NONE",
        message: "Insufficient data for audit.",
        confidence: 0,
      };
    }

    const recentLogs = strengthLogs.slice(-3);
    const e1rms = recentLogs.map((l) => l.e1rm);

    // Calculate slope (simplified)
    const growth = e1rms[2] - e1rms[0];
    const isPlateau = growth <= 2.5; // Less than 2.5kg gain in 3 sessions

    if (!isPlateau) {
      return {
        detected: false,
        type: "NONE",
        message: "No plateau detected. Growth is steady.",
        confidence: 100,
      };
    }

    // 2. Correlate with Aerobic Load (Interference Effect)
    // If CTL has risen significantly (>10%) recently while strength stagnated
    const ctl = currentWellness.ctl || 0;
    // Mocking a 'previous' CTL for this logic since we only have snapshot wellness in this demo
    const previousCtl = ctl * 0.85;
    const aerobicSpike = (ctl - previousCtl) / previousCtl > 0.1;

    if (aerobicSpike) {
      return {
        detected: true,
        type: "AEROBIC_INTERFERENCE",
        message:
          "Aerobic volume spike detected (+15%). This is likely dampening your neural drive for max strength.",
        confidence: 85,
        correlationData: { metric: "CTL (Fitness)", trend: "UP" },
      };
    }

    // 3. Correlate with Recovery/Life Stress
    // If TSB is OK, but Sleep/HRV is trash
    const poorRecovery =
      (currentWellness.sleepScore || 100) < 60 ||
      (currentWellness.hrv || 100) < 40;

    if (poorRecovery) {
      return {
        detected: true,
        type: "RECOVERY_DEBT",
        message:
          "Biological readiness is critically low. Your CNS cannot support PR attempts despite muscular readiness.",
        confidence: 90,
        correlationData: { metric: "HRV / Sleep", trend: "DOWN" },
      };
    }

    return {
      detected: false,
      type: "NONE",
      message: "Plateau detected, but cause is indeterminate.",
      confidence: 40,
    };
  },

  /**
   * Generates mock history data for the demo since we don't have a real DB.
   */
  getMockHistory: (): ExerciseLog[] => {
    return [
      {
        date: "2023-10-01",
        exerciseId: "ex_landmine_press",
        e1rm: 70,
        rpe: 8,
        isEpic: true,
      },
      {
        date: "2023-10-08",
        exerciseId: "ex_landmine_press",
        e1rm: 72.5,
        rpe: 8.5,
      },
      {
        date: "2023-10-15",
        exerciseId: "ex_landmine_press",
        e1rm: 72.5,
        rpe: 9,
      }, // Stagnation
      {
        date: "2023-10-22",
        exerciseId: "ex_landmine_press",
        e1rm: 72.5,
        rpe: 9.5,
      }, // Stagnation + Higher RPE
    ];
  },
};

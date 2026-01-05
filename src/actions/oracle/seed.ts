"use server";

import { prisma } from "@/lib/prisma";
import { checkOvertrainingStatusAction } from "@/actions/training/overtraining";
import { getStreakStatusAction } from "@/actions/user/streak";

/**
 * The Oracle Seed - Central AI Intelligence Layer
 * Aggregates all data sources to provide intelligent training guidance.
 */

interface OracleContext {
  userId: string;
  titanLevel: number;
  currentStreak: number;
  overtrainingStatus: {
    isCapped: boolean;
    isFatigued: boolean;
    xpMultiplier: number;
  };
  wellnessData?: {
    sleepScore?: number;
    stressLevel?: number;
    hrv?: number;
    restingHr?: number;
  };
  recentPerformance: {
    prsThisWeek: number;
    avgRpe: number;
    volumeTrend: "INCREASING" | "STABLE" | "DECREASING";
  };
}

interface OracleInsight {
  type: "POSITIVE" | "WARNING" | "CRITICAL" | "TIP";
  title: string;
  message: string;
  actionable?: {
    action: string;
    priority: number;
  };
}

interface OracleRecommendation {
  verdict:
  | "TRAIN_HARD"
  | "TRAIN_NORMAL"
  | "TRAIN_LIGHT"
  | "REST"
  | "ACTIVE_RECOVERY";
  confidence: number; // 0-100
  insights: OracleInsight[];
  todaysFocus: string;
  suggestedExercises?: string[];
  estimatedXpMultiplier: number;
}

/**
 * Get comprehensive Oracle context for a user.
 */
async function buildOracleContext(userId: string): Promise<OracleContext> {
  const [user, overtraining, streak] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        titan: true,
        exerciseLogs: {
          take: 50,
          orderBy: { date: "desc" },
        },
      },
    }),
    checkOvertrainingStatusAction(userId),
    getStreakStatusAction(userId),
  ]);

  // Analyze recent performance
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentLogs =
    user?.exerciseLogs.filter((l) => new Date(l.date) >= weekAgo) || [];

  const prsThisWeek = recentLogs.filter((l) => l.isPersonalRecord).length;
  const avgRpe =
    recentLogs.reduce((sum, l: any) => {
      if (l.rpe) return sum + l.rpe;
      // Try to extract from sets if it exists
      if (Array.isArray(l.sets) && l.sets.length > 0) {
        const firstSet = l.sets[0] as any;
        return sum + (firstSet.rpe || 7);
      }
      return sum + 7;
    }, 0) / Math.max(1, recentLogs.length);

  // Determine volume trend
  const oldLogs = user?.exerciseLogs.slice(25, 50) || [];
  const newLogs = user?.exerciseLogs.slice(0, 25) || [];
  const volumeTrend =
    newLogs.length > oldLogs.length * 1.1
      ? "INCREASING"
      : newLogs.length < oldLogs.length * 0.9
        ? "DECREASING"
        : "STABLE";

  return {
    userId,
    titanLevel: user?.titan?.level || 1,
    currentStreak: streak.currentStreak || 0,
    overtrainingStatus: {
      isCapped: overtraining.isCapped,
      isFatigued: overtraining.isFatigued,
      xpMultiplier: overtraining.xpMultiplier,
    },
    recentPerformance: {
      prsThisWeek,
      avgRpe,
      volumeTrend,
    },
  };
}

/**
 * Generate Oracle recommendation for today.
 */
export async function getOracleRecommendationAction(
  userId: string,
  wellnessData?: OracleContext["wellnessData"],
): Promise<OracleRecommendation> {
  try {
    const context = await buildOracleContext(userId);
    const insights: OracleInsight[] = [];
    let verdict: OracleRecommendation["verdict"] = "TRAIN_NORMAL";
    let confidence = 75;
    let todaysFocus = "Balanced training session";

    // Rule 1: Check overtraining
    if (context.overtrainingStatus.isCapped) {
      verdict = "REST";
      confidence = 95;
      todaysFocus = "Complete rest - your body needs recovery";
      insights.push({
        type: "CRITICAL",
        title: "Daily XP Cap Reached",
        message: "You've trained enough today. Rest is when growth happens.",
      });
    } else if (context.overtrainingStatus.isFatigued) {
      verdict = "TRAIN_LIGHT";
      confidence = 85;
      todaysFocus = "Light technique work or cardio";
      insights.push({
        type: "WARNING",
        title: "Recent Workout Detected",
        message: "Consider a lighter session to allow recovery.",
      });
    }

    // Rule 2: Check wellness data
    if (
      wellnessData?.sleepScore !== undefined &&
      wellnessData.sleepScore < 60
    ) {
      if (verdict === "TRAIN_NORMAL") verdict = "TRAIN_LIGHT";
      insights.push({
        type: "WARNING",
        title: "Low Sleep Score",
        message: `Sleep was ${wellnessData.sleepScore}%. Consider a lighter session.`,
        actionable: { action: "Reduce volume by 30%", priority: 2 },
      });
    }

    if (
      wellnessData?.stressLevel !== undefined &&
      wellnessData.stressLevel > 7
    ) {
      if (verdict === "TRAIN_NORMAL") verdict = "ACTIVE_RECOVERY";
      insights.push({
        type: "WARNING",
        title: "High Stress Detected",
        message: "Consider training as stress relief, but don't push too hard.",
      });
    }

    // Rule 3: Positive insights
    if (context.currentStreak >= 7) {
      insights.push({
        type: "POSITIVE",
        title: `${context.currentStreak} Day Streak! 🔥`,
        message: "Your consistency is paying off. Keep the momentum!",
      });
    }

    if (context.recentPerformance.prsThisWeek > 0) {
      insights.push({
        type: "POSITIVE",
        title: `${context.recentPerformance.prsThisWeek} PRs This Week!`,
        message: "You're getting stronger. Great progress!",
      });
      // Optimal conditions for pushing
      if (verdict === "TRAIN_NORMAL" && (wellnessData?.sleepScore || 0) > 85) {
        verdict = "TRAIN_HARD";
      }
    }

    // Rule 4: Training tips
    if (context.recentPerformance.avgRpe > 8.5 && verdict !== "REST") {
      insights.push({
        type: "TIP",
        title: "High Average RPE",
        message: "Consider leaving 1-2 reps in reserve to manage fatigue.",
      });
    }

    if (context.recentPerformance.volumeTrend === "INCREASING") {
      insights.push({
        type: "TIP",
        title: "Volume Trending Up",
        message: "Good progressive overload. Watch for signs of overreaching.",
      });
    }

    // Determine focus based on verdict
    if (verdict === "TRAIN_HARD") {
      todaysFocus = "Push your limits - conditions are optimal";
    } else if (verdict === "TRAIN_NORMAL") {
      todaysFocus = "Solid training day - focus on progressive overload";
    } else if (verdict === "ACTIVE_RECOVERY") {
      todaysFocus = "Light movement - walking, stretching, mobility";
    }

    return {
      verdict,
      confidence,
      insights,
      todaysFocus,
      estimatedXpMultiplier: context.overtrainingStatus.xpMultiplier,
    };
  } catch (error) {
    console.error("Error generating Oracle recommendation:", error);
    return {
      verdict: "TRAIN_NORMAL",
      confidence: 50,
      insights: [
        {
          type: "TIP",
          title: "Oracle Error",
          message: "Unable to analyze all data. Train as usual.",
        },
      ],
      todaysFocus: "Regular training session",
      estimatedXpMultiplier: 1.0,
    };
  }
}

/**
 * Get Oracle's weekly summary.
 */
export async function getOracleWeeklySummaryAction(userId: string): Promise<{
  weekScore: number;
  achievements: string[];
  areasToImprove: string[];
  nextWeekFocus: string;
}> {
  const context = await buildOracleContext(userId);

  const achievements: string[] = [];
  const areasToImprove: string[] = [];

  if (context.recentPerformance.prsThisWeek >= 3) {
    achievements.push("Multiple PRs achieved!");
  }
  if (context.currentStreak >= 7) {
    achievements.push("Week-long streak maintained!");
  }
  if (context.recentPerformance.volumeTrend === "INCREASING") {
    achievements.push("Progressive volume increase");
  }

  if (context.recentPerformance.avgRpe > 9) {
    areasToImprove.push("RPE too high - risk of burnout");
  }
  if (context.overtrainingStatus.isFatigued) {
    areasToImprove.push("More recovery time between sessions");
  }

  const weekScore = Math.min(
    100,
    50 +
    context.recentPerformance.prsThisWeek * 10 +
    (context.currentStreak >= 7 ? 15 : context.currentStreak * 2) -
    (context.overtrainingStatus.isFatigued ? 15 : 0),
  );

  return {
    weekScore,
    achievements:
      achievements.length > 0 ? achievements : ["Showing up consistently"],
    areasToImprove:
      areasToImprove.length > 0 ? areasToImprove : ["Keep up the good work!"],
    nextWeekFocus:
      context.recentPerformance.volumeTrend === "DECREASING"
        ? "Increase training frequency"
        : context.recentPerformance.avgRpe > 8
          ? "Focus on recovery and technique"
          : "Continue progressive overload",
  };
}

"use server";

import { revalidatePath } from "next/cache";

interface BodyMetrics {
  id: string;
  userId: string;
  date: Date;
  weight?: number; // kg
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicepLeft?: number;
    bicepRight?: number;
    thighLeft?: number;
    thighRight?: number;
    neck?: number;
    forearmLeft?: number;
    forearmRight?: number;
  };
  notes?: string;
}

interface MetricsTrend {
  metric: string;
  current: number;
  previous?: number;
  change?: number;
  changePercent?: number;
  trend: "UP" | "DOWN" | "STABLE";
}

/**
 * Log new body metrics.
 */
export async function logBodyMetricsAction(
  userId: string,
  data: Omit<BodyMetrics, "id" | "userId" | "date">,
): Promise<{ success: boolean; metricsId?: string }> {
  try {
    const metricsId = `metrics-${userId}-${Date.now()}`;

    console.log(
      `Logged body metrics: weight=${data.weight}kg, bf=${data.bodyFat}%`,
    );

    // In production, save to database
    revalidatePath("/body-metrics");
    return { success: true, metricsId };
  } catch (error) {
    console.error("Error logging body metrics:", error);
    return { success: false };
  }
}

/**
 * Get body metrics history.
 */
export async function getBodyMetricsHistoryAction(
  userId: string,
  limit: number = 30,
): Promise<BodyMetrics[]> {
  try {
    // MVP: Return sample data
    const baseWeight = 80;
    const baseBodyFat = 15;

    const history: BodyMetrics[] = [];
    for (let i = 0; i < Math.min(limit, 12); i++) {
      history.push({
        id: `metrics-${i}`,
        userId,
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        weight: baseWeight - i * 0.3 + Math.random() * 0.5,
        bodyFat: baseBodyFat - i * 0.2 + Math.random() * 0.3,
        measurements: {
          chest: 100 + i * 0.2,
          waist: 82 - i * 0.3,
          bicepLeft: 35 + i * 0.1,
          bicepRight: 35.5 + i * 0.1,
        },
      });
    }

    return history;
  } catch (error) {
    console.error("Error getting body metrics history:", error);
    return [];
  }
}

/**
 * Get latest body metrics.
 */
export async function getLatestBodyMetricsAction(
  userId: string,
): Promise<BodyMetrics | null> {
  const history = await getBodyMetricsHistoryAction(userId, 1);
  return history[0] || null;
}

/**
 * Get metrics trends.
 */
export async function getMetricsTrendsAction(
  userId: string,
): Promise<MetricsTrend[]> {
  try {
    const history = await getBodyMetricsHistoryAction(userId, 8);
    if (history.length < 2) return [];

    const current = history[0];
    const previous = history[history.length - 1];
    const trends: MetricsTrend[] = [];

    if (current.weight && previous.weight) {
      const change = current.weight - previous.weight;
      trends.push({
        metric: "Weight",
        current: Math.round(current.weight * 10) / 10,
        previous: Math.round(previous.weight * 10) / 10,
        change: Math.round(change * 10) / 10,
        changePercent: Math.round((change / previous.weight) * 1000) / 10,
        trend: Math.abs(change) < 0.3 ? "STABLE" : change > 0 ? "UP" : "DOWN",
      });
    }

    if (current.bodyFat && previous.bodyFat) {
      const change = current.bodyFat - previous.bodyFat;
      trends.push({
        metric: "Body Fat",
        current: Math.round(current.bodyFat * 10) / 10,
        previous: Math.round(previous.bodyFat * 10) / 10,
        change: Math.round(change * 10) / 10,
        changePercent: Math.round((change / previous.bodyFat) * 1000) / 10,
        trend: Math.abs(change) < 0.2 ? "STABLE" : change > 0 ? "UP" : "DOWN",
      });
    }

    return trends;
  } catch (error) {
    console.error("Error getting metrics trends:", error);
    return [];
  }
}

/**
 * Calculate body composition estimates.
 */
export function calculateBodyComposition(weight: number, bodyFat: number) {
  const fatMass = weight * (bodyFat / 100);
  const leanMass = weight - fatMass;

  return {
    totalWeight: Math.round(weight * 10) / 10,
    fatMass: Math.round(fatMass * 10) / 10,
    leanMass: Math.round(leanMass * 10) / 10,
    bodyFat: Math.round(bodyFat * 10) / 10,
  };
}

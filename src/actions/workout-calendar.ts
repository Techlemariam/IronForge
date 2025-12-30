"use server";

import { prisma } from "@/lib/prisma";

interface CalendarDay {
  date: string;
  hasWorkout: boolean;
  workoutType?: "STRENGTH" | "CARDIO" | "MIXED";
  totalSets?: number;
  totalVolume?: number;
  hadPr?: boolean;
  streakDay?: number;
}

interface CalendarMonth {
  year: number;
  month: number; // 0-11
  days: CalendarDay[];
  totalWorkouts: number;
  totalVolume: number;
  prsThisMonth: number;
}

/**
 * Get workout calendar for a specific month.
 */
export async function getWorkoutCalendarAction(
  userId: string,
  year: number,
  month: number, // 0-11
): Promise<CalendarMonth> {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const daysInMonth = endDate.getDate();

    const logs = await prisma.exerciseLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
    });

    const cardioLogs = await prisma.cardioLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
    });

    // Group by day
    const workoutsByDay: Record<
      string,
      { strength: number; cardio: number; volume: number; hasPr: boolean }
    > = {};

    for (const log of logs) {
      const day = log.date.toISOString().split("T")[0];
      if (!workoutsByDay[day])
        workoutsByDay[day] = {
          strength: 0,
          cardio: 0,
          volume: 0,
          hasPr: false,
        };
      const setsCount = Array.isArray(log.sets) ? log.sets.length : 1;
      workoutsByDay[day].strength += setsCount;
      workoutsByDay[day].volume +=
        (log.weight || 0) * (log.reps || 0) * setsCount;
      if (log.isPersonalRecord) workoutsByDay[day].hasPr = true;
    }

    for (const log of cardioLogs) {
      const day = log.date.toISOString().split("T")[0];
      if (!workoutsByDay[day])
        workoutsByDay[day] = {
          strength: 0,
          cardio: 0,
          volume: 0,
          hasPr: false,
        };
      workoutsByDay[day].cardio += 1;
    }

    // Build calendar days
    const days: CalendarDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const workout = workoutsByDay[dateStr];

      days.push({
        date: dateStr,
        hasWorkout: !!workout,
        workoutType: workout
          ? workout.strength > 0 && workout.cardio > 0
            ? "MIXED"
            : workout.cardio > 0
              ? "CARDIO"
              : "STRENGTH"
          : undefined,
        totalSets: workout?.strength,
        totalVolume: workout ? Math.round(workout.volume) : undefined,
        hadPr: workout?.hasPr,
      });
    }

    const totalWorkouts = Object.keys(workoutsByDay).length;
    const totalVolume = Object.values(workoutsByDay).reduce(
      (sum, d) => sum + d.volume,
      0,
    );
    const prsThisMonth = Object.values(workoutsByDay).filter(
      (d) => d.hasPr,
    ).length;

    return {
      year,
      month,
      days,
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      prsThisMonth,
    };
  } catch (error) {
    console.error("Error getting workout calendar:", error);
    return {
      year,
      month,
      days: [],
      totalWorkouts: 0,
      totalVolume: 0,
      prsThisMonth: 0,
    };
  }
}

/**
 * Get workout details for a specific day.
 */
export async function getWorkoutDayDetailsAction(
  userId: string,
  date: string,
): Promise<{
  strengthExercises: Array<{ name: string; sets: number; volume: number }>;
  cardioSessions: Array<{ type: string; duration: number }>;
  prs: string[];
  notes?: string;
}> {
  try {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await prisma.exerciseLog.findMany({
      where: { userId, date: { gte: startDate, lt: endDate } },
    });

    const cardioLogs = await prisma.cardioLog.findMany({
      where: { userId, date: { gte: startDate, lt: endDate } },
    });

    return {
      strengthExercises: logs.map((l) => {
        const setsCount = Array.isArray(l.sets) ? l.sets.length : 1;
        return {
          name: l.exerciseId,
          sets: setsCount,
          volume: (l.weight || 0) * (l.reps || 0) * setsCount,
        };
      }),
      cardioSessions: cardioLogs.map((c) => ({
        type: c.type,
        duration: c.duration,
      })),
      prs: logs.filter((l) => l.isPersonalRecord).map((l) => l.exerciseId),
    };
  } catch (error) {
    console.error("Error getting day details:", error);
    return { strengthExercises: [], cardioSessions: [], prs: [] };
  }
}

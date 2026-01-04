"use server";

import { prisma } from "@/lib/prisma";

type ExportFormat = "CSV" | "JSON";

interface ExportOptions {
  format: ExportFormat;
  dateRange?: { start: Date; end: Date };
  includeCardio: boolean;
  includeStrength: boolean;
  includeBodyMetrics: boolean;
}

interface WorkoutExportRow {
  date: string;
  exerciseName: string;
  sets: number;
  reps: string;
  weight: string;
  e1rm?: number;
  rpe?: number;
  notes?: string;
}

/**
 * Export workout history to specified format.
 */
export async function exportWorkoutHistoryAction(
  userId: string,
  options: ExportOptions,
): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const where: any = { userId };

    if (options.dateRange) {
      where.date = {
        gte: options.dateRange.start.toISOString(),
        lte: options.dateRange.end.toISOString(),
      };
    }

    const logs = await prisma.exerciseLog.findMany({
      where,
      orderBy: { date: "desc" },
    });

    if (logs.length === 0) {
      return {
        success: false,
        error: "No workout data found for the specified criteria.",
      };
    }

    const rows: WorkoutExportRow[] = logs.map((log) => {
      const setsCount = Array.isArray(log.sets) ? log.sets.length : 1;
      return {
        date: log.date.toISOString(),
        exerciseName: log.exerciseId,
        sets: setsCount,
        reps: String(log.reps || ""),
        weight: String(log.weight || ""),
        notes: log.notes || undefined,
      };
    });

    let data: string;
    let filename: string;
    const dateStr = new Date().toISOString().split("T")[0];

    if (options.format === "CSV") {
      data = convertToCSV(rows);
      filename = `ironforge-export-${dateStr}.csv`;
    } else {
      data = JSON.stringify(rows, null, 2);
      filename = `ironforge-export-${dateStr}.json`;
    }

    return { success: true, data, filename };
  } catch (error) {
    console.error("Error exporting workout history:", error);
    return { success: false, error: "Failed to export data." };
  }
}

function convertToCSV(rows: WorkoutExportRow[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]).join(",");
  const dataRows = rows.map((row) =>
    Object.values(row)
      .map((val) =>
        typeof val === "string" && val.includes(",") ? `"${val}"` : (val ?? ""),
      )
      .join(","),
  );

  return [headers, ...dataRows].join("\n");
}

/**
 * Get export preview (first 10 rows).
 */
export async function getExportPreviewAction(
  userId: string,
  options: ExportOptions,
): Promise<{ rows: WorkoutExportRow[]; totalCount: number }> {
  try {
    const where: any = { userId };

    if (options.dateRange) {
      where.date = {
        gte: options.dateRange.start.toISOString(),
        lte: options.dateRange.end.toISOString(),
      };
    }

    const [logs, count] = await Promise.all([
      prisma.exerciseLog.findMany({
        where,
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.exerciseLog.count({ where }),
    ]);

    const rows: WorkoutExportRow[] = logs.map((log) => {
      const setsCount = Array.isArray(log.sets) ? log.sets.length : 1;
      return {
        date: log.date.toISOString(),
        exerciseName: log.exerciseId,
        sets: setsCount,
        reps: String(log.reps || ""),
        weight: String(log.weight || ""),
      };
    });

    return { rows, totalCount: count };
  } catch (error) {
    console.error("Error getting export preview:", error);
    return { rows: [], totalCount: 0 };
  }
}

/**
 * Export full account data (GDPR compliance).
 */
export async function exportFullAccountDataAction(
  userId: string,
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const [user, titan, exerciseLogs, cardioLogs, achievements] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.titan.findFirst({ where: { userId } }),
        prisma.exerciseLog.findMany({ where: { userId } }),
        prisma.cardioLog.findMany({ where: { userId } }),
        prisma.userAchievement.findMany({ where: { userId } }),
      ]);

    const fullExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: user?.id,
        email: user?.email,
        heroName: user?.heroName,
        createdAt: user?.createdAt,
      },
      titan: titan
        ? {
          level: titan.level,
          xp: titan.xp,
          hp: titan.currentHp,
          energy: titan.currentEnergy,
        }
        : null,
      workoutHistory: exerciseLogs.length,
      cardioHistory: cardioLogs.length,
      achievements: achievements.length,
      detailedData: {
        exerciseLogs,
        cardioLogs,
        achievements,
      },
    };

    return {
      success: true,
      data: JSON.stringify(fullExport, null, 2),
    };
  } catch (error) {
    console.error("Error exporting full account:", error);
    return { success: false, error: "Failed to export account data." };
  }
}

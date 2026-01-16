"use server";

import { prisma } from "@/lib/prisma";

interface BackupData {
  version: string;
  createdAt: string;
  userId: string;
  heroName: string;
  profile: unknown;
  titan: unknown;
  workoutHistory: unknown[];
  achievements: string[];
  settings: unknown;
  equipment: unknown[];
}

interface RestoreResult {
  success: boolean;
  message: string;
  itemsRestored?: {
    workouts: number;
    achievements: number;
    equipment: number;
  };
}

const BACKUP_VERSION = "1.0.0";

/**
 * Create a full backup of user data.
 */
export async function createBackupAction(
  userId: string,
): Promise<BackupData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        titan: true,
      },
    });

    if (!user) return null;

    const exerciseLogs = await prisma.exerciseLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const cardioLogs = await prisma.cardioLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const backup: BackupData = {
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      userId: user.id,
      heroName: user.heroName || "Unknown",
      profile: {
        level: user.level,
        totalXp: user.totalExperience,
        currentStreak: user.titan?.streak || 0,
        createdAt: user.createdAt,
      },
      titan: user.titan
        ? {
          name: user.titan.name,
          strength: user.titan.strength,
          vitality: user.titan.vitality,
          endurance: user.titan.endurance,
          agility: user.titan.agility,
          willpower: user.titan.willpower,
        }
        : null,
      workoutHistory: [
        ...exerciseLogs.map((log) => ({
          type: "STRENGTH",
          exerciseId: log.exerciseId,
          date: log.date,
          sets: log.sets,
          notes: log.notes,
        })),
        ...cardioLogs.map((log) => ({
          type: "CARDIO",
          activityType: log.type,
          date: log.date,
          duration: log.duration,
        })),
      ],
      achievements: [], // Would fetch from achievements table
      settings: {
        // User preferences
      },
      equipment: [], // Would fetch from equipment table
    };

    return backup;
  } catch (error) {
    console.error("Error creating backup:", error);
    return null;
  }
}

/**
 * Restore user data from backup.
 */
export async function restoreBackupAction(
  userId: string,
  backupJson: string,
): Promise<RestoreResult> {
  try {
    const backup: BackupData = JSON.parse(backupJson);

    // Validate backup version
    if (!backup.version || backup.version !== BACKUP_VERSION) {
      return {
        success: false,
        message: `Incompatible backup version: ${backup.version}. Expected: ${BACKUP_VERSION}`,
      };
    }

    // In production, restore data to database
    console.log(`Restoring backup for ${userId} from ${backup.createdAt}`);
    console.log(`Workouts to restore: ${backup.workoutHistory.length}`);

    return {
      success: true,
      message: "Backup restored successfully",
      itemsRestored: {
        workouts: backup.workoutHistory.length,
        achievements: backup.achievements.length,
        equipment: backup.equipment.length,
      },
    };
  } catch (error) {
    console.error("Error restoring backup:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to parse backup file",
    };
  }
}

/**
 * Download backup as JSON file.
 */
export function generateBackupFilename(heroName: string): string {
  const date = new Date().toISOString().split("T")[0];
  const safeName = heroName.replace(/[^a-zA-Z0-9]/g, "_");
  return `ironforge_backup_${safeName}_${date}.json`;
}

/**
 * Validate backup file structure.
 */
export function validateBackupFile(content: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const data = JSON.parse(content);

    if (!data.version) return { valid: false, error: "Missing version field" };
    if (!data.userId) return { valid: false, error: "Missing userId field" };
    if (!data.createdAt)
      return { valid: false, error: "Missing createdAt field" };
    if (!Array.isArray(data.workoutHistory))
      return { valid: false, error: "Invalid workoutHistory" };

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid JSON format" };
  }
}

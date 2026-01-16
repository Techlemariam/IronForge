"use server";

import { prisma } from "@/lib/prisma";

interface TrainingDNA {
  id: string;
  name: string;
  description: string;
  author: {
    userId: string;
    heroName: string;
    level: number;
  };
  createdAt: Date;
  methodology: TrainingMethodology;
  stats: {
    downloads: number;
    ratings: number;
    avgRating: number;
  };
}

interface TrainingMethodology {
  // Weekly structure
  daysPerWeek: number;
  sessionDuration: number; // minutes

  // Volume approach
  volumeApproach: "LOW" | "MODERATE" | "HIGH" | "ULTRA_HIGH";
  progressionModel: "LINEAR" | "WAVE" | "DUP" | "PERIODIZED" | "AUTOREGULATED";

  // Split type
  splitType: "FULL_BODY" | "UPPER_LOWER" | "PPL" | "BRO_SPLIT" | "CUSTOM";

  // RPE/RIR preferences
  avgRpe: number;
  deloadFrequency: number; // weeks

  // Muscle focus (relative priorities)
  musclePriorities: Record<string, number>;

  // Exercise preferences
  compoundFocus: number; // 0-100
  machineVsFreeWeight: number; // 0=all machine, 100=all free weight
}

/**
 * Extract user's training DNA from their history.
 */
export async function extractTrainingDnaAction(
  userId: string,
): Promise<TrainingMethodology | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        titan: true,
        exerciseLogs: {
          take: 500,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!user || user.exerciseLogs.length < 20) {
      return null; // Not enough data
    }

    // Analyze workout frequency
    const dates = new Set(user.exerciseLogs.map((l) => l.date.toISOString().split("T")[0]));
    const weeks = Math.ceil(dates.size / 7);
    const daysPerWeek = Math.round(dates.size / Math.max(1, weeks));

    // Analyze volume
    const setsPerWorkout = user.exerciseLogs.length / dates.size;
    let volumeApproach: TrainingMethodology["volumeApproach"] = "MODERATE";
    if (setsPerWorkout < 12) volumeApproach = "LOW";
    else if (setsPerWorkout > 20) volumeApproach = "HIGH";
    else if (setsPerWorkout > 30) volumeApproach = "ULTRA_HIGH";

    // Estimate compound focus (simplified - would need exercise database)
    const compoundFocus = 60; // Default assumption

    return {
      daysPerWeek: Math.min(7, Math.max(1, daysPerWeek)),
      sessionDuration: 60, // Default
      volumeApproach,
      progressionModel: "LINEAR", // Default
      splitType:
        daysPerWeek <= 3
          ? "FULL_BODY"
          : daysPerWeek <= 4
            ? "UPPER_LOWER"
            : "PPL",
      avgRpe: 7.5, // Default
      deloadFrequency: 4, // Default
      musclePriorities: {
        chest: 1.0,
        back: 1.0,
        shoulders: 1.0,
        legs: 1.0,
        arms: 0.8,
      },
      compoundFocus,
      machineVsFreeWeight: 70, // Default
    };
  } catch (error) {
    console.error("Error extracting training DNA:", error);
    return null;
  }
}

/**
 * Export training DNA as shareable package.
 */
export async function exportTrainingDnaAction(
  userId: string,
  name: string,
  _description: string,
): Promise<{ success: boolean; dnaId?: string; shareUrl?: string }> {
  try {
    const methodology = await extractTrainingDnaAction(userId);
    if (!methodology) {
      return { success: false };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { titan: true },
    });

    const dnaId = `dna-${userId}-${Date.now()}`;
    const shareUrl = `/marketplace/dna/${dnaId}`;

    // In production, save to database
    console.log(`Exported DNA: ${name} by ${user?.heroName}`);

    return { success: true, dnaId, shareUrl };
  } catch (error) {
    console.error("Error exporting training DNA:", error);
    return { success: false };
  }
}

/**
 * Import training DNA to user's profile.
 */
export async function importTrainingDnaAction(
  userId: string,
  dnaId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // In production, fetch DNA from database and apply to user's programs
    console.log(`Imported DNA ${dnaId} for user ${userId}`);

    return {
      success: true,
      message: "Training methodology imported! Check your programs.",
    };
  } catch (error) {
    console.error("Error importing training DNA:", error);
    return { success: false, message: "Failed to import DNA" };
  }
}

/**
 * Get popular training DNAs from marketplace.
 */
export async function getPopularDnasAction(
  _limit: number = 20,
): Promise<TrainingDNA[]> {
  // MVP: Return sample DNAs
  return [
    {
      id: "dna-sample-1",
      name: "Natural Hypertrophy Blueprint",
      description:
        "Moderate volume, compound-focused plan for natural lifters.",
      author: { userId: "sample", heroName: "Coach Marcus", level: 45 },
      createdAt: new Date(),
      methodology: {
        daysPerWeek: 4,
        sessionDuration: 75,
        volumeApproach: "MODERATE",
        progressionModel: "DUP",
        splitType: "UPPER_LOWER",
        avgRpe: 7,
        deloadFrequency: 4,
        musclePriorities: {
          chest: 1.0,
          back: 1.2,
          shoulders: 1.0,
          legs: 1.1,
          arms: 0.8,
        },
        compoundFocus: 70,
        machineVsFreeWeight: 75,
      },
      stats: { downloads: 1245, ratings: 87, avgRating: 4.7 },
    },
  ];
}

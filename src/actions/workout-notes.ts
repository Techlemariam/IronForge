"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface WorkoutTag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface WorkoutNote {
  id: string;
  workoutDate: string;
  content: string;
  tags: string[];
  mood?: "GREAT" | "GOOD" | "OK" | "POOR" | "TERRIBLE";
  createdAt: Date;
}

const DEFAULT_TAGS: WorkoutTag[] = [
  { id: "tag-push", name: "Push Day", color: "#ef4444", usageCount: 0 },
  { id: "tag-pull", name: "Pull Day", color: "#3b82f6", usageCount: 0 },
  { id: "tag-legs", name: "Leg Day", color: "#22c55e", usageCount: 0 },
  { id: "tag-cardio", name: "Cardio", color: "#f59e0b", usageCount: 0 },
  { id: "tag-deload", name: "Deload", color: "#8b5cf6", usageCount: 0 },
  { id: "tag-pr", name: "PR Day", color: "#ec4899", usageCount: 0 },
  { id: "tag-tired", name: "Low Energy", color: "#6b7280", usageCount: 0 },
  { id: "tag-pumped", name: "Great Pump", color: "#14b8a6", usageCount: 0 },
];

/**
 * Add note to a workout.
 */
export async function addWorkoutNoteAction(
  userId: string,
  workoutDate: string,
  note: string,
  tags: string[] = [],
  mood?: WorkoutNote["mood"],
): Promise<{ success: boolean; noteId?: string }> {
  try {
    const noteId = `note-${userId}-${Date.now()}`;

    console.log(
      `Added workout note: ${note.substring(0, 50)}... tags: ${tags.join(", ")}`,
    );

    // In production, save to database
    revalidatePath("/workout-history");
    return { success: true, noteId };
  } catch (error) {
    console.error("Error adding workout note:", error);
    return { success: false };
  }
}

/**
 * Get user's custom tags.
 */
export async function getWorkoutTagsAction(
  userId: string,
): Promise<WorkoutTag[]> {
  // In production, fetch user's custom tags and merge with defaults
  return DEFAULT_TAGS.map((tag) => ({
    ...tag,
    usageCount: Math.floor(Math.random() * 20),
  }));
}

/**
 * Create a new custom tag.
 */
export async function createWorkoutTagAction(
  userId: string,
  name: string,
  color: string,
): Promise<{ success: boolean; tagId?: string }> {
  try {
    const tagId = `tag-${userId}-${Date.now()}`;
    console.log(`Created tag: ${name} (${color})`);
    revalidatePath("/settings");
    return { success: true, tagId };
  } catch (error) {
    console.error("Error creating tag:", error);
    return { success: false };
  }
}

/**
 * Search workouts by tags.
 */
export async function searchWorkoutsByTagAction(
  userId: string,
  tags: string[],
  limit: number = 20,
): Promise<Array<{ date: string; note?: string; tags: string[] }>> {
  try {
    // MVP: Return sample results
    return [
      {
        date: "2025-12-28",
        note: "Great push day!",
        tags: ["Push Day", "PR Day"],
      },
      { date: "2025-12-26", note: undefined, tags: ["Pull Day"] },
      {
        date: "2025-12-24",
        note: "Legs were tired today",
        tags: ["Leg Day", "Low Energy"],
      },
    ];
  } catch (error) {
    console.error("Error searching workouts:", error);
    return [];
  }
}

/**
 * Get workout notes for a specific date.
 */
export async function getWorkoutNotesAction(
  userId: string,
  date: string,
): Promise<WorkoutNote | null> {
  try {
    // MVP: Return sample note
    return {
      id: "note-sample",
      workoutDate: date,
      content: "Felt strong today. Hit a new PR on bench!",
      tags: ["Push Day", "PR Day"],
      mood: "GREAT",
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error getting workout notes:", error);
    return null;
  }
}

/**
 * Update a workout note.
 */
export async function updateWorkoutNoteAction(
  userId: string,
  noteId: string,
  updates: Partial<Pick<WorkoutNote, "content" | "tags" | "mood">>,
): Promise<{ success: boolean }> {
  try {
    console.log(`Updated note ${noteId}`);
    revalidatePath("/workout-history");
    return { success: true };
  } catch (error) {
    console.error("Error updating note:", error);
    return { success: false };
  }
}

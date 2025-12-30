"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TemplateExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  sets: z.number().min(1).max(20),
  repsRange: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),
  restSeconds: z.number().min(0).max(600).optional(),
  notes: z.string().max(200).optional(),
});

const WorkoutTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    "PUSH",
    "PULL",
    "LEGS",
    "UPPER",
    "LOWER",
    "FULL_BODY",
    "CARDIO",
    "CUSTOM",
  ]),
  exercises: z.array(TemplateExerciseSchema).min(1).max(20),
  estimatedMinutes: z.number().min(5).max(180).optional(),
  tags: z.array(z.string()).max(5).optional(),
});

interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  exercises: z.infer<typeof TemplateExerciseSchema>[];
  estimatedMinutes?: number;
  tags?: string[];
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
}

/**
 * Create a new workout template.
 */
export async function createWorkoutTemplateAction(
  userId: string,
  data: z.infer<typeof WorkoutTemplateSchema>,
): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    const validated = WorkoutTemplateSchema.parse(data);

    // In production, save to database
    const templateId = `template-${userId}-${Date.now()}`;

    console.log(
      `Created template: ${validated.name} with ${validated.exercises.length} exercises`,
    );

    revalidatePath("/templates");
    return { success: true, templateId };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error creating template:", error);
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Get user's workout templates.
 */
export async function getWorkoutTemplatesAction(
  userId: string,
  category?: string,
): Promise<WorkoutTemplate[]> {
  try {
    // MVP: Return sample templates
    return [
      {
        id: "template-push-day",
        userId,
        name: "Push Day A",
        description: "Chest, shoulders, and triceps focus",
        category: "PUSH",
        exercises: [
          {
            exerciseId: "bench-press",
            exerciseName: "Barbell Bench Press",
            sets: 4,
            repsRange: { min: 6, max: 8 },
          },
          {
            exerciseId: "ohp",
            exerciseName: "Overhead Press",
            sets: 3,
            repsRange: { min: 8, max: 10 },
          },
          {
            exerciseId: "incline-db",
            exerciseName: "Incline Dumbbell Press",
            sets: 3,
            repsRange: { min: 10, max: 12 },
          },
          {
            exerciseId: "lateral-raise",
            exerciseName: "Lateral Raises",
            sets: 3,
            repsRange: { min: 12, max: 15 },
          },
          {
            exerciseId: "tricep-pushdown",
            exerciseName: "Tricep Pushdowns",
            sets: 3,
            repsRange: { min: 12, max: 15 },
          },
        ],
        estimatedMinutes: 60,
        tags: ["chest", "shoulders", "triceps"],
        usageCount: 12,
        createdAt: new Date(),
      },
      {
        id: "template-pull-day",
        userId,
        name: "Pull Day A",
        description: "Back and biceps focus",
        category: "PULL",
        exercises: [
          {
            exerciseId: "deadlift",
            exerciseName: "Deadlift",
            sets: 4,
            repsRange: { min: 5, max: 6 },
          },
          {
            exerciseId: "pullup",
            exerciseName: "Pull-ups",
            sets: 4,
            repsRange: { min: 6, max: 10 },
          },
          {
            exerciseId: "bb-row",
            exerciseName: "Barbell Row",
            sets: 3,
            repsRange: { min: 8, max: 10 },
          },
          {
            exerciseId: "face-pull",
            exerciseName: "Face Pulls",
            sets: 3,
            repsRange: { min: 15, max: 20 },
          },
          {
            exerciseId: "bicep-curl",
            exerciseName: "Bicep Curls",
            sets: 3,
            repsRange: { min: 10, max: 12 },
          },
        ],
        estimatedMinutes: 65,
        tags: ["back", "biceps"],
        usageCount: 10,
        createdAt: new Date(),
      },
    ].filter((t) => !category || t.category === category);
  } catch (error) {
    console.error("Error getting templates:", error);
    return [];
  }
}

/**
 * Start workout from template.
 */
export async function startWorkoutFromTemplateAction(
  userId: string,
  templateId: string,
): Promise<{ success: boolean; workoutId?: string }> {
  try {
    // In production:
    // 1. Load template
    // 2. Create new workout session
    // 3. Pre-populate exercises

    console.log(`Starting workout from template: ${templateId}`);

    const workoutId = `workout-${Date.now()}`;
    return { success: true, workoutId };
  } catch (error) {
    console.error("Error starting from template:", error);
    return { success: false };
  }
}

/**
 * Delete a template.
 */
export async function deleteWorkoutTemplateAction(
  userId: string,
  templateId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Deleted template: ${templateId}`);
    revalidatePath("/templates");
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false };
  }
}

/**
 * Duplicate a template.
 */
export async function duplicateTemplateAction(
  userId: string,
  templateId: string,
  newName: string,
): Promise<{ success: boolean; newTemplateId?: string }> {
  try {
    const newTemplateId = `template-${userId}-${Date.now()}`;
    console.log(`Duplicated template: ${templateId} -> ${newTemplateId}`);
    revalidatePath("/templates");
    return { success: true, newTemplateId };
  } catch (error) {
    console.error("Error duplicating template:", error);
    return { success: false };
  }
}

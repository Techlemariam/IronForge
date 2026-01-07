"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PresetSchema = z.object({
  name: z.string().min(1).max(50),
  skillIds: z.array(z.string()),
  description: z.string().max(200).optional(),
});

export async function saveSkillPresetAction(
  userId: string,
  data: { name: string; skillIds: string[]; description?: string },
) {
  try {
    const validated = PresetSchema.parse(data);

    const preset = await prisma.skillPreset.create({
      data: {
        userId,
        name: validated.name,
        skillIds: validated.skillIds,
        description: validated.description,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, preset };
  } catch (error) {
    console.error("Error saving skill preset:", error);
    return { success: false, error: "Failed to save preset" };
  }
}

export async function getSkillPresetsAction(userId: string) {
  try {
    const presets = await prisma.skillPreset.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, presets };
  } catch (error) {
    console.error("Error fetching skill presets:", error);
    return { success: false, presets: [] };
  }
}

export async function loadSkillPresetAction(userId: string, presetId: string) {
  try {
    const preset = await prisma.skillPreset.findFirst({
      where: { id: presetId, userId },
    });

    if (!preset) {
      return { success: false, error: "Preset not found" };
    }

    // Reset all skills first
    await prisma.userSkill.updateMany({
      where: { userId },
      data: { unlocked: false },
    });

    // Unlock skills from preset
    for (const skillId of preset.skillIds) {
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId, skillId } },
        update: { unlocked: true },
        create: { userId, skillId, unlocked: true },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, loadedSkills: preset.skillIds };
  } catch (error) {
    console.error("Error loading skill preset:", error);
    return { success: false, error: "Failed to load preset" };
  }
}

export async function deleteSkillPresetAction(
  userId: string,
  presetId: string,
) {
  try {
    await prisma.skillPreset.deleteMany({
      where: { id: presetId, userId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting skill preset:", error);
    return { success: false, error: "Failed to delete preset" };
  }
}

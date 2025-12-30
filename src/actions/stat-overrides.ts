"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const StatOverrideSchema = z.object({
  currentHp: z.number().min(0).max(1000).optional(),
  maxHp: z.number().min(100).max(1000).optional(),
  currentEnergy: z.number().min(0).max(100).optional(),
  maxEnergy: z.number().min(50).max(100).optional(),
  xp: z.number().min(0).optional(),
  level: z.number().min(1).max(100).optional(),
});

type StatOverrideInput = z.infer<typeof StatOverrideSchema>;

interface OverrideResult {
  success: boolean;
  message: string;
  previousValues?: Record<string, number>;
  newValues?: Record<string, number>;
}

/**
 * Manually override Titan stats.
 * Use with caution - intended for debugging or special circumstances.
 */
export async function overrideTitanStatsAction(
  userId: string,
  overrides: StatOverrideInput,
): Promise<OverrideResult> {
  try {
    const validated = StatOverrideSchema.parse(overrides);

    const titan = await prisma.titan.findFirst({
      where: { userId },
    });

    if (!titan) {
      return { success: false, message: "Titan not found" };
    }

    const previousValues: Record<string, number> = {};
    const updateData: Record<string, number> = {};

    if (validated.currentHp !== undefined) {
      previousValues.currentHp = titan.currentHp ?? 0;
      updateData.currentHp = validated.currentHp;
    }
    if (validated.maxHp !== undefined) {
      previousValues.maxHp = titan.maxHp ?? 100;
      updateData.maxHp = validated.maxHp;
    }
    if (validated.currentEnergy !== undefined) {
      previousValues.currentEnergy = titan.currentEnergy ?? 0;
      updateData.currentEnergy = validated.currentEnergy;
    }
    if (validated.maxEnergy !== undefined) {
      previousValues.maxEnergy = titan.maxEnergy ?? 100;
      updateData.maxEnergy = validated.maxEnergy;
    }
    if (validated.xp !== undefined) {
      previousValues.xp = titan.xp ?? 0;
      updateData.xp = validated.xp;
    }
    if (validated.level !== undefined) {
      previousValues.level = titan.level ?? 1;
      updateData.level = validated.level;
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, message: "No valid overrides provided" };
    }

    await prisma.titan.update({
      where: { id: titan.id },
      data: updateData,
    });

    // Log the override for audit trail
    console.log(
      `Stat override: userId=${userId}, changes=${JSON.stringify(updateData)}`,
    );

    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Updated ${Object.keys(updateData).length} stat(s)`,
      previousValues,
      newValues: updateData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.message}` };
    }
    console.error("Error overriding stats:", error);
    return { success: false, message: "Failed to override stats" };
  }
}

/**
 * Reset Titan to default state.
 */
export async function resetTitanStatsAction(
  userId: string,
): Promise<OverrideResult> {
  try {
    const titan = await prisma.titan.findFirst({
      where: { userId },
    });

    if (!titan) {
      return { success: false, message: "Titan not found" };
    }

    await prisma.titan.update({
      where: { id: titan.id },
      data: {
        currentHp: 100,
        maxHp: 100,
        currentEnergy: 100,
        maxEnergy: 100,
        xp: 0,
        level: 1,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Titan reset to default state",
      newValues: {
        currentHp: 100,
        maxHp: 100,
        currentEnergy: 100,
        maxEnergy: 100,
        xp: 0,
        level: 1,
      },
    };
  } catch (error) {
    console.error("Error resetting titan:", error);
    return { success: false, message: "Failed to reset titan" };
  }
}

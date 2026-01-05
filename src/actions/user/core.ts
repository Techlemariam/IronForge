"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Faction } from "@prisma/client";

export async function updateFactionAction(
  faction: Faction,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { faction },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update faction:", error);
    return { success: false, error: "Failed to update faction" };
  }
}

export async function updateArchetypeAction(
  archetype: any, // using any to avoid import issues if prisma client not fully regenned in scope
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { archetype },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update archetype:", error);
    return { success: false, error: "Failed to update archetype" };
  }
}

export async function ensureUserAction(id: string, email?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (existing) return { success: true, data: existing };

    const newUser = await prisma.user.create({
      data: {
        id,
        email,
        gold: 0,
        level: 1,
        totalExperience: 0,
        faction: "HORDE", // Default
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Failed to ensure user:", error);
    return { success: false, error: "Failed to ensure user" };
  }
}

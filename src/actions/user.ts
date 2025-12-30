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

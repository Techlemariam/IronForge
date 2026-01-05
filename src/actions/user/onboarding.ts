"use server";

import { createClient } from "@/utils/supabase/server";
import { ProgressionService } from "@/services/progression";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function completeOnboardingAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await ProgressionService.awardAchievement(user.id, "ONBOARDING_COMPLETED");

    // Explicitly persist onboarding state
    await prisma.user.update({
      where: { id: user.id },
      data: { hasCompletedOnboarding: true }
    });

    const newState = await ProgressionService.getProgressionState(user.id);
    revalidatePath("/"); // Refresh page to update client state if needed
    return { success: true, newState };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, message: "Failed to record completion" };
  }
}

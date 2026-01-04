"use server";

import { createClient } from "@/utils/supabase/server";
import { PlannerService } from "@/services/planner";
import { revalidatePath } from "next/cache";

/**
 * Server Action to manually trigger weekly plan generation for the current user.
 */
export async function generateWeeklyPlanAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    console.log(`Action: Triggering plan generation for ${user.id}`);
    const plan = await PlannerService.triggerWeeklyPlanGeneration(user.id);

    revalidatePath("/dashboard");
    return { success: true, plan };
  } catch (error: any) {
    console.error("Failed to generate plan:", error);
    return { success: false, error: error.message };
  }
}

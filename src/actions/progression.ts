"use server";

import { ProgressionService } from "@/services/progression";
import { createClient } from "@/utils/supabase/server";
import { AwardGoldSchema } from "@/types/schemas";

export async function getProgressionAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    return await ProgressionService.getProgressionState(user.id);
  } catch (e) {
    console.error("Progression Action Error:", e);
    return null;
  }
}

export async function awardGoldAction(amount: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const validated = AwardGoldSchema.parse({ amount });
    return await ProgressionService.awardGold(user.id, validated.amount);
  } catch (e) {
    console.error("Award Gold Action Error:", e);
    return null;
  }
}

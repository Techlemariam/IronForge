'use server';

import { PlannerService } from '@/services/planner';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger, logError } from '@/lib/logger';

/**
 * Server Action to manually trigger weekly plan generation for the current user.
 */
export async function generateWeeklyPlanAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    logger.info(`Action: Triggering plan generation for ${user.id}`);
    const plan = await PlannerService.triggerWeeklyPlanGeneration(user.id);

    revalidatePath('/dashboard');
    return { success: true, plan };
  } catch (error: any) {
    logError('Failed to generate plan:', error);
    return { success: false, error: error.message };
  }
}

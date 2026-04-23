'use server';

import { ProgressionService } from '@/services/progression';
import { AwardGoldSchema } from '@/types/schemas';
import { createClient } from '@/utils/supabase/server';
import { logger, logError } from '@/lib/logger';

export async function getProgressionAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    return await ProgressionService.getProgressionState(user.id);
  } catch (e) {
    logError('Progression Action Error:', e);
    return null;
  }
}

export async function awardGoldAction(amount: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const validated = AwardGoldSchema.parse({ amount });
    return await ProgressionService.awardGold(user.id, validated.amount);
  } catch (e) {
    logError('Award Gold Action Error:', e);
    return null;
  }
}

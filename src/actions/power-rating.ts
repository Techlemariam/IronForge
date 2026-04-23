'use server';

import { getSession } from '@/lib/auth';
import { PowerRatingService } from '@/services/game/PowerRatingService';
import { revalidatePath } from 'next/cache';
import { logger, logError } from '@/lib/logger';

/**
 * Recalculate the user's Power Score.
 * Rate limited to once every 6 hours (handled in service or here).
 */
export async function recalculatePowerScoreAction() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await PowerRatingService.syncPowerRating(session.user.id);

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return {
      success: true,
      powerRating: result.powerRating,
      tier: PowerRatingService.getTierDetails(result.powerRating).name,
    };
  } catch (error: any) {
    logError('Failed to recalculate power score:', error);
    return { success: false, error: error.message || 'Failed to recalculate power score' };
  }
}

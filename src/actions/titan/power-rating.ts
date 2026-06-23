'use server';

import { getErrorMessage } from '@/lib/error-message';
import { revalidatePath } from 'next/cache';

export async function recalculatePowerRatingAction(userId: string) {
  try {
    const { PowerRatingService } = await import('@/services/game/PowerRatingService');

    const result = await PowerRatingService.syncPowerRating(userId);

    revalidatePath('/dashboard');
    revalidatePath('/citadel');
    revalidatePath('/leaderboard');

    return { success: true, data: result.titan };
  } catch (error) {
    console.error('Error recalculating Power Rating:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

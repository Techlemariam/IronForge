'use server';

import prisma from '@/lib/prisma';
import { Progression } from '@/services/progression';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completeOnboardingAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await Progression.awardAchievement(user.id, 'ONBOARDING_COMPLETED');

    // Explicitly persist onboarding state
    await prisma.user.update({
      where: { id: user.id },
      data: { hasCompletedOnboarding: true },
    });

    const newState = await Progression.getProgressionState(user.id);
    revalidatePath('/'); // Refresh page to update client state if needed
    return { success: true, newState };
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    return { success: false, message: 'Failed to record completion' };
  }
}

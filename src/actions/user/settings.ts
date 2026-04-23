'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logger, logError } from '@/lib/logger';

export interface UserPreferences {
  liteMode?: boolean;
  theme?: 'light' | 'dark' | 'system';
  // Add more preferences here as needed
}

export async function updateUserPreferencesAction(userId: string, preferences: UserPreferences) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const currentPreferences = (user?.preferences as UserPreferences) || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
    });

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    logError('Error updating user preferences:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

export async function getUserPreferencesAction(userId: string): Promise<UserPreferences> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    return (user?.preferences as UserPreferences) || {};
  } catch (error) {
    logError('Error getting user preferences:', error);
    return {};
  }
}

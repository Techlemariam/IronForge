"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const _NotificationPreferencesSchema = z.object({
  // Workout reminders
  dailyReminder: z.boolean(),
  dailyReminderTime: z.string().optional(), // HH:MM format

  // Achievement notifications
  achievementUnlocked: z.boolean(),
  levelUp: z.boolean(),
  newPR: z.boolean(),

  // Social notifications
  guildActivity: z.boolean(),
  friendWorkout: z.boolean(),
  challengeReceived: z.boolean(),

  // System notifications
  weeklyReport: z.boolean(),
  recoveryAlerts: z.boolean(),
  updateNews: z.boolean(),

  // Marketing
  promotions: z.boolean(),
});

type NotificationPreferences = z.infer<typeof _NotificationPreferencesSchema>;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  dailyReminder: true,
  dailyReminderTime: "09:00",
  achievementUnlocked: true,
  levelUp: true,
  newPR: true,
  guildActivity: true,
  friendWorkout: false,
  challengeReceived: true,
  weeklyReport: true,
  recoveryAlerts: true,
  updateNews: false,
  promotions: false,
};

/**
 * Get user's notification preferences.
 */
export async function getNotificationPreferencesAction(
  userId: string,
): Promise<NotificationPreferences> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });

    if (user?.notificationPreferences) {
      return {
        ...DEFAULT_PREFERENCES,
        ...(user.notificationPreferences as object),
      };
    }

    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update notification preferences.
 */
export async function updateNotificationPreferencesAction(
  userId: string,
  preferences: Partial<NotificationPreferences>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getNotificationPreferencesAction(userId);
    const updated = { ...current, ...preferences };

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: updated },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

/**
 * Check if user wants specific notification type.
 */
export async function shouldSendNotificationAction(
  userId: string,
  type: keyof NotificationPreferences,
): Promise<boolean> {
  try {
    const prefs = await getNotificationPreferencesAction(userId);
    return prefs[type] === true;
  } catch {
    return false;
  }
}

/**
 * Reset to defaults.
 */
export async function resetNotificationPreferencesAction(
  userId: string,
): Promise<{ success: boolean }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: DEFAULT_PREFERENCES },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Toggle a specific preference quickly.
 */
export async function toggleNotificationAction(
  userId: string,
  key: keyof NotificationPreferences,
): Promise<{ success: boolean; newValue: boolean }> {
  try {
    const prefs = await getNotificationPreferencesAction(userId);
    const newValue = !prefs[key];

    await updateNotificationPreferencesAction(userId, { [key]: newValue });

    return { success: true, newValue };
  } catch {
    return { success: false, newValue: false };
  }
}

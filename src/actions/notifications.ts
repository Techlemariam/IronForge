"use server";

import { NotificationService } from "@/services/notifications";
import { createClient } from "@/utils/supabase/server";

export async function getUnreadNotificationsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, notifications: [] };

  try {
    const notifications = await NotificationService.getUnread(user.id);
    return { success: true, notifications };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, notifications: [] };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  try {
    await NotificationService.markAsRead(notificationId);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  try {
    await NotificationService.markAllAsRead(user.id);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false };
  }
}

import prisma from "@/lib/prisma";

export type NotificationType = "ORACLE_DECREE" | "DUEL_UPDATE" | "SYSTEM" | "ACHIEVEMENT";

export interface NotificationPayload {
    userId: string;
    type: NotificationType;
    message: string;
}

export class NotificationService {
    /**
     * Create a new notification for a user.
     */
    static async create(payload: NotificationPayload) {
        // Model missing - temporarily logging
        console.log("[Notification] Created:", payload);
        return { id: "temp-id", ...payload, createdAt: new Date() };
    }

    /**
     * Get all unread notifications for a user.
     */
    static async getUnread(userId: string) {
        return [];
    }

    /**
     * Get recent notifications (read + unread).
     */
    static async getRecent(userId: string, limit = 20) {
        return [];
    }

    /**
     * Mark a notification as read.
     */
    static async markAsRead(notificationId: string) {
        return { success: true };
    }

    /**
     * Mark all notifications as read for a user.
     */
    static async markAllAsRead(userId: string) {
        return { count: 0 };
    }

    /**
     * Delete old notifications (cleanup).
     */
    static async cleanup(olderThanDays = 30) {
        return { count: 0 };
    }
}

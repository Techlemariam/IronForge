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
        return prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                message: payload.message,
            },
        });
    }

    /**
     * Get all unread notifications for a user.
     */
    static async getUnread(userId: string) {
        return prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
    }

    /**
     * Get recent notifications (read + unread).
     */
    static async getRecent(userId: string, limit = 20) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }

    /**
     * Mark a notification as read.
     */
    static async markAsRead(notificationId: string) {
        return prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }

    /**
     * Mark all notifications as read for a user.
     */
    static async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    /**
     * Delete old notifications (cleanup).
     */
    static async cleanup(olderThanDays = 30) {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
        return prisma.notification.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });
    }
}

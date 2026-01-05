import webpush from "web-push";
import prisma from "@/lib/prisma";

// Generate VAPID keys if not present (usually set in .env)
// webpush.generateVAPIDKeys()
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@ironforge.gg";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
}

export class PushNotificationService {
    /**
     * Sends a push notification to all subscriptions of a specific user.
     */
    static async sendToUser(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.warn("PushNotificationService: VAPID keys missing. Skipping push.");
            return;
        }

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            return;
        }

        const notificationPayload = JSON.stringify({
            notification: {
                title: payload.title,
                body: payload.body,
                icon: payload.icon || "/icons/icon-192x192.png",
                data: {
                    url: payload.url || "/dashboard",
                },
            },
        });

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: (sub.keys as unknown) as PushSubscriptionKeys,
                    };

                    await webpush.sendNotification(pushSubscription, notificationPayload);
                } catch (error: any) {
                    // If the subscription is no longer valid, delete it
                    if (error.statusCode === 404 || error.statusCode === 410) {
                        console.log(`PushNotificationService: Cleaning up expired subscription for user ${userId}`);
                        await prisma.pushSubscription.delete({ where: { id: sub.id } });
                    } else {
                        console.error(`PushNotificationService: Error sending to ${sub.endpoint}`, error);
                    }
                }
            })
        );

        return results;
    }
}

'use server';

import webpush from 'web-push';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// Initialize VAPID
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
        'mailto:admin@ironforge.gg',
        publicVapidKey,
        privateVapidKey
    );
} else {
    console.warn("⚠️ VAPID Keys missing. Push notifications disabled.");
}

export async function subscribeUserAction(subscription: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.pushSubscription.create({
            data: {
                userId: user.id,
                endpoint: subscription.endpoint,
                keys: subscription.keys, // JSON
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to save subscription:", error);
        return { success: false, error: "Database error" };
    }
}

export async function sendNotificationAction(userId: string, title: string, body: string) {
    // 1. Get subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    if (subscriptions.length === 0) return { success: false, error: "No subscriptions found" };

    if (!publicVapidKey || !privateVapidKey) {
        console.log(`[MOCK PUSH] To ${userId}: ${title} - ${body}`);
        return { success: true, mock: true };
    }

    const payload = JSON.stringify({ title, body, icon: '/icons/icon-192x192.png' });

    let successCount = 0;
    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys as any
            }, payload);
            successCount++;
        } catch (error: any) {
            console.error("Push failed:", error);
            if (error.statusCode === 410) {
                // Expired, delete
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
        }
    }

    return { success: true, count: successCount };
}

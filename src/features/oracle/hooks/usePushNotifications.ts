import { useState, useEffect } from "react";
import { subscribeToPushNotificationsAction } from "@/actions/notifications/push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSupport = () => {
            const supported = "serviceWorker" in navigator && "PushManager" in window;
            setIsSupported(supported);
            if (supported) {
                setPermission(Notification.permission);
                checkExistingSubscription();
            } else {
                setLoading(false);
            }
        };

        checkSupport();
    }, []);

    const checkExistingSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (err) {
            console.error("Error checking subscription:", err);
        } finally {
            setLoading(false);
        }
    };

    const subscribe = async () => {
        if (!VAPID_PUBLIC_KEY) {
            console.error("VAPID public key not found");
            return;
        }

        try {
            setLoading(true);
            const registration = await navigator.serviceWorker.ready;

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: VAPID_PUBLIC_KEY,
            });

            // Save to server
            const subJson = sub.toJSON();

            if (!subJson.endpoint || !subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
                console.error("Invalid subscription object generated");
                return false;
            }

            const result = await subscribeToPushNotificationsAction({
                endpoint: subJson.endpoint,
                keys: {
                    p256dh: subJson.keys.p256dh,
                    auth: subJson.keys.auth
                }
            });

            if (result.success) {
                setSubscription(sub);
                setPermission(Notification.permission);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Failed to subscribe to push notifications:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        try {
            setLoading(true);
            if (subscription) {
                await subscription.unsubscribe();
                setSubscription(null);
                // You might want to also delete it from the server here
            }
        } catch (err) {
            console.error("Failed to unsubscribe:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        isSupported,
        subscription,
        permission,
        subscribe,
        unsubscribe,
        loading,
    };
}

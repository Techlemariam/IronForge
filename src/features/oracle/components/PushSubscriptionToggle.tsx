"use client";

import React from "react";
import { usePushNotifications } from "@/features/oracle/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/GameToast";

export function PushSubscriptionToggle() {
    const { isSupported, subscription, subscribe, unsubscribe, loading, permission } = usePushNotifications();

    if (!isSupported) {
        return null;
    }

    const handleSubscribe = async () => {
        const success = await subscribe();
        if (success) {
            toast.success("Oracle Uplink Established", {
                description: "You will now receive proactive decrees via push.",
            });
        } else {
            toast.error("Uplink Failed", {
                description: "Check browser permissions for notifications.",
            });
        }
    };

    const handleUnsubscribe = async () => {
        await unsubscribe();
        toast.info("Uplink Severed", {
            description: "Oracle will no longer push decrees to this device.",
        });
    };

    return (
        <div className="flex items-center justify-between p-4 bg-void/50 border border-forge-700 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${subscription ? "bg-emerald-500/20 text-emerald-500" : "bg-forge-700 text-forge-400"}`}>
                    {subscription ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-forge-100 uppercase tracking-tight">Oracle Comms Link</h3>
                    <p className="text-xs text-forge-400">
                        {subscription ? "Direct neural link active" : "Enable push for proactive decrees"}
                    </p>
                </div>
            </div>

            <Button
                variant={subscription ? "outline" : "default"}
                size="sm"
                onClick={subscription ? handleUnsubscribe : handleSubscribe}
                disabled={loading || (permission === "denied" && !subscription)}
                className={subscription ? "border-forge-600 text-forge-300" : "bg-magma hover:bg-magma-light text-white font-bold"}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : subscription ? (
                    "Disable"
                ) : (
                    "Enable Link"
                )}
            </Button>
        </div>
    );
}

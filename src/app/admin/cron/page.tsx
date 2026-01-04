"use client";

import React, { useState } from "react";
import { toast, GameToaster } from "@/components/ui/GameToast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Play, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminCronPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const triggerCron = async (path: string, name: string) => {
        setIsLoading(name);
        try {
            // In a real app we'd call the API with the secret
            const res = await fetch(path, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev_secret'}`
                }
            });

            if (res.ok) {
                toast.success(`${name} trigger success`, {
                    className: "toast" // Added class for E2E test locator if needed
                });
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(`${name} failed: ${data.error || res.statusText}`);
            }
        } catch (e) {
            toast.error(`${name} error: ${String(e)}`);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <>
            <GameToaster />
            <div className="min-h-screen bg-black p-8 text-white">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight uppercase">Cron Dashboard</h1>
                        <p className="text-zinc-500 font-mono text-sm">Manual Trigger Interface</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Power Rating
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-zinc-400">
                                    Recalculates Titan power ratings, strength/cardio indices, and applies inactivity decay.
                                </p>
                                <Button
                                    onClick={() => triggerCron("/api/cron/power-rating", "Power Rating")}
                                    disabled={!!isLoading}
                                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                                >
                                    {isLoading === "Power Rating" ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Play className="w-4 h-4 mr-2" />
                                    )}
                                    Run Power Rating Cron
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    Maintenance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-zinc-400">
                                    Weekly maintenance: Territory settlement and general cleanup.
                                </p>
                                <Button
                                    onClick={() => triggerCron("/api/cron/maintenance/weekly", "Weekly Maintenance")}
                                    disabled={!!isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
                                >
                                    {isLoading === "Weekly Maintenance" ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Play className="w-4 h-4 mr-2" />
                                    )}
                                    Run Weekly Maintenance
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-lg flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="text-xs text-amber-200/70">
                            <p className="font-bold text-amber-500 uppercase mb-1">Warning</p>
                            Triggering these manually will affect production data. Use with caution.
                            Authorization relies on NEXT_PUBLIC_CRON_SECRET in this interface.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

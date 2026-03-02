"use client";

import React, { useState } from "react";
import { toast, GameToaster } from "@/components/ui/GameToast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Play, CheckCircle2 } from "lucide-react";
import { triggerCronAction } from "@/actions/admin/cron";

export default function AdminCronPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const triggerCron = async (path: string, name: string) => {
        setIsLoading(name);
        try {
            const res = await triggerCronAction(path);

            if (res.success) {
                toast.success(`${name} trigger success`, {
                    className: "toast"
                });
            } else {
                toast.error(`${name} failed: ${res.error}`);
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
                </div>
            </div>
        </>
    );
}

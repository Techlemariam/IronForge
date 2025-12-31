"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { getDuelArenaStateAction } from "@/actions/duel";
import { Swords, Trophy, Timer, Bike, Footprints, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DuelArenaProps {
    duelId: string;
    currentUserId: string;
    onClose: () => void;
}

export function DuelArena({ duelId, currentUserId, onClose }: DuelArenaProps) {
    const [duelState, setDuelState] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Polling logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchState = async () => {
            const result = await getDuelArenaStateAction(duelId);
            if (result.success) {
                setDuelState(result.duel);
                setLastUpdated(new Date());
            } else {
                toast.error("Lost connection to arena...");
            }
            setLoading(false);
        };

        // Initial fetch
        fetchState();

        // Poll every 2 seconds
        intervalId = setInterval(fetchState, 2000);

        return () => clearInterval(intervalId);
    }, [duelId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4" />
                <p>Connecting to Iron Arena...</p>
            </div>
        );
    }

    if (!duelState) return null;

    const isChallenger = currentUserId === duelState.challengerId;
    const user = isChallenger ? duelState.challenger : duelState.defender;
    const opponent = isChallenger ? duelState.defender : duelState.challenger;

    const userDistance = isChallenger ? duelState.challengerDistance : duelState.defenderDistance;
    const opponentDistance = isChallenger ? duelState.defenderDistance : duelState.challengerDistance;

    // Calculate progress
    let maxMetric = 100;
    if (duelState.duelType === "DISTANCE_RACE" || duelState.activityType === "SPEED_DEMON") {
        maxMetric = duelState.targetDistance || (duelState.duelType === "DISTANCE_RACE" ? Math.max(userDistance, opponentDistance, 5) : 10);
    } else if (duelState.durationMinutes) {
        // Time based?
        // Actually for distance race, target is duration? No.
        // Let's assume duration races use time as the limiter and distance as the score.
        // Ideally we want relative progress.
        maxMetric = Math.max(userDistance, opponentDistance, 1);
    }

    // Cap at 100%
    const userProgress = Math.min((userDistance / maxMetric) * 100, 100);
    const opponentProgress = Math.min((opponentDistance / maxMetric) * 100, 100);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
                <Button
                    variant="ghost"
                    className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white"
                    onClick={onClose}
                >
                    Exit Arena
                </Button>

                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 opacity-90" />
                <div className={`absolute inset-0 bg-[url('/assets/arena_bg.jpg')] bg-cover bg-center opacity-20`} />

                <div className="relative z-0 p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/50 px-4 py-1 text-sm tracking-widest uppercase">
                            Live Duel
                        </Badge>
                        <h2 className="text-3xl font-black italic">{duelState.duelType.replace(/_/g, " ")}</h2>
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <Timer className="w-4 h-4" />
                            <span>Duration: {duelState.durationMinutes}m</span>
                            <span>•</span>
                            {duelState.activityType === "CYCLING" ? <Bike className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
                            <span>{duelState.activityType}</span>
                        </div>
                    </div>

                    {/* The Race Track */}
                    <div className="space-y-8 py-8 bg-black/40 rounded-xl p-6 border border-white/5">
                        {/* User Lane */}
                        <div className="relative">
                            <div className="flex justify-between items-end mb-2 text-blue-400 font-bold uppercase tracking-wider text-sm">
                                <span>{user.heroName || "You"}</span>
                                <span>{userDistance.toFixed(2)} km</span>
                            </div>
                            <div className="h-12 bg-slate-800 rounded-full relative overflow-hidden ring-2 ring-blue-500/20">
                                <motion.div
                                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-800 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${userProgress}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                                {/* Avatar on the track */}
                                <motion.div
                                    className="absolute top-1 bottom-1 aspect-square rounded-full border-2 border-white shadow-lg bg-slate-900 z-10"
                                    initial={{ left: 0 }}
                                    animate={{ left: `calc(${userProgress}% - 40px)` }}
                                >
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback className="text-blue-500 text-xs">YOU</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </div>
                        </div>

                        {/* Opponent Lane */}
                        <div className="relative">
                            <div className="flex justify-between items-end mb-2 text-red-400 font-bold uppercase tracking-wider text-sm">
                                <span>{opponent.heroName || "Opponent"}</span>
                                <span>{opponentDistance.toFixed(2)} km</span>
                            </div>
                            <div className="h-12 bg-slate-800 rounded-full relative overflow-hidden ring-2 ring-red-500/20">
                                <motion.div
                                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-800 to-red-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${opponentProgress}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                                {/* Avatar on the track */}
                                <motion.div
                                    className="absolute top-1 bottom-1 aspect-square rounded-full border-2 border-white shadow-lg bg-slate-900 z-10"
                                    initial={{ left: 0 }}
                                    animate={{ left: `calc(${opponentProgress}% - 40px)` }}
                                >
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={opponent.image} />
                                        <AvatarFallback className="text-red-500 text-xs">OPP</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-blue-500/5 border-blue-500/20 p-4 text-center">
                            <div className="text-sm text-slate-400 uppercase">You are</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {userDistance > opponentDistance ? "Ahead" : "Behind"}
                            </div>
                            <div className="text-xs text-slate-500">by {Math.abs(userDistance - opponentDistance).toFixed(2)} km</div>
                        </Card>
                        <Card className="bg-slate-800/50 border-white/5 p-4 text-center">
                            <div className="text-sm text-slate-400 uppercase">Status</div>
                            <div className="text-2xl font-bold text-white">LIVE</div>
                            <div className="text-xs text-green-400 animate-pulse">● Updating</div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

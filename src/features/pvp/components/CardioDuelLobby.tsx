"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createDuelChallengeAction, getPotentialOpponentsAction } from "@/actions/pvp/duel";
import { toast } from "sonner";
import { Bike, Footprints, Trophy } from "lucide-react";

interface Opponent {
    id: string;
    heroName: string;
    level: number;
    titan?: { powerRating: number };
}

export function CardioDuelLobby() {
    const [opponents, setOpponents] = useState<Opponent[]>([]);
    const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
    const [duelType, _setDuelType] = useState("DISTANCE_RACE");
    const [activityType, setActivityType] = useState("RUNNING");
    const [distance, setDistance] = useState("5");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOpponents();
    }, []);

    const loadOpponents = async () => {
        const res = await getPotentialOpponentsAction();
        if (res.success && res.opponents) {
            // Fix: Map to ensure heroName is string (fallback for null)
            const sanitized: Opponent[] = res.opponents.map((opp: any) => ({
                id: opp.id,
                heroName: opp.heroName || "Unknown Titan",
                level: opp.level, // Assuming level is always present/valid based on schema, otherwise provide default
                titan: opp.titan ? { powerRating: opp.titan.powerRating } : undefined
            }));
            setOpponents(sanitized);
        }
    };

    const handleCreateDuel = async () => {
        if (!selectedOpponent) return;
        setLoading(true);

        const result = await createDuelChallengeAction(selectedOpponent, {
            duelType,
            activityType,
            targetDistance: parseFloat(distance),
        });

        if (result.success) {
            toast.success("Duel Challenge Sent!");
            setSelectedOpponent(null);
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        New Cardio Duel
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Activity</label>
                            <Select value={activityType} onValueChange={setActivityType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RUNNING">
                                        <div className="flex items-center gap-2"><Footprints className="h-4 w-4" /> Running</div>
                                    </SelectItem>
                                    <SelectItem value="CYCLING">
                                        <div className="flex items-center gap-2"><Bike className="h-4 w-4" /> Cycling</div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Target Distance</label>
                            <Select value={distance} onValueChange={setDistance}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 km</SelectItem>
                                    <SelectItem value="5">5 km</SelectItem>
                                    <SelectItem value="10">10 km</SelectItem>
                                    <SelectItem value="21.1">Half Marathon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Opponent Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Select Rival (Matched by Power Rating)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                            {opponents.map((opp) => (
                                <div
                                    key={opp.id}
                                    onClick={() => setSelectedOpponent(opp.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selectedOpponent === opp.id
                                        ? "border-emerald-500 bg-emerald-900/20"
                                        : "border-slate-700 hover:bg-slate-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{opp.heroName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-sm">{opp.heroName}</div>
                                            <div className="text-xs text-slate-500">Lvl {opp.level} • PR: {Math.round(opp.titan?.powerRating || 0)}</div>
                                        </div>
                                    </div>
                                    {selectedOpponent === opp.id && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                        disabled={!selectedOpponent || loading}
                        onClick={handleCreateDuel}
                    >
                        {loading ? "Sending..." : "Send Challenge"}
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}

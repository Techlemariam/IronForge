"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Swords, Send } from "lucide-react";
import { sendTauntAction } from "@/actions/pvp/duel";
import { toast } from "sonner";
import { useState } from "react";

interface CardioDuelProps {
    duel: {
        id: string;
        duelType: string;
        targetDistance?: number;
        challenger: { heroName: string; level: number; id: string };
        defender: { heroName: string; level: number; id: string };
        challengerDistance: number;
        defenderDistance: number;
    };
    currentUserId: string;
}

export function CardioDuelCard({ duel, currentUserId }: CardioDuelProps) {
    const [isTaunting, setIsTaunting] = useState(false);
    const isChallenger = currentUserId === duel.challenger.id;

    const myDistance = isChallenger ? duel.challengerDistance : duel.defenderDistance;
    const oppDistance = isChallenger ? duel.defenderDistance : duel.challengerDistance;
    const opponentName = isChallenger ? duel.defender.heroName : duel.challenger.heroName;

    const target = duel.targetDistance || 10; // Default 10km if missing
    const myProgress = Math.min(100, (myDistance / target) * 100);
    const oppProgress = Math.min(100, (oppDistance / target) * 100);

    const handleTaunt = async () => {
        setIsTaunting(true);
        await sendTauntAction(duel.id);
        toast.success(`Taunted ${opponentName}!`);
        setTimeout(() => setIsTaunting(false), 5000); // Cooldown
    };

    return (
        <Card className="w-full mb-4 border-2 border-slate-700 bg-slate-900/50">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Swords className="h-5 w-5 text-red-400" />
                        <span className="font-bold text-slate-200">
                            {duel.duelType === "DISTANCE_RACE" ? "Distance Race" : "Cardio Duel"}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                            Target: {target}km
                        </Badge>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={isTaunting}
                        onClick={handleTaunt}
                        className="text-xs text-slate-400 hover:text-red-400"
                    >
                        <Send className="h-3 w-3 mr-1" />
                        Taunt
                    </Button>
                </div>

                {/* My Progress */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-emerald-400">You</span>
                        <span className="text-slate-400">
                            {myDistance.toFixed(1)} / {target} km
                        </span>
                    </div>
                    <Progress value={myProgress} className="h-3 bg-slate-800" indicatorClassName="bg-emerald-500" />
                </div>

                {/* Opponent Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-red-400">{opponentName}</span>
                        <span className="text-slate-400">
                            {oppDistance.toFixed(1)} / {target} km
                        </span>
                    </div>
                    <Progress value={oppProgress} className="h-3 bg-slate-800" indicatorClassName="bg-red-500" />
                </div>
            </CardContent>
        </Card>
    );
}

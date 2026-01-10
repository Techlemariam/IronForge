"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Dumbbell, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { WorkoutDefinition } from "@/types/training";
import { getTitanChoiceAction } from "@/actions/dashboard/titans-choice";

interface TitansChoiceProps {
    className?: string;
    userId: string;
}

interface TitansChoiceResult {
    workout: WorkoutDefinition;
    reason: string;
}

export function TitansChoice({ className, userId }: TitansChoiceProps) {
    const [data, setData] = useState<TitansChoiceResult | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchChoice = async () => {
            try {
                const result = await getTitanChoiceAction(userId);
                // @ts-ignore - The action returns { workout, reason } now
                if (result) setData(result);
            } catch (e) {
                console.error("Failed to fetch Titan's Choice", e);
            } finally {
                setLoading(false);
            }
        };
        fetchChoice();
    }, [userId]);

    if (loading) return null; // Or skeleton
    if (!data) return null;

    const { workout, reason } = data;

    return (
        <Card className={cn("border-magma/40 bg-zinc-900/50 relative overflow-hidden group", className)}>
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-magma/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                    <Crown className="w-5 h-5 text-magma fill-magma animate-pulse" />
                    Titan&apos;s Choice
                </CardTitle>
                <span className="text-xs font-mono text-magma/80 uppercase tracking-widest border border-magma/30 px-2 py-0.5 rounded-full bg-magma/10">
                    Oracle
                </span>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="flex flex-col gap-1 mb-2">
                    <h3 className="text-2xl font-black text-white">{workout.name}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-1">{workout.description}</p>
                </div>

                <p className="text-xs text-blue-300 font-mono mb-4 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {reason}
                </p>

                <div className="flex items-center gap-4 text-sm text-zinc-300 mb-6">
                    <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-magma" />
                        <span>{workout.exercises?.length || 0} Exercises</span>
                    </div>
                    <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span>{workout.durationMin} Min</span>
                    <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span className={cn(
                        "uppercase font-bold text-xs",
                        workout.intensity === 'HIGH' ? "text-red-400" : "text-blue-400"
                    )}>
                        {workout.intensity} Intensity
                    </span>
                </div>

                <Button
                    className="w-full bg-magma hover:bg-magma/90 text-white font-bold group-hover:translate-x-1 transition-transform"
                    onClick={() => router.push(`/dashboard/strength/active?workoutId=${workout.id}`)}
                >
                    Start Workout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState } from "react";
import { Exercise } from "@prisma/client";
import ExerciseSelector from "./ExerciseSelector";
import SetLogger from "./SetLogger";
import { Dumbbell } from "lucide-react";
import ForgeCard from "@/components/ui/ForgeCard";

export default function QuickLogSession() {
    const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

    return (
        <div className="space-y-6">
            {!activeExercise ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center space-y-2 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-magma to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-magma/20">
                            <Dumbbell className="h-8 w-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white uppercase font-heading">
                            Iron Logger
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                            Select an exercise to begin logging. New exercises are added to your library automatically.
                        </p>
                    </div>

                    <ForgeCard className="max-w-md mx-auto relative overflow-visible">
                        <ExerciseSelector onSelect={setActiveExercise} />
                    </ForgeCard>
                </div>
            ) : (
                <div className="max-w-md mx-auto">
                    <SetLogger
                        exercise={activeExercise}
                        onFinish={() => setActiveExercise(null)}
                        onCancel={() => setActiveExercise(null)}
                    />
                </div>
            )}
        </div>
    );
}

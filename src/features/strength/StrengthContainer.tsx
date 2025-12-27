'use client';

import React, { useState } from 'react';
import { StrengthLog } from './StrengthLog';
import { ExerciseSearch } from './ExerciseSearch';
import { RestTimer } from './RestTimer';
import { Dumbbell, ArrowLeft } from 'lucide-react';

interface StrengthContainerProps {
    userId: string;
}

export const StrengthContainer: React.FC<StrengthContainerProps> = ({ userId }) => {
    const [selectedExercise, setSelectedExercise] = useState<{ id: string, name: string } | null>(null);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Strength Log</h1>
                    <p className="text-zinc-400">Track your lifts, set PRs, and become a Titan.</p>
                </div>
                <div className="hidden md:block">
                    <RestTimer autoStart={false} />
                </div>
            </header>

            {!selectedExercise ? (
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="bg-white/5 p-4 rounded-full mb-6">
                        <Dumbbell className="w-12 h-12 text-zinc-600" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Select an Exercise</h2>
                    <p className="text-zinc-500 mb-6 text-center max-w-sm">
                        Search for an exercise to begin logging your workout sets.
                    </p>
                    <ExerciseSearch onSelect={(id, name) => setSelectedExercise({ id, name })} />
                </div>
            ) : (
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedExercise(null)}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <StrengthLog
                                userId={userId}
                                exerciseId={selectedExercise.id}
                                exerciseName={selectedExercise.name}
                            />
                        </div>
                        <div className="md:col-span-1 space-y-6">
                            <div className="md:hidden">
                                <RestTimer />
                            </div>
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                                <h4 className="font-bold text-zinc-400 text-sm mb-2 uppercase">Exercise Stats</h4>
                                <div className="text-xs text-zinc-600 italic">No history available yet.</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

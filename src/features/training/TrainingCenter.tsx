'use client';

import React from 'react';
import { TrainingPath, LayerLevel } from '@/types/training';
import { PathSelector } from '@/components/PathSelector';
import { PassiveLayerProgress } from '@/components/PassiveLayerProgress';
import { ArrowLeft } from 'lucide-react';

interface TrainingCenterProps {
    activePath: TrainingPath;
    mobilityLevel: LayerLevel;
    recoveryLevel: LayerLevel;
    onClose: () => void;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = ({
    activePath,
    mobilityLevel,
    recoveryLevel,
    onClose
}) => {
    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-6">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-zinc-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                        Training Command Center
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Manage your active Training Path and Passive Layers.
                    </p>
                </div>
            </div>

            {/* Active Path Selector */}
            <section>
                <h2 className="text-xl font-bold uppercase text-magma mb-4 tracking-wider">
                    Active Training Path
                </h2>
                <PathSelector initialPath={activePath} />
            </section>

            {/* Passive Layers */}
            <section className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                <PassiveLayerProgress
                    mobilityLevel={mobilityLevel}
                    recoveryLevel={recoveryLevel}
                    mobilitySessionsCompleted={mobilityLevel === 'NONE' ? 2 : 15} // Mock progress for now
                    recoverySessionsCompleted={recoveryLevel === 'NONE' ? 5 : 45} // Mock progress for now
                />
            </section>

            {/* Training Codex */}
            <CodexSection activePath={activePath} />
        </div>
    );
};

// Sub-component for Codex to keep main cleaner
import { WORKOUT_LIBRARY } from '@/data/workouts';
import { Book, Clock, Activity, Zap } from 'lucide-react';
import { WorkoutDefinition } from '@/types/training';

const CodexSection: React.FC<{ activePath: TrainingPath }> = ({ activePath }) => {
    const recommended = WORKOUT_LIBRARY.filter(w => (w.recommendedPaths || []).includes(activePath));
    const others = WORKOUT_LIBRARY.filter(w => !(w.recommendedPaths || []).includes(activePath));

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Book className="w-6 h-6 text-magma" />
                <h2 className="text-xl font-bold uppercase text-white tracking-wider">
                    80/20 Training Codex
                </h2>
            </div>

            <div>
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wide mb-3">Recommended for {activePath.replace('_', ' ')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommended.map(workout => (
                        <WorkoutCard key={workout.id} workout={workout} recommended />
                    ))}
                </div>
            </div>

            {others.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-3">Other Disciplines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                        {others.map(workout => (
                            <WorkoutCard key={workout.id} workout={workout} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

const WorkoutCard: React.FC<{ workout: WorkoutDefinition; recommended?: boolean }> = ({ workout, recommended }) => {
    const intensityColor = {
        'LOW': 'text-blue-400',
        'MEDIUM': 'text-yellow-400',
        'HIGH': 'text-red-500'
    }[workout.intensity];

    return (
        <div className={`p-4 rounded-lg border transition-all hover:bg-zinc-800 ${recommended ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950/50 border-zinc-900'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                        {workout.code}
                    </span>
                    <span className={`text-xs font-bold ${intensityColor}`}>
                        {workout.intensity}
                    </span>
                </div>
                {recommended && <Zap className="w-3 h-3 text-green-400" />}
            </div>

            <h4 className="font-bold text-white mb-1 truncate">{workout.name}</h4>
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2 h-8">{workout.description}</p>

            <div className="flex items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{workout.durationMin}m</span>
                </div>
                <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>{workout.type.replace('_', ' ')}</span>
                </div>
            </div>
        </div>
    );
}

export default TrainingCenter;

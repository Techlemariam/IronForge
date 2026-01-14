'use client';

import { useState, useEffect } from 'react';
import { MOBILITY_EXERCISES, MobilityExercise, MobilityRegion } from '@/data/mobilityExercises';
import { logMobilitySession } from '@/actions/mobility/logMobilityAction';
import ForgeCard from '@/components/ui/ForgeCard';
// ...

import ForgeButton from '@/components/ui/ForgeButton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Mobility Studio Component
 * 
 * Interactive studio for selecting and performing mobility exercises.
 * Features:
 * - Exercise Library with filtering
 * - Active Session Timer
 * - Log Completion
 */
export function MobilityStudio() {
    const [selectedRegion] = useState<MobilityRegion | 'ALL'>('ALL');
    const [activeExercise, setActiveExercise] = useState<MobilityExercise | null>(null);
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLogging, setIsLogging] = useState(false);

    const handleComplete = async () => {
        if (!activeExercise) return;

        // Auto-log if completed
        toast.success("Exercise Completed! Logging...");
        setIsLogging(true);

        const result = await logMobilitySession(activeExercise.id, activeExercise.durationSecs);

        setIsLogging(false);
        if (result.success) {
            toast.success(`Logged! +${result.data?.xpEarned} XP`);
            setActiveExercise(null); // Return to library
        } else {
            toast.error("Failed to log session");
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]); // handleComplete is stable now

    const handleStartExercise = (exercise: MobilityExercise) => {
        setActiveExercise(exercise);
        setTimeLeft(exercise.durationSecs);
        setTimerActive(false); // User must click "Start Timer"
    };

    const toggleTimer = () => {
        setTimerActive(!timerActive);
    };



    const filteredExercises = MOBILITY_EXERCISES.filter(e =>
        selectedRegion === 'ALL' || e.targetRegions.includes(selectedRegion)
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh]">
            {/* Sidebar: Library & Filters */}
            <div className="md:col-span-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-100">Library</h2>
                    <Badge variant="outline">{filteredExercises.length} Avail</Badge>
                </div>

                <ScrollArea className="h-full pr-4">
                    <div className="flex flex-col gap-2">
                        {filteredExercises.map(exercise => (
                            <ForgeCard
                                key={exercise.id}
                                className={`cursor-pointer transition-all hover:border-emerald-500 ${activeExercise?.id === exercise.id ? 'border-emerald-500 bg-emerald-950/20' : ''}`}
                                onClick={() => handleStartExercise(exercise)}
                            >
                                <div className="p-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-sm">{exercise.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="secondary" className="text-[10px]">{exercise.difficulty}</Badge>
                                            <Badge variant="outline" className="text-[10px]">{exercise.durationSecs}s</Badge>
                                        </div>
                                    </div>
                                    {exercise.source === 'ATG' && (
                                        <Badge className="bg-blue-900/50 text-blue-200 text-[10px]">ATG</Badge>
                                    )}
                                </div>
                            </ForgeCard>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main: Active Workspace */}
            <div className="md:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                {activeExercise ? (
                    <div className="w-full max-w-lg flex flex-col items-center gap-6 z-10">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-emerald-400 mb-2">{activeExercise.name}</h1>
                            <p className="text-slate-400">{activeExercise.instructions}</p>
                        </div>

                        {/* Video Placeholder */}
                        {activeExercise.videoUrl && (
                            <div className="w-full aspect-video bg-black rounded-lg border border-slate-700 flex items-center justify-center relative overflow-hidden group">
                                <iframe
                                    src={activeExercise.videoUrl.replace('watch?v=', 'embed/')}
                                    title={activeExercise.name}
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* Timer Display */}
                        <div className="flex flex-col items-center gap-4">
                            <div className={`text-6xl font-mono font-bold ${timerActive ? 'text-white' : 'text-slate-500'}`}>
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </div>

                            <div className="flex gap-4">
                                <ForgeButton
                                    onClick={toggleTimer}
                                    variant={timerActive ? 'magma' : 'default'}
                                    className="w-32"
                                >
                                    {timerActive ? 'Pause' : 'Start'}
                                </ForgeButton>

                                {!timerActive && timeLeft !== activeExercise.durationSecs && (
                                    <ForgeButton onClick={handleComplete} variant="ghost" disabled={isLogging}>
                                        {isLogging ? 'Logging...' : 'Complete'}
                                    </ForgeButton>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 w-full mt-4">
                            <MetricBox label="CNS Cost" value={activeExercise.resourceCost.cns} />
                            <MetricBox label="Muscular" value={activeExercise.resourceCost.muscular} />
                            <MetricBox label="Metabolic" value={activeExercise.resourceCost.metabolic} />
                        </div>

                    </div>
                ) : (
                    <div className="text-center flex flex-col items-center gap-4 text-slate-500">
                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                            <Clock className="w-10 h-10 opacity-50" />
                        </div>
                        <p>Select an exercise to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricBox({ label, value }: { label: string, value: number }) {
    return (
        <div className="bg-slate-800/50 p-2 rounded text-center">
            <div className="text-xs text-slate-400 uppercase">{label}</div>
            <div className="font-mono text-emerald-400">{value}</div>
        </div>
    );
}

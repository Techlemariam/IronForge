// src/features/training/components/SupersetView.tsx
"use client";

import React from "react";
import { Exercise } from "@/types";
import { Exercise } from "@/types";
import ExerciseView from "./ExerciseView";
import { Link2 } from "lucide-react";

interface SupersetViewProps {
    exercises: Exercise[];
    activeExIndex: number;
    // This index is global to the session, we need to know which one inside this group is active
    onSetLog: (exerciseId: string, weight: number, reps: number, rpe: number) => void;
    onNotesChange?: (exerciseId: string, notes: string) => void;
}

const _SupersetView: React.FC<SupersetViewProps> = ({
    exercises,
    _activeExIndex,
    _onSetLog,
    _onNotesChange,
}) => {
    // Determine if any exercise in this superset is currently active
    // The parent passes individual exercises, but we need to identify *which* one corresponds to activeExIndex
    // Actually, parent logic in DungeonSessionView likely iterates linearly. 
    // If we group them, we need to map the global index to the internal ones.
    // ... Wait, if we use this component, DungeonSessionView needs to group them first. 
    // Let's assume passed exercises are [A1, A2].

    // Actually, simpler:
    // We just render them stacked with a visual connector.

    return (
        <div className="relative space-y-4">
            {/* Visual Connector Line */}
            <div className="absolute left-[-24px] top-6 bottom-6 w-4 border-l-2 border-dashed border-magma/50 hidden md:block" />

            {/* Badge */}
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-magma/20 text-magma border border-magma/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                    <Link2 className="w-3 h-3" />
                    Superset
                </div>
            </div>

            {exercises.map((ex, _idx) => {
                // We need to know if *this specific exercise* is the active one in the broader session list
                // Since we don't have the global index map here easily without prop drilling, 
                // we can infer "isActive" if it has incomplete sets and is the first one, or previous ones are done.
                // BUT, `DungeonSessionView` manages `activeExIndex`.
                // Let's rely on props. For now, let's assume the parent handles "isActive" logic and passes checking.

                // Actually, to make this work seamlessly with existing logic:
                // This component should mostly be a visual wrapper.
                // It renders the standard ExerciseView but inside a "Group".

                // This file might just be a "SupersetGroup" wrapper?

                return (
                    <div key={ex.id} className="relative z-10 pl-2">
                        {/* We rely on parent to pass correct isActive state via a wrapper or mapped prop? 
                 Actually, let's just use it as a dumb layout component for now. 
             */}

                        {/* 
                 Wait, we can't easily use the *same* ExerciseView because the parent map() structure in DungeonSessionView 
                 is flat: {exercises.map(...)}.
                 
                 To use this, we need to Refactor DungeonSessionView to map over *groups*.
             */}
                    </div>
                );
            })}
        </div>
    );
};

// Re-thinking: 
// DungeonSessionView has logic `exercises.map((ex, index) => ...)`
// To support supersets without massive refactor:
// We can recognize when an exercise is part of a superset.
// If it is, and it's the *first* of the superset, we render the `SupersetView` which internally renders A1, A2, etc.
// If it is the second/third, we return null (skip rendering).

// Let's implement that pattern.

import { SetData } from "@/actions/training/strength";

export const SupersetGroup: React.FC<{
    exercises: Exercise[];
    activeIndex: number; // Global index
    globalStartIndex: number; // The index of the first exercise in this group in the main array
    onSetLog: (exIndex: number, w: number, r: number, e: number) => void;
    onNotesChange: (exIndex: number, notes: string) => void;
    onSetUpdate: (exIndex: number, setIndex: number, updates: Partial<SetData>) => void;
}> = ({ exercises, activeIndex, globalStartIndex, onSetLog, onNotesChange, onSetUpdate }) => {

    return (
        <div className="relative pl-6 border-l-4 border-zinc-800 my-8 rounded-l-3xl bg-white/5 p-4 border-y border-r border-white/5 rounded-r-xl">
            <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 bg-[#0a0a0a] border border-zinc-700 rounded-full p-1.5 shadow-xl z-20">
                <Link2 className="w-5 h-5 text-zinc-400" />
            </div>

            <div className="absolute -left-[2px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

            <div className="space-y-8">
                {exercises.map((ex, i) => {
                    const globalIndex = globalStartIndex + i;
                    const isActive = globalIndex === activeIndex;
                    const isCompleted = globalIndex < activeIndex || ex.sets.every(s => s.completed);

                    return (
                        <div key={ex.id} className="relative">
                            <ExerciseView
                                exercise={ex}
                                isActive={isActive}
                                isCompleted={isCompleted}
                                onSetLog={(w, r, e) => onSetLog(globalIndex, w, r, e)}
                                onNotesChange={(notes) => onNotesChange(globalIndex, notes)}
                                onSetUpdate={(setIndex, updates) => onSetUpdate(globalIndex, setIndex, updates)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SupersetGroup;

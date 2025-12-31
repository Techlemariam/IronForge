"use client";

import { useState } from "react";
import { Exercise } from "@prisma/client";
import { logExerciseSetsAction } from "@/actions/logger";
import ForgeInput from "@/components/ui/ForgeInput";
import ForgeButton from "@/components/ui/ForgeButton";
import { Trash2, Plus, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SetData {
    id: string;
    weight: number;
    reps: number;
    rpe: number;
    completed: boolean;
}

interface SetLoggerProps {
    exercise: Exercise;
    onFinish: () => void;
    onCancel: () => void;
    onCombatUpdate?: (damage: number, remainingHp: number, isCritical: boolean) => void;
    onSave: (sets: any[]) => Promise<void>;
}

export default function SetLogger({ exercise, onFinish, onCancel, onCombatUpdate, onSave }: SetLoggerProps) {
    const [sets, setSets] = useState<SetData[]>([
        { id: crypto.randomUUID(), weight: 0, reps: 0, rpe: 8, completed: false },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    function addSet() {
        const lastSet = sets[sets.length - 1];
        setSets([
            ...sets,
            {
                id: crypto.randomUUID(),
                weight: lastSet ? lastSet.weight : 0,
                reps: lastSet ? lastSet.reps : 0,
                rpe: lastSet ? lastSet.rpe : 8,
                completed: false,
            },
        ]);
    }

    function removeSet(id: string) {
        if (sets.length === 1) return;
        setSets(sets.filter(s => s.id !== id));
    }

    function updateSet(id: string, field: keyof SetData, value: number) {
        setSets(sets.map(s => s.id === id ? { ...s, [field]: value } : s));
    }

    function toggleComplete(id: string) {
        setSets(sets.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    }

    async function handleSave() {
        // Validate
        const validSets = sets.filter(s => s.weight > 0 && s.reps > 0);
        if (validSets.length === 0) {
            toast.error("Add at least one valid set (Weight & Reps > 0)");
            return;
        }

        // Optimistic: Delegate to parent and close immediately
        onSave(validSets);
        onFinish();
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-magma">{exercise.name}</h3>
                <button onClick={onCancel} className="text-xs text-zinc-500 hover:text-zinc-300">
                    Cancel
                </button>
            </div>

            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 text-center">
                <div>Set</div>
                <div>Kg</div>
                <div>Reps</div>
                <div>RPE</div>
                <div></div>
            </div>

            <div className="space-y-2">
                {sets.map((set, idx) => (
                    <div key={set.id} className={cn(
                        "grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center",
                        set.completed ? "opacity-50" : ""
                    )}>
                        <div className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded-full text-xs font-bold text-zinc-400">
                            {idx + 1}
                        </div>
                        <ForgeInput
                            type="number"
                            value={set.weight || ""}
                            onChange={e => updateSet(set.id, 'weight', parseFloat(e.target.value))}
                            className="h-9 text-center"
                            placeholder="0"
                        />
                        <ForgeInput
                            type="number"
                            value={set.reps || ""}
                            onChange={e => updateSet(set.id, 'reps', parseFloat(e.target.value))}
                            className="h-9 text-center"
                            placeholder="0"
                        />
                        <ForgeInput
                            type="number"
                            value={set.rpe || ""}
                            onChange={e => updateSet(set.id, 'rpe', parseFloat(e.target.value))}
                            className="h-9 text-center text-zinc-400"
                            placeholder="8"
                        />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => toggleComplete(set.id)}
                                className={cn(
                                    "p-2 rounded hover:bg-zinc-800 transition-colors",
                                    set.completed ? "text-green-500" : "text-zinc-600"
                                )}
                            >
                                <CheckCircle className="h-4 w-4" />
                            </button>
                            {sets.length > 1 && (
                                <button
                                    onClick={() => removeSet(set.id)}
                                    className="p-2 text-zinc-600 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 pt-2">
                <ForgeButton
                    variant="ghost"
                    size="sm"
                    onClick={addSet}
                    className="flex-1 gap-2 border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200"
                >
                    <Plus className="h-4 w-4" /> Add Set
                </ForgeButton>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-4">
                {/* Context Feedback UI will be rendered via Toast for now to minimize clutter, 
                   but we could add a permanent stats block here later. 
                   For MVP, the Toast is the primary feedback mechanism. */}
                <div className="flex justify-end">
                    <ForgeButton
                        variant="magma"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-auto gap-2"
                    >
                        {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Finish Exercise</>}
                    </ForgeButton>
                </div>
            </div>
        </div>
    );
}

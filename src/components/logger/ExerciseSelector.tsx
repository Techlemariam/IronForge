"use client";

import { useState, useEffect } from "react";
import { searchExercisesAction, createExerciseAction } from "@/actions/logger";
import { Exercise } from "@prisma/client";
import { Search, Plus, Dumbbell, Lock } from "lucide-react";
import ForgeInput from "@/components/ui/ForgeInput";
import ForgeButton from "@/components/ui/ForgeButton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { canPerformExercise, EquipmentType } from "@/data/equipmentDb";

interface ExerciseSelectorProps {
    onSelect: (exercise: Exercise) => void;
    capabilities?: EquipmentType[];
}

export default function ExerciseSelector({ onSelect, capabilities }: ExerciseSelectorProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Exercise[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const data = await searchExercisesAction(query);
            setResults(data);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <ForgeInput
                    placeholder="Search exercise (e.g. Bench Press)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="space-y-2">
                {isSearching && <p className="text-xs text-zinc-500 animate-pulse">Scanning library...</p>}

                {!isSearching && results.length > 0 && (
                    <div className="grid gap-2">
                        {results.map((ex) => {
                            const isPerformable = capabilities
                                ? canPerformExercise(ex.name, capabilities)
                                : true;

                            return (
                                <button
                                    key={ex.id}
                                    onClick={() => {
                                        if (isPerformable) onSelect(ex);
                                        else toast.error("Missing required equipment!");
                                    }}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg border transition-all text-left group
                                        ${isPerformable
                                            ? "bg-zinc-900 border-zinc-800 hover:border-magma/50 cursor-pointer"
                                            : "bg-zinc-950 border-zinc-900 opacity-60 cursor-not-allowed"}
                                    `}
                                >
                                    <div className={`
                                        h-8 w-8 rounded-full flex items-center justify-center shrink-0
                                        ${isPerformable ? "bg-forge-800" : "bg-zinc-900"}
                                    `}>
                                        {isPerformable ? (
                                            <Dumbbell className="h-4 w-4 text-zinc-400 group-hover:text-magma" />
                                        ) : (
                                            <Lock className="h-4 w-4 text-zinc-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-zinc-200">{ex.name}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-zinc-500">{ex.muscleGroup}</p>
                                            {!isPerformable && (
                                                <span className="text-[10px] text-red-900 bg-red-950/30 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                                    Missing Gear
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!isSearching && query.length >= 2 && results.length === 0 && (
                    <div className="text-center py-4 border border-dashed border-zinc-800 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-2">No exercise found.</p>
                        <CreateExerciseDialog
                            initialName={query}
                            onSuccess={(ex) => {
                                onSelect(ex);
                                setQuery("");
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function CreateExerciseDialog({ initialName, onSuccess }: { initialName: string, onSuccess: (ex: Exercise) => void }) {
    const [name, setName] = useState(initialName);
    const [muscle, setMuscle] = useState("Chest");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCreate() {
        setIsSubmitting(true);
        const res = await createExerciseAction({ name, muscleGroup: muscle });
        setIsSubmitting(false);

        if (res.success && res.exercise) {
            toast.success("Exercise created!");
            setIsOpen(false);
            onSuccess(res.exercise);
        } else {
            toast.error(res.error || "Failed to create");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <ForgeButton size="sm" variant="default" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create &quot;{initialName}&quot;
                </ForgeButton>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle>Create New Exercise</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Exercise Name</Label>
                        <ForgeInput value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Muscle Group</Label>
                        <Select value={muscle} onValueChange={setMuscle}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                                {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Other"].map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ForgeButton
                        fullWidth variant="magma"
                        onClick={handleCreate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Save to Library"}
                    </ForgeButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}

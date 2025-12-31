"use client";

import { useState, useEffect } from "react";
import { searchExercisesAction, createExerciseAction } from "@/actions/logger";
import { Exercise } from "@prisma/client";
import { Search, Plus, Dumbbell } from "lucide-react";
import ForgeInput from "@/components/ui/ForgeInput";
import ForgeButton from "@/components/ui/ForgeButton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExerciseSelectorProps {
    onSelect: (exercise: Exercise) => void;
}

export default function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Exercise[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                        {results.map((ex) => (
                            <button
                                key={ex.id}
                                onClick={() => onSelect(ex)}
                                className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-magma/50 transition-colors text-left"
                            >
                                <div className="h-8 w-8 rounded-full bg-forge-800 flex items-center justify-center shrink-0">
                                    <Dumbbell className="h-4 w-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-200">{ex.name}</p>
                                    <p className="text-xs text-zinc-500">{ex.muscleGroup}</p>
                                </div>
                            </button>
                        ))}
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
                <ForgeButton size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create "{initialName}"
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

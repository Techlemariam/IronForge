import React, { useState, useMemo } from "react";
import { Search, Plus, Dumbbell, ChevronRight } from "lucide-react";

interface ExerciseLibraryProps {
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

// Mock Database - In real app, this comes from Prisma/API
const EXERCISE_DB = [
  {
    id: "ex_bench_press",
    name: "Bench Press",
    muscle: "Chest",
    equipment: "Barbell",
  },
  {
    id: "ex_squat",
    name: "Barbell Squat",
    muscle: "Legs",
    equipment: "Barbell",
  },
  { id: "ex_deadlift", name: "Deadlift", muscle: "Back", equipment: "Barbell" },
  {
    id: "ex_ohp",
    name: "Overhead Press",
    muscle: "Shoulders",
    equipment: "Barbell",
  },
  { id: "ex_pullup", name: "Pull Up", muscle: "Back", equipment: "Bodyweight" },
  { id: "ex_dip", name: "Dips", muscle: "Chest", equipment: "Bodyweight" },
  {
    id: "ex_db_curl",
    name: "Dumbbell Curl",
    muscle: "Biceps",
    equipment: "Dumbbell",
  },
  {
    id: "ex_tricep_ext",
    name: "Tricep Extension",
    muscle: "Triceps",
    equipment: "Cable",
  },
];

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

import { createCustomExercise, getCustomExercises } from "@/features/strength/actions/custom-exercises";

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [customExercises, setCustomExercises] = useState<any[]>([]);

  // Form State
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("Chest");
  const [newExEquip, setNewExEquip] = useState("Barbell");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    // Load custom exercises
    getCustomExercises().then(data => setCustomExercises(data));
  }, []);

  const handleCreate = async () => {
    setIsSubmitting(true);
    const newEx = await createCustomExercise({
      name: newExName,
      muscle: newExMuscle,
      equipment: newExEquip
    });
    setCustomExercises(prev => [...prev, newEx]);
    setIsCreating(false);
    setIsSubmitting(false);
    // Reset form
    setNewExName("");
  };

  const allExercises = useMemo(() => {
    return [...customExercises, ...EXERCISE_DB];
  }, [customExercises]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = filter === "All" || ex.muscle === filter || (ex.muscleGroup === filter); // Handle schema variance
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, allExercises]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-indigo-400" />
          Exercise Library
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-sm font-medium"
        >
          Close
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 space-y-4 bg-zinc-900/50">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setFilter(group)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                                ${filter === group
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }
                            `}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Creation Mode or List */}
      {isCreating ? (
        <div className="p-4 space-y-4 bg-zinc-900/10 m-4 border border-zinc-800 rounded-xl animate-fade-in">
          <h3 className="font-bold text-white">Create Custom Exercise</h3>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Name</label>
            <input
              value={newExName}
              onChange={e => setNewExName(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
              placeholder="e.g. Plate Pinch"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Muscle</label>
              <select
                value={newExMuscle}
                onChange={e => setNewExMuscle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
              >
                {MUSCLE_GROUPS.filter(g => g !== "All").map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Equipment</label>
              <select
                value={newExEquip}
                onChange={e => setNewExEquip(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
              >
                <option value="Barbell">Barbell</option>
                <option value="Dumbbell">Dumbbell</option>
                <option value="Machine">Machine</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Cable">Cable</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setIsCreating(false)} className="flex-1 bg-zinc-800 text-white rounded p-2 text-sm font-bold">Cancel</button>
            <button onClick={handleCreate} disabled={!newExName || isSubmitting} className="flex-1 bg-magma text-white rounded p-2 text-sm font-bold disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Create Exercise"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex.id)}
              className="w-full text-left p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 hover:border-indigo-500/30 transition-all group flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-zinc-200">{ex.name}</div>
                <div className="text-xs text-zinc-500 mt-1 flex gap-2">
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded">
                    {ex.muscle || ex.muscleGroup}
                  </span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded">
                    {ex.equipment}
                  </span>
                  {ex.isCustom && <span className="bg-indigo-900/50 text-indigo-400 px-1.5 py-0.5 rounded">Custom</span>}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400" />
            </button>
          ))}

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <p>No exercises found.</p>
              <button className="mt-4 text-indigo-400 text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:text-indigo-300">
                <Plus className="w-4 h-4" /> Create Custom Exercise
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;

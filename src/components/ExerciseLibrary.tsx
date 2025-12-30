import React, { useState, useMemo } from "react";
import { Search, Filter, Plus, Dumbbell, ChevronRight } from "lucide-react";
import { Exercise } from "../types";

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

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredExercises = useMemo(() => {
    return EXERCISE_DB.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = filter === "All" || ex.muscle === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

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
                                ${
                                  filter === group
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

      {/* List */}
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
                  {ex.muscle}
                </span>
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded">
                  {ex.equipment}
                </span>
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
    </div>
  );
};

export default ExerciseLibrary;

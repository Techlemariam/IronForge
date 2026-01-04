"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Dumbbell } from "lucide-react";
import { searchExercisesAction } from "@/actions/training/strength";

// Inline debounce hook if not exists to be safe
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface ExerciseSearchProps {
  onSelect: (exerciseId: string, name: string) => void;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounceValue(query, 300);

  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchExercisesAction(debouncedQuery);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search exercises..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg focus:border-magma focus:outline-none text-sm text-white placeholder-zinc-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-magma animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          {results.map((ex) => (
            <button
              key={ex.id}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
              onClick={() => {
                onSelect(ex.id, ex.name);
                setQuery("");
                setResults([]);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/5 p-2 rounded-md group-hover:bg-magma/20 group-hover:text-magma transition-colors text-zinc-500">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-zinc-200">
                    {ex.name}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">
                    {ex.muscleGroup}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

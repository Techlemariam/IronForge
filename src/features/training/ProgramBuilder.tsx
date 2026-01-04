"use client";

import React, { useState } from "react";
import { createProgramAction } from "@/actions/training/programs";
import { Plus, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramBuilderProps {
  userId: string;
}

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({ userId }) => {
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(4);
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createProgramAction(userId, { name, weeks });
      toast({ title: "Success", description: "Program created!" });
      // Redirect or show builder view (simplified for now)
      setName("");
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-magma" />
        Program Builder
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
            Program Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-2 rounded text-white focus:border-magma outline-none"
            placeholder="e.g. 5/3/1 BBB"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
            Duration (Weeks)
          </label>
          <div className="flex gap-2">
            {[4, 8, 12].map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`px-4 py-2 rounded border ${weeks === w ? "bg-magma text-black border-magma" : "bg-transparent border-white/10 text-zinc-400 hover:text-white"}`}
              >
                {w} Weeks
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            onClick={handleCreate}
            disabled={!name || isCreating}
            className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreating ? (
              "Creating..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Create Program
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

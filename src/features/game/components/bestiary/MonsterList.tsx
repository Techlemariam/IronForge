"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Sword } from "lucide-react";
import type { BestiaryMonster } from "@/actions/systems/bestiary";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-400 border-green-900/50 bg-green-950/20",
  Medium: "text-yellow-400 border-yellow-900/50 bg-yellow-950/20",
  Hard: "text-orange-400 border-orange-900/50 bg-orange-950/20",
  Extreme: "text-red-500 border-red-900/50 bg-red-950/20",
};

export function MonsterList({
  initialMonsters,
}: {
  initialMonsters: BestiaryMonster[];
}) {
  const [search, setSearch] = useState("");
  // const [selectedId, setSelectedId] = useState<string | null>(null) // Unused for now, but good to keep if we add detailed modal

  const filteredMonsters = initialMonsters.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative max-w-md mx-auto w-full mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search database..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-forge-border rounded py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMonsters.map((monster) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={monster.id}
            className={`bg-forge-900 border border-forge-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,0,0,0.2)] ${monster.defeated ? "opacity-75 grayscale hover:grayscale-0" : ""}`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-serif text-white tracking-wide">
                    {monster.name}
                  </h3>
                  <p className="text-xs text-forge-muted uppercase tracking-wider">
                    {monster.title}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${DIFFICULTY_COLORS[monster.difficulty]}`}
                >
                  {monster.difficulty}
                </span>
              </div>

              <div className="flex gap-4 mb-4 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {monster.type}
                </span>
                <span className="flex items-center gap-1">
                  <Sword className="w-3 h-3" /> Weakness: {monster.weakness}
                </span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed font-sans mb-6 border-l-2 border-red-900/50 pl-4 italic">
                &quot;{monster.description}&quot;
              </p>

              {/* Stats Graph Placeholder */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                  <span className="w-16">STR</span>
                  <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monster.stats.strength}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-red-800"
                    />
                  </div>
                  <span className="w-6 text-right">
                    {monster.stats.strength}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                  <span className="w-16">END</span>
                  <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monster.stats.endurance}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-blue-800"
                    />
                  </div>
                  <span className="w-6 text-right">
                    {monster.stats.endurance}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                  <span className="w-16">AGI</span>
                  <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${monster.stats.agility}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-green-800"
                    />
                  </div>
                  <span className="w-6 text-right">
                    {monster.stats.agility}
                  </span>
                </div>
              </div>
            </div>

            {monster.defeated && (
              <div className="bg-green-900/20 border-t border-green-900/30 p-2 text-center text-xs font-mono text-green-400 uppercase tracking-widest">
                Threat Neutralized
              </div>
            )}
            {!monster.defeated && (
              <div className="bg-red-900/10 border-t border-red-900/30 p-2 text-center text-xs font-mono text-red-400 uppercase tracking-widest animate-pulse">
                Active Threat
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredMonsters.length === 0 && (
        <div className="text-center py-20 text-gray-500 font-mono">
          No records found in Bestiary archives.
        </div>
      )}
    </div>
  );
}

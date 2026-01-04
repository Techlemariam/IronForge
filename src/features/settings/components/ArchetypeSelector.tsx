"use client";

import React, { useState, useTransition } from "react";
import { Archetype } from "@/types/index";
import { updateArchetypeAction } from "@/actions/user";
import { CheckCircle, Swords, Wind, Scale } from "lucide-react";
import { motion } from "framer-motion";

interface ArchetypeSelectorProps {
  initialArchetype: Archetype;
}

const ARCHETYPES = [
  {
    id: Archetype.JUGGERNAUT,
    name: "The Iron Juggernaut",
    description: "Maximal strength. The unmovable object.",
    icon: <Swords className="w-6 h-6" />,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  {
    id: Archetype.PATHFINDER,
    name: "The Pathfinder",
    description: "Elite endurance. The unstoppable force.",
    icon: <Wind className="w-6 h-6" />,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  {
    id: Archetype.WARDEN,
    name: "The Hybrid Warden",
    description: "Balanced mastery. Perfect equilibrium.",
    icon: <Scale className="w-6 h-6" />,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
];

export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
  initialArchetype,
}) => {
  const [current, setCurrent] = useState<Archetype>(initialArchetype || Archetype.WARDEN);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (archetype: Archetype) => {
    if (archetype === current) return;
    startTransition(async () => {
      await updateArchetypeAction(archetype);
      setCurrent(archetype);
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-xs text-forge-muted uppercase tracking-widest mb-2 px-1">
        Combat Archetype
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {ARCHETYPES.map((arch) => {
          const isActive = current === arch.id;
          return (
            <motion.button
              key={arch.id}
              onClick={() => handleSelect(arch.id)}
              disabled={isPending}
              className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                isActive
                  ? `${arch.bg} ${arch.border} shadow-lg ring-1 ring-white/10`
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-full ${
                    isActive ? "bg-black/20" : "bg-white/5"
                  } ${arch.color}`}
                >
                  {arch.icon}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-bold text-sm ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {arch.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {arch.description}
                  </p>
                </div>
                {isActive && (
                  <div className={arch.color}>
                    <CheckCircle size={20} />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

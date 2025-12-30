"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Book, Skull, Scroll, Search, Sword, LogOut } from "lucide-react";
import { getBestiaryAction } from "@/actions/world";

type Tab = "bestiary" | "legends";

interface BestiaryEntry {
  id: string;
  name: string;
  description: string;
  image: string | null;
  levelReq: number;
  isDiscovered: boolean;
  kills: number;
}

interface GrimoireProps {
  onClose?: () => void;
}

export default function Grimoire({ onClose }: GrimoireProps) {
  const [activeTab, setActiveTab] = useState<Tab>("bestiary");
  const [entries, setEntries] = useState<BestiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrimoire = async () => {
      try {
        const { monsters } = await getBestiaryAction();
        // @ts-ignore -- Dealing with partial type mismatch from action if any
        setEntries(monsters);
      } catch (error) {
        console.error("Failed to open Grimoire", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrimoire();
  }, []);

  return (
    <div className="h-full bg-zinc-950 flex flex-col font-serif">
      {/* Header */}
      <div className="p-6 border-b border-zinc-900 bg-[#0a0a0a] relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-zinc-900 border border-zinc-700 rounded hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-5 h-5 text-zinc-400" />
          </button>
        )}
        <div className="flex items-center gap-3 mb-2">
          <Book className="w-6 h-6 text-purple-500" />
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-200">
            The Grimoire
          </h2>
        </div>
        <p className="text-zinc-500 italic text-sm">
          Keeper of knowledge, slain foes, and ancient legends.
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setActiveTab("bestiary")}
            className={`px-4 py-2 rounded uppercase text-xs font-bold tracking-widest transition-colors ${activeTab === "bestiary" ? "bg-purple-900/50 text-purple-300 border border-purple-500" : "bg-zinc-900 text-zinc-600 hover:text-zinc-400"}`}
          >
            Bestiary
          </button>
          <button
            onClick={() => setActiveTab("legends")}
            className={`px-4 py-2 rounded uppercase text-xs font-bold tracking-widest transition-colors ${activeTab === "legends" ? "bg-amber-900/50 text-amber-300 border border-amber-500" : "bg-zinc-900 text-zinc-600 hover:text-zinc-400"}`}
          >
            Legends
          </button>
        </div>
      </div>

      {/* Content Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center text-zinc-600 animate-pulse mt-10">
            Deciphering Runes...
          </div>
        ) : (
          <>
            {activeTab === "bestiary" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((monster) => (
                  <motion.div
                    key={monster.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                                            relative h-64 border rounded-xl overflow-hidden group
                                            ${
                                              monster.isDiscovered
                                                ? "bg-zinc-900 border-zinc-800 hover:border-purple-500/50 transition-colors"
                                                : "bg-black border-zinc-900"
                                            }
                                        `}
                  >
                    {/* Image / Silhouette */}
                    <div className="absolute inset-0 bg-zinc-900">
                      {/* Placeholder for real image or generic monster icon */}
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Skull className="w-32 h-32" />
                      </div>
                    </div>

                    {/* Overlay Content */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                      {monster.isDiscovered ? (
                        <>
                          <h3 className="text-xl font-bold text-zinc-200">
                            {monster.name}
                          </h3>
                          <p className="text-zinc-500 text-xs line-clamp-2 mt-1">
                            {monster.description}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-xs font-mono text-purple-400">
                            <Sword className="w-3 h-3" />
                            <span>Slain: {monster.kills}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="text-zinc-700 text-4xl font-black">
                            ? ? ?
                          </div>
                          <div className="text-zinc-600 text-[10px] uppercase tracking-widest mt-2">
                            Undiscovered Entity
                          </div>
                          <div className="text-zinc-800 text-[10px] mt-1">
                            Requires Level {monster.levelReq}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "legends" && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                <Scroll className="w-12 h-12 mb-4 opacity-20" />
                <p>The scrolls are empty. Only time will tell your story.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

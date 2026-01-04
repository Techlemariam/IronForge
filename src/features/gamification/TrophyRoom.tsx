"use client";

import React, { useEffect, useState } from "react";
import { getUnlockedAchievementsAction } from "@/actions/progression/achievements";
import { Trophy, Lock } from "lucide-react";
import { ACHIEVEMENTS_DATA } from "@/data/achievements";

interface TrophyRoomProps {
  userId: string;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({ userId }) => {
  const [unlocked, setUnlocked] = useState<any[]>([]);

  useEffect(() => {
    getUnlockedAchievementsAction(userId).then(setUnlocked);
  }, [userId]);

  const unlockedIds = new Set(unlocked.map((a) => a.code));

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          Trophy Room
        </h2>
        <span className="ml-auto text-xs text-zinc-500 font-mono">
          {unlocked.length} / {ACHIEVEMENTS_DATA.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ACHIEVEMENTS_DATA.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.code);
          return (
            <div
              key={ach.code}
              className={`p-4 rounded-lg flex flex-col items-center text-center gap-2 border transition-all ${
                isUnlocked
                  ? "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                  : "bg-black/20 border-white/5 opacity-50 grayscale"
              }`}
            >
              <div className="text-3xl">{ach.icon}</div>
              <div className="font-bold text-sm text-zinc-200">{ach.name}</div>
              <div className="text-[10px] text-zinc-500 leading-tight">
                {ach.description}
              </div>
              {!isUnlocked && <Lock className="w-3 h-3 text-zinc-600 mt-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

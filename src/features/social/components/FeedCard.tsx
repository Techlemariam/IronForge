import React from "react";
import { Trophy, Dumbbell } from "lucide-react";

interface FeedItemProps {
  item: {
    type: string;
    user: { heroName: string | null; activeTitle?: { name: string } | null };
    data: any;
    timestamp: Date;
  };
}

export const FeedCard: React.FC<FeedItemProps> = ({ item }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-900/40 flex items-center justify-center border border-indigo-500/30">
        {item.type === "WORKOUT_PR" && (
          <Trophy className="w-5 h-5 text-indigo-400" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-bold text-white">
              {item.user.heroName || "Unknown Titan"}
            </span>
            {item.user.activeTitle && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-yellow-700 text-yellow-500 bg-yellow-900/10 uppercase tracking-wide">
                {item.user.activeTitle.name}
              </span>
            )}
            <p className="text-zinc-400 text-xs mt-0.5">
              {new Date(item.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-3 bg-black/20 rounded p-3 text-sm text-zinc-300">
          <p>
            Achieved a new{" "}
            <span className="text-yellow-400 font-bold">Personal Record</span>!
          </p>
          <div className="flex items-center gap-2 mt-2 text-indigo-300">
            <Dumbbell className="w-3 h-3" />
            E1RM: {item.data.e1rm}kg
          </div>
        </div>
      </div>
    </div>
  );
};

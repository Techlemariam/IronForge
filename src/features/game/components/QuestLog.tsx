import React, { useState, useMemo } from "react";
import { Session, ExerciseLog } from "@/types";
import {
  Scroll,
  Sword,
  Map,
  Lock,
  Star,
  Sparkles,
  Hammer,
  ChevronRight,
} from "lucide-react";

interface QuestLogProps {
  sessions: Session[];
  history: ExerciseLog[];
  onSelectSession: (sessionId: string) => void;
  level: number;
}

type ActFilter = "ACT_I" | "ACT_II" | "ACT_III";

const QuestLog: React.FC<QuestLogProps> = ({
  sessions,
  // history,
  onSelectSession,
  level,
}) => {
  const [activeAct, setActiveAct] = useState<ActFilter>("ACT_I");

  // --- FILTER LOGIC ---
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (activeAct === "ACT_I") {
        // Core static sessions: Not Generated AND Not Custom
        return !session.isGenerated && !session.isCustom;
      }
      if (activeAct === "ACT_II") {
        // Oracle / Generated: Must be generated
        return session.isGenerated === true;
      }
      if (activeAct === "ACT_III") {
        // User Custom Dungeons: Must be custom
        return session.isCustom === true;
      }
      return false;
    });
  }, [sessions, activeAct]);

  const acts = [
    {
      id: "ACT_I",
      label: "Act I: Initiation",
      icon: <Map className="w-4 h-4" />,
      desc: "Standard Protocol",
    },
    {
      id: "ACT_II",
      label: "Act II: The Oracle",
      icon: <Sparkles className="w-4 h-4" />,
      desc: "AI Generated",
    },
    {
      id: "ACT_III",
      label: "Act III: Architect",
      icon: <Hammer className="w-4 h-4" />,
      desc: "Custom Dungeons",
    },
  ];

  return (
    <div className="bg-[var(--color-void)] border-2 border-[var(--color-steel)] rounded-lg overflow-hidden flex flex-col shadow-2xl">
      {/* Header / Tabs */}
      <div className="flex border-b border-steel/50 bg-void/50">
        {acts.map((act) => (
          <button
            key={act.id}
            onClick={() => setActiveAct(act.id as ActFilter)}
            className={`flex-1 py-4 px-1 sm:px-2 flex flex-col items-center gap-1 transition-all relative overflow-hidden group
              ${activeAct === act.id
                ? "bg-armor text-gold"
                : "bg-void text-steel hover:text-white hover:bg-armor/50"
              }
            `}
          >
            {activeAct === act.id && (
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gold shadow-[0_0_10px_var(--color-gold)]" />
            )}
            <div
              className={`p-1 rounded ${activeAct === act.id ? "bg-gold/10" : "bg-steel/5"}`}
            >
              {act.icon}
            </div>
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest">
              {act.label.split(": ")[1] || act.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 min-h-[300px] bg-void/50">
        {/* Act Description */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-white uppercase tracking-wider">
              {acts.find((a) => a.id === activeAct)?.label}
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              {activeAct === "ACT_I" &&
                "The foundational training grounds. Master the basics."}
              {activeAct === "ACT_II" &&
                "Dynamic challenges forged by the Spirit Guide based on your biometrics."}
              {activeAct === "ACT_III" &&
                "Custom dungeons constructed by your own hand."}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Available Quests: {filteredSessions.length}
            </span>
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-lg opacity-50">
              <Lock className="w-12 h-12 text-zinc-700 mb-2" />
              <p className="text-zinc-500 font-serif text-sm">
                No Quests Available in this Region.
              </p>
              {activeAct === "ACT_II" && (
                <p className="text-[10px] text-zinc-600 mt-1">
                  Consult the Oracle to generate new paths.
                </p>
              )}
              {activeAct === "ACT_III" && (
                <p className="text-[10px] text-zinc-600 mt-1">
                  Use the Dungeon Builder to construct this area.
                </p>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isGenerated = session.isGenerated;
              const isCustom = session.isCustom;

              let borderColor = "border-[var(--color-steel)] group-hover:border-[var(--color-warp)]";
              let iconColor = "bg-[var(--color-armor)] border-[var(--color-steel)] text-[var(--color-gold)]";
              let typeLabel = "Daily Quest";

              if (isGenerated) {
                borderColor =
                  "border-[var(--color-warp)] shadow-[0_0_10px_rgba(168,85,247,0.15)] group-hover:border-purple-400";
                iconColor = "bg-purple-900 border-[var(--color-warp)] text-purple-200";
                typeLabel = "Prophecy";
              } else if (isCustom) {
                borderColor =
                  "border-[var(--color-venom)] shadow-[0_0_10px_rgba(34,197,94,0.15)] group-hover:border-green-400";
                iconColor = "bg-green-900 border-[var(--color-venom)] text-green-200";
                typeLabel = "Construct";
              }

              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full group relative flex items-start gap-4 p-4 border-2 rounded bg-zinc-950 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${borderColor}`}
                >
                  {/* Icon Box */}
                  <div
                    className={`mt-1 p-3 rounded border shadow-inner transition-colors ${iconColor}`}
                  >
                    {isGenerated ? (
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    ) : isCustom ? (
                      <Hammer className="w-6 h-6" />
                    ) : (
                      <Sword className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-zinc-200 group-hover:text-white font-serif tracking-wide">
                        {session.name}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                        {typeLabel}
                      </span>
                    </div>

                    <p className="text-zinc-500 text-xs italic font-serif mt-1 border-l-2 border-zinc-800 pl-2">
                      {session.zoneName || "Unknown Territory"}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-400 font-mono uppercase">
                      <span className="flex items-center gap-1 text-[var(--color-gold)]">
                        <Star className="w-3 h-3 fill-current" />
                        XP: High
                      </span>
                      <span className="flex items-center gap-1">
                        <Scroll className="w-3 h-3" />
                        Blocks: {session.blocks.length}
                      </span>
                      {session.levelReq && session.levelReq > level && (
                        <span className="text-red-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Req Lvl{" "}
                          {session.levelReq}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0 text-[var(--color-gold)]">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestLog;

import React from "react";
import { OracleDecree } from "@/types/oracle";
import { Shield, Skull, Zap, Activity } from "lucide-react";

interface ActiveDecreeProps {
  decree: OracleDecree;
}

export const ActiveDecree: React.FC<ActiveDecreeProps> = ({ decree }) => {
  let styles = {
    bg: "bg-zinc-900",
    border: "border-zinc-700",
    text: "text-zinc-400",
    icon: <Activity />,
  };

  switch (decree.type) {
    case "BUFF":
      styles = {
        bg: "bg-amber-950/30",
        border: "border-amber-500",
        text: "text-amber-400",
        icon: <Zap className="w-5 h-5 text-amber-500" />,
      };
      break;
    case "DEBUFF":
      styles = {
        bg: "bg-red-950/30",
        border: "border-red-500",
        text: "text-red-400",
        icon: <Skull className="w-5 h-5 text-red-500" />,
      };
      break;
    case "NEUTRAL":
      styles = {
        bg: "bg-slate-900",
        border: "border-slate-600",
        text: "text-slate-300",
        icon: <Shield className="w-5 h-5 text-slate-400" />,
      };
      break;
  }

  return (
    <div
      className={`w-full p-4 rounded-lg border flex items-center gap-4 ${styles.bg} ${styles.border} shadow-lg mb-6 animate-fade-in`}
    >
      <div className={`p-2 rounded-full bg-black/40 border border-white/10`}>
        {styles.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`text-sm font-bold uppercase tracking-widest ${styles.text}`}
          >
            {decree.label}
          </h3>
          <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded text-white/50 border border-white/10">
            ACTIVE - 24H
          </span>
        </div>
        <p className="text-zinc-400 text-xs italic">
          &quot;{decree.description}&quot;
        </p>
      </div>
      {decree.effect && (
        <div className="text-right border-l border-white/10 pl-4 min-w-[80px]">
          <div className="text-[10px] text-zinc-500 uppercase">Effect</div>
          <div className={`font-mono font-bold ${styles.text}`}>
            {decree.effect.xpMultiplier
              ? `${decree.effect.xpMultiplier}x XP`
              : decree.effect.modifier
                ? `${decree.effect.modifier * 100}% STAT`
                : "N/A"}
          </div>
        </div>
      )}
    </div>
  );
};

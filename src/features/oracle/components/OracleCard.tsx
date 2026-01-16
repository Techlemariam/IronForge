import React from "react";
import { OracleRecommendation } from "@/types";
import {
  TrendingUp,
  Sword,
  HeartPulse,
  ArrowRight,
  Skull,
  Sparkles,
} from "lucide-react";

interface OracleCardProps {
  recommendation: OracleRecommendation;
  onAccept: (rec: OracleRecommendation) => void;
}

const OracleCard: React.FC<OracleCardProps> = ({
  recommendation,
  onAccept,
}) => {
  // Theme logic based on type
  let theme = {
    border: "border-zinc-700",
    bg: "bg-zinc-900",
    icon: <Sword className="w-6 h-6" />,
    accent: "text-zinc-400",
    button: "bg-zinc-800 text-zinc-300",
    glow: "",
  };

  switch (recommendation.type) {
    case "RECOVERY":
      theme = {
        border: "border-blue-500",
        bg: "bg-blue-950/30",
        icon: <HeartPulse className="w-6 h-6 text-blue-400" />,
        accent: "text-blue-400",
        button:
          "bg-blue-900/50 text-blue-200 border border-blue-500/50 hover:bg-blue-800",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      };
      break;
    case "PR_ATTEMPT":
      theme = {
        border: "border-[#ffd700]",
        bg: "bg-gradient-to-br from-yellow-950/40 to-black",
        icon: <Skull className="w-6 h-6 text-[#ffd700]" />,
        accent: "text-[#ffd700]",
        button: "bg-[#ffd700] text-black font-bold hover:bg-yellow-400",
        glow: "shadow-[0_0_20px_rgba(255,215,0,0.25)] animate-pulse-slow",
      };
      break;
    case "CARDIO_VALIDATION":
      theme = {
        border: "border-cyan-500",
        bg: "bg-cyan-950/30",
        icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
        accent: "text-cyan-400",
        button:
          "bg-cyan-900/50 text-cyan-200 border border-cyan-500/50 hover:bg-cyan-800",
        glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]",
      };
      break;
    case "GRIND":
      theme = {
        border: "border-[#c79c6e]",
        bg: "bg-zinc-900",
        icon: <TrendingUp className="w-6 h-6 text-[#c79c6e]" />,
        accent: "text-[#c79c6e]",
        button: "bg-[#c79c6e] text-[#46321d] font-bold hover:bg-[#d4a87a]",
        glow: "",
      };
      break;
  }

  return (
    <div
      className={`relative p-6 rounded-lg border-2 ${theme.border} ${theme.bg} ${theme.glow} transition-all duration-500 flex flex-col md:flex-row items-start md:items-center gap-6 overflow-hidden`}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

      {/* Icon Area */}
      <div
        className={`p-4 rounded-full border-2 ${theme.border} bg-black/50 z-10 shrink-0`}
      >
        {theme.icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 z-10 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase font-bold tracking-[0.2em] ${theme.accent}`}
          >
            The Oracle Commands
          </span>
          {recommendation.generatedSession && (
            <span className="px-2 py-0.5 bg-purple-500 text-white border border-purple-400 text-[9px] font-black uppercase rounded animate-pulse shadow-[0_0_10px_#a855f7]">
              New Quest Generated
            </span>
          )}
        </div>
        <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
          {recommendation.title}
        </h2>
        <p className="text-zinc-400 text-xs font-serif italic border-l-2 border-zinc-700 pl-3">
          &quot;{recommendation.rationale}&quot;
        </p>
      </div>

      {/* Action Button */}
      {(recommendation.sessionId || recommendation.generatedSession) && (
        <button
          onClick={() => onAccept(recommendation)}
          className={`z-10 px-6 py-4 rounded uppercase tracking-widest text-xs flex items-center gap-3 transition-transform active:scale-95 shadow-lg whitespace-nowrap ${theme.button}`}
        >
          <span>
            {recommendation.generatedSession
              ? "Accept Special Quest"
              : "Initiate Protocol"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default OracleCard;

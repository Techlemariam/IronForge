import React from "react";
import { BioBuff } from "../BioBuffService";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Skull, Zap, Shield } from "lucide-react";

interface BioBuffBadgeProps {
  buff: BioBuff | null;
  showDetails?: boolean;
  className?: string;
}

const TIER_COLORS = {
  LEGENDARY: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  EPIC: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  RARE: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  COMMON: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
  DEBUFF: "bg-red-500/20 text-red-500 border-red-500/50",
};

export const BioBuffBadge: React.FC<BioBuffBadgeProps> = ({
  buff,
  showDetails = false,
  className,
}) => {
  if (!buff) return null;

  const colors = TIER_COLORS[buff.tier] || TIER_COLORS.COMMON;
  const isDebuff = buff.tier === "DEBUFF";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-lg border px-3 py-2 backdrop-blur-sm",
        colors,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {isDebuff ? (
          <Skull className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span className="font-bold text-sm uppercase tracking-wider">
          {buff.name}
        </span>
      </div>

      {showDetails && (
        <div className="mt-2 text-xs border-t border-white/10 pt-2 opacity-90">
          <p className="mb-1 italic">{buff.description}</p>
          <div className="flex gap-2 mt-1">
            {buff.effects.attackMod && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />{" "}
                {buff.effects.attackMod > 1 ? "+" : ""}
                {Math.round((buff.effects.attackMod - 1) * 100)}% ATK
              </span>
            )}
            {buff.effects.defenseMod && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />{" "}
                {buff.effects.defenseMod > 1 ? "+" : ""}
                {Math.round((buff.effects.defenseMod - 1) * 100)}% DEF
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

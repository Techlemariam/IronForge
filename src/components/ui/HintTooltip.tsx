"use client";

import React from "react";

interface HintTooltipProps {
  hint: string;
  visible: boolean;
  position?: "top" | "bottom" | "left" | "right";
}

/**
 * Final Push: Contextual Hint Tooltip
 * Shows adaptive hints based on user behavior
 */
export const HintTooltip: React.FC<HintTooltipProps> = ({
  hint,
  visible,
  position = "top",
}) => {
  if (!visible) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      role="tooltip"
      className={`
                absolute z-50 px-3 py-2 
                bg-zinc-900/95 border border-magma/50 
                rounded-lg shadow-lg shadow-magma/10
                text-sm text-zinc-200 font-mono
                animate-fade-in max-w-xs
                ${positionClasses[position]}
            `}
    >
      <div className="absolute w-2 h-2 bg-zinc-900 border-l border-t border-magma/50 rotate-45 -translate-x-1/2 left-1/2 -top-1" />
      {hint}
    </div>
  );
};

// Preset hints for common scenarios
export const CONTEXTUAL_HINTS = {
  forge_unused: "You haven't visited The Forge in a while. New recipes await!",
  combat_low_hp: "Your HP is low! Consider using a Heal action.",
  streak_warning: "Keep your streak alive! Train today.",
  new_feature: "New feature unlocked! Check it out.",
  level_up_ready: "You have unspent Talent Points!",
};

export default HintTooltip;

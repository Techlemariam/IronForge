"use client";

import React from "react";

interface ShimmerBadgeProps {
  label: string;
  unlockLevel?: number;
}

export const ShimmerBadge: React.FC<ShimmerBadgeProps> = ({
  label,
  unlockLevel,
}) => {
  return (
    <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-armor via-steel/50 to-armor bg-[length:200%_100%] animate-shimmer border border-steel/50 overflow-hidden">
      <span className="text-sm font-mono uppercase tracking-widest text-zinc-300">
        {label}
      </span>
      {unlockLevel && (
        <span className="text-xs text-plasma font-bold">Lv. {unlockLevel}</span>
      )}
    </div>
  );
};

export default ShimmerBadge;

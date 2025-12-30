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
    <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer border border-zinc-600 overflow-hidden">
      <span className="text-sm font-mono uppercase tracking-widest text-zinc-300">
        {label}
      </span>
      {unlockLevel && (
        <span className="text-xs text-magma font-bold">Lv. {unlockLevel}</span>
      )}
    </div>
  );
};

export default ShimmerBadge;

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, Check, Star } from "lucide-react";

interface RewardNodeProps {
  tier: number;
  pointsRequired: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  isPremium: boolean;
  reward: { id: string | null; data: any };
  onClaim: () => void;
  userHasPremium: boolean;
}

export function RewardNode({
  tier,
  pointsRequired,
  isUnlocked,
  isClaimed,
  isPremium,
  reward,
  onClaim,
  userHasPremium,
}: RewardNodeProps) {
  const canClaim = isUnlocked && !isClaimed && (!isPremium || userHasPremium);
  const isLocked = !isUnlocked || (isPremium && !userHasPremium);

  const rewardType = reward.data?.type || "UNKNOWN";
  const rewardValue = reward.data?.amount || "";

  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 border rounded-lg min-w-[140px] relative transition-all",
        isPremium
          ? "border-amber-500/50 bg-amber-950/10"
          : "border-slate-700 bg-slate-900/50",
        isClaimed && "opacity-60 grayscale",
      )}
    >
      {/* Tier Badge */}
      <div className="absolute -top-3 bg-slate-800 text-xs px-2 py-0.5 rounded-full border border-slate-600">
        Tier {tier}
      </div>

      {/* Icon */}
      <div className="mb-3 mt-1">
        {rewardType === "GOLD" && (
          <div className="text-yellow-400 font-bold text-lg">
            💰 {rewardValue}
          </div>
        )}
        {rewardType === "ITEM" && (
          <div className="text-purple-400 font-bold text-lg">⚔️ Item</div>
        )}
        {rewardType === "UNKNOWN" && (
          <div className="text-slate-500 text-sm">Mystery</div>
        )}
      </div>

      {/* Status / Claim */}
      {isClaimed ? (
        <div className="flex items-center text-green-400 text-xs gap-1">
          <Check size={14} /> Collected
        </div>
      ) : (
        <Button
          size="sm"
          variant={canClaim ? "default" : "outline"}
          className={cn(
            "h-7 text-xs w-full",
            canClaim
              ? "bg-green-600 hover:bg-green-700"
              : "opacity-50 cursor-not-allowed",
          )}
          onClick={canClaim ? onClaim : undefined}
          disabled={!canClaim}
        >
          {isLocked && !isUnlocked && <Lock size={12} className="mr-1" />}
          {isLocked && isPremium && !userHasPremium && (
            <Star size={12} className="mr-1" />
          )}
          {canClaim ? "Claim" : isUnlocked ? "Locked" : `${pointsRequired} XP`}
        </Button>
      )}
    </div>
  );
}

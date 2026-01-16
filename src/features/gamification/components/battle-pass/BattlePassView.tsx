"use client";

import React, { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { RewardNode } from "./RewardNode";
import { claimBattlePassRewardAction, upgradeToPremiumAction } from "@/actions/systems/battle-pass";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BattlePassData {
  seasonId: string;
  seasonName: string;
  level: number;
  xp: number;
  hasPremium: boolean;
  tiers: {
    level: number;
    requiredXp: number;
    freeReward: { id: string | null; data: any };
    premiumReward: { id: string | null; data: any };
    isClaimedFree: boolean;
    isClaimedPremium: boolean;
    isUnlocked: boolean;
  }[];
}

interface BattlePassViewProps {
  initialData: BattlePassData | null;
  userId: string;
}

export function BattlePassView({ initialData, userId }: BattlePassViewProps) {
  const [data, setData] = useState<BattlePassData | null>(initialData);
  const [loading, setLoading] = useState(false);

  if (!data) {
    return (
      <div className="p-8 text-center border border-dashed rounded-xl">
        <h3 className="text-lg font-medium text-slate-400">No Active Season</h3>
        <p className="text-sm text-slate-500">
          Check back later for the next Battle Pass season.
        </p>
      </div>
    );
  }

  // Calculate overall progress logic
  // Unlocked tiers / total tiers
  // const totalTiers = data.tiers.length;
  // Current tier is 0-indexed concept effectively in currentTier from DB (it returns the last COMPLETED tier usually or current level)
  // Here data.level is usually the current level achieved.

  // Find next tier XP
  const nextTier = data.tiers.find((t) => t.requiredXp > data.xp);
  const currentTier = data.tiers
    .slice()
    .reverse()
    .find((t) => t.requiredXp <= data.xp);

  const prevXp = currentTier?.requiredXp || 0;
  const nextXp = nextTier?.requiredXp || (currentTier?.requiredXp || 0) + 1000; // Fallback

  // Progress within current level
  const tierProgress = Math.min(
    100,
    Math.max(0, ((data.xp - prevXp) / (nextXp - prevXp)) * 100),
  );

  const handleClaim = async (tierLevel: number, isPremium: boolean) => {
    if (loading) return;
    setLoading(true);
    // Optimistic update could happen here, but for now simple await
    const result = await claimBattlePassRewardAction(
      userId,
      tierLevel,
      isPremium,
    );

    if (result.success) {
      toast.success(result.message);
      // In a real app we'd re-fetch or optimistically update local state.
      // For simplicity, we are forcing a refresh via router or just manual state update:
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tiers: prev.tiers.map((t) => {
            if (t.level === tierLevel) {
              return {
                ...t,
                isClaimedFree: !isPremium ? true : t.isClaimedFree,
                isClaimedPremium: isPremium ? true : t.isClaimedPremium,
              };
            }
            return t;
          }),
        };
      });
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleUpgrade = async () => {
    if (loading) return;
    setLoading(true);
    const result = await upgradeToPremiumAction(userId);
    if (result.success) {
      toast.success("Premium Unlocked!");
      // Optimistic update
      setData(prev => prev ? ({ ...prev, hasPremium: true }) : null);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
        {/* Background Glow for Premium */}
        {data.hasPremium && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        )}

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
              {data.seasonName}
              {data.hasPremium && <span className="text-xs border border-amber-500/50 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Premium</span>}
            </h2>
            <p className="text-slate-400 text-sm">Season ends in 30 days</p>
          </div>
          <div className="flex items-center gap-4">
            {!data.hasPremium && (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold shadow-lg shadow-amber-900/20"
              >
                Unlock Premium
              </Button>
            )}
            <div className="text-right">
              <div className="text-3xl font-bold font-mono">{data.level}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                Current Tier
              </div>
            </div>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{data.xp} XP</span>
            <span>Next: {nextXp} XP</span>
          </div>
          <Progress value={tierProgress} className="h-3" />
        </div>
      </div>

      {/* Tiers Track */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-slate-300">Reward Track</h3>
          {!data.hasPremium && (
            <span className="text-xs text-amber-500 font-medium">
              Upgrade to Premium to unlock more rewards!
            </span>
          )}
        </div>

        <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="flex space-x-4 pb-4">
            {data.tiers.map((tier) => (
              <div key={tier.level} className="flex flex-col gap-2">
                {/* Free Reward */}
                <RewardNode
                  tier={tier.level}
                  pointsRequired={tier.requiredXp}
                  isUnlocked={tier.isUnlocked}
                  isClaimed={tier.isClaimedFree}
                  isPremium={false}
                  reward={tier.freeReward}
                  onClaim={() => handleClaim(tier.level, false)}
                  userHasPremium={data.hasPremium}
                />

                {/* Connector / Spacer */}
                <div className="h-8 flex items-center justify-center">
                  <div
                    className={`w-0.5 h-full ${tier.isUnlocked ? "bg-amber-500" : "bg-slate-800"}`}
                  ></div>
                </div>

                {/* Premium Reward */}
                <RewardNode
                  tier={tier.level}
                  pointsRequired={tier.requiredXp}
                  isUnlocked={tier.isUnlocked}
                  isClaimed={tier.isClaimedPremium}
                  isPremium={true}
                  reward={tier.premiumReward}
                  onClaim={() => handleClaim(tier.level, true)}
                  userHasPremium={data.hasPremium}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

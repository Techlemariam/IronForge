"use client";

import React from "react";
import { MapPin, Shield, Sword, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TerritoryCardProps {
    territory: any;
    userGuildId?: string;
    onClaim?: (id: string) => void;
    onContest?: (id: string) => void;
    isLoading?: boolean;
}

export const TerritoryCard: React.FC<TerritoryCardProps> = ({
    territory,
    userGuildId,
    onClaim,
    onContest,
    isLoading,
}) => {
    const isOwner = userGuildId && territory.controlledById === userGuildId;
    const isUnclaimed = !territory.controlledById;
    const activeContest = territory.activeContests?.[0];

    return (
        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-magma" />
                        {territory.name}
                    </h4>
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
                        {territory.region}
                    </span>
                </div>
                {isOwner && (
                    <span className="bg-magma/10 text-magma text-[10px] font-black px-2 py-0.5 rounded border border-magma/20 uppercase">
                        Your Domain
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Owner Info */}
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center border border-white/10">
                        <Shield className={`w-5 h-5 ${isUnclaimed ? "text-zinc-600" : "text-zinc-400"}`} />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Controlled By</div>
                        <div className={`text-sm font-bold ${isUnclaimed ? "text-zinc-600 italic" : "text-zinc-200"}`}>
                            {territory.controlledBy?.name || "Unclaimed Wilderness"}
                        </div>
                    </div>
                </div>

                {/* Active Contest */}
                {activeContest ? (
                    <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-lg space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-red-500">
                            <span className="flex items-center gap-1">
                                <Sword className="w-3 h-3" />
                                Under Siege
                            </span>
                            <span>Ends in 3 days</span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                <span>{activeContest.attacker.name}</span>
                                <span>{territory.controlledBy?.name}</span>
                            </div>
                            <Progress
                                value={(activeContest.attackerScore / (activeContest.attackerScore + activeContest.defenderScore + 1)) * 100}
                                className="h-1.5 bg-black/40"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                <span>{activeContest.attackerScore.toLocaleString()}</span>
                                <span>{activeContest.defenderScore.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-zinc-800/20 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500/50" />
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Weekly Bonus</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-300">+{territory.bonuses?.xp || 0}% XP</span>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                    {isUnclaimed ? (
                        <Button
                            className="w-full bg-white text-black font-black uppercase italic text-xs hover:bg-zinc-200"
                            onClick={() => onClaim?.(territory.id)}
                            disabled={isLoading || !userGuildId}
                        >
                            Claim Territory
                        </Button>
                    ) : !isOwner && !activeContest ? (
                        <Button
                            variant="outline"
                            className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 font-black uppercase italic text-xs"
                            onClick={() => onContest?.(territory.id)}
                            disabled={isLoading || !userGuildId}
                        >
                            Contest Ownership
                        </Button>
                    ) : isOwner && activeContest ? (
                        <Button
                            variant="outline"
                            className="w-full border-magma/30 text-magma hover:bg-magma/10 font-black uppercase italic text-xs"
                            disabled
                        >
                            Defending...
                        </Button>
                    ) : null}

                    {!userGuildId && (
                        <p className="text-[10px] text-center text-zinc-600 mt-2 italic">
                            Join a Guild to participate in conquest
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RankBadge } from "./RankBadge";

interface SeasonRewardsProps {
    currentRating: number;
    rank: string;
    seasonEndDate: Date;
}

const TIERS = [
    { name: "BRONZE", min: 0, reward: "500 Gold" },
    { name: "SILVER", min: 1200, reward: "1,000 Gold" },
    { name: "GOLD", min: 1500, reward: "2,000 Gold" },
    { name: "PLATINUM", min: 1800, reward: "3,000 Gold" },
    { name: "DIAMOND", min: 2100, reward: "5,000 Gold" },
    { name: "CHAMPION", min: 2400, reward: "10,000 Gold" },
    { name: "HIGH_WARLORD", min: 2800, reward: "Title: High Warlord" },
];

export function SeasonRewards({ currentRating, rank, seasonEndDate }: SeasonRewardsProps) {
    // Find next tier
    const nextTierIndex = TIERS.findIndex(t => t.min > currentRating);
    const nextTier = nextTierIndex === -1 ? null : TIERS[nextTierIndex];
    const currentTier = nextTierIndex === -1 ? TIERS[TIERS.length - 1] : TIERS[nextTierIndex - 1] || TIERS[0];

    const progress = nextTier
        ? ((currentRating - currentTier.min) / (nextTier.min - currentTier.min)) * 100
        : 100;

    const daysLeft = Math.ceil((new Date(seasonEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <Card className="p-4 bg-zinc-900 border-zinc-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    Season Rewards
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    {daysLeft > 0 ? `${daysLeft} DAYS LEFT` : "SEASON ENDED"}
                </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono uppercase">
                        <span>Current Rating</span>
                        {nextTier && <span>To {nextTier.name}</span>}
                    </div>
                    <Progress
                        value={progress}
                        className="h-2 bg-zinc-800 border border-zinc-700"
                        indicatorClassName="bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                        <span>{currentRating}</span>
                        {nextTier && <span>{nextTier.min}</span>}
                    </div>
                </div>
                <div className="shrink-0">
                    <RankBadge rank={rank} rating={currentRating} showRating={false} />
                </div>
            </div>

            <div className="text-xs text-center p-3 bg-zinc-950/50 rounded border border-zinc-800/50 flex justify-between items-center px-4">
                <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">Locked Reward</span>
                <span className="text-yellow-400 font-bold font-mono text-sm shadow-yellow-500/20 drop-shadow-sm">{currentTier.reward}</span>
            </div>
        </Card>
    );
}

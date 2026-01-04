import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RankBadge } from "./RankBadge";
import { PVP_RANKS, getRankProgress, getPointsToNextRank, Faction } from "@/lib/pvpRanks";

interface SeasonRewardsProps {
    currentRating: number;
    faction?: Faction;
    seasonEndDate: Date;
}

// Reward tiers mapped to rank numbers
const RANK_REWARDS: Record<number, string> = {
    1: "100 Gold",
    2: "200 Gold",
    3: "350 Gold",
    4: "500 Gold",
    5: "750 Gold",
    6: "1,000 Gold + Tabard",
    7: "1,500 Gold + Shoulders",
    8: "2,000 Gold + Gloves",
    9: "2,500 Gold + Legs",
    10: "3,500 Gold + Chest",
    11: "5,000 Gold + Weapon",
    12: "7,500 Gold + Mount",
    13: "10,000 Gold + Title",
    14: "15,000 Gold + Unique Title + Mount",
};

export function SeasonRewards({ currentRating, faction = "HORDE", seasonEndDate }: SeasonRewardsProps) {
    const progress = getRankProgress(currentRating);
    const pointsToNext = getPointsToNextRank(currentRating);

    // Find current rank
    const currentRankData = PVP_RANKS.reduce((prev, curr) =>
        currentRating >= curr.minRankScore ? curr : prev
        , PVP_RANKS[0]);

    const currentReward = RANK_REWARDS[currentRankData.rank] || "100 Gold";
    const title = faction === "ALLIANCE" ? currentRankData.allianceTitle : currentRankData.hordeTitle;

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
                        <span>Rank {currentRankData.rank}/14</span>
                        {pointsToNext !== null && <span>+{pointsToNext} to next</span>}
                    </div>
                    <Progress
                        value={progress}
                        className="h-2 bg-zinc-800 border border-zinc-700"
                        indicatorClassName={faction === "ALLIANCE"
                            ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400"
                            : "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"
                        }
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                        <span>{currentRating}</span>
                        {currentRankData.rank < 14 && (
                            <span>{PVP_RANKS[currentRankData.rank]?.minRankScore || "MAX"}</span>
                        )}
                    </div>
                </div>
                <div className="shrink-0">
                    <RankBadge rating={currentRating} faction={faction} showRating={false} />
                </div>
            </div>

            <div className="text-xs text-center p-3 bg-zinc-950/50 rounded border border-zinc-800/50 flex justify-between items-center px-4">
                <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">{title} Reward</span>
                <span className="text-yellow-400 font-bold font-mono text-sm shadow-yellow-500/20 drop-shadow-sm">{currentReward}</span>
            </div>
        </Card>
    );
}

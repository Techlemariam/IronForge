"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Swords } from "lucide-react";
import { getLeaderboardAction } from "@/actions/leaderboards";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  faction: string;
  level: number;
  score: number;
  metadata?: {
    wins: number;
    losses: number;
  };
}

export function DuelLeaderboard({ currentUserId }: { currentUserId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const result = await getLeaderboardAction("DUEL", { limit: 50, userId: currentUserId });
    if (result.leaderboard) {
      setLeaderboard(result.leaderboard as any);
      setUserRank(result.userRank);
    }
    setLoading(false);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-slate-400";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3)
      return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />;
    return <span className="text-slate-500 font-bold">#{rank}</span>;
  };

  if (loading) {
    return <div className="text-center p-8">Loading leaderboard...</div>;
  }

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="text-amber-500" />
            Duel Leaderboard
          </CardTitle>
          {userRank && (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-500"
            >
              Your Rank: #{userRank}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr className="text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Titan</th>
                <th className="px-4 py-3 text-center">Elo</th>
                <th className="px-4 py-3 text-center">W/L</th>
                <th className="px-4 py-3 text-center">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`hover:bg-slate-800/50 transition-colors ${entry.userId === currentUserId ? "bg-blue-950/30" : ""
                    }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">{entry.name}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                        >
                          Lvl {entry.level}
                        </Badge>
                        <span
                          className={
                            entry.faction === "HORDE"
                              ? "text-red-400"
                              : "text-blue-400"
                          }
                        >
                          {entry.faction}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-lg">{entry.score}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-400 font-semibold">
                      {entry.metadata?.wins || 0}
                    </span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-red-400 font-semibold">
                      {entry.metadata?.losses || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">
                        {entry.metadata?.wins && entry.metadata?.losses && entry.metadata.wins + entry.metadata.losses > 0
                          ? Math.round((entry.metadata.wins / (entry.metadata.wins + entry.metadata.losses)) * 100)
                          : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

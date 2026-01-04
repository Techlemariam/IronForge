"use client";

import { useState } from "react";
import { PvpSeason } from "@prisma/client";
import { PlayerRating, RankedOpponent } from "@/actions/pvp-ranked";
import { RankBadge } from "@/components/game/pvp/RankBadge";
import { MatchmakingModal } from "./MatchmakingModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Swords, Trophy, Users, Calendar, Info, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { Faction } from "@/lib/pvpRanks";
import { UnifiedLeaderboardEntry } from "@/actions/leaderboards";

interface RankedArenaClientProps {
    season: PvpSeason | null;
    playerRating: PlayerRating;
    leaderboard: UnifiedLeaderboardEntry[];
    userId: string;
    faction: Faction;
}

export function RankedArenaClient({ season, playerRating, leaderboard, userId, faction }: RankedArenaClientProps) {
    const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);

    if (!season) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <h2 className="text-2xl font-bold text-zinc-400">No Active Season</h2>
                <p className="text-zinc-500 mt-2">The arena is currently closed for maintenance.</p>
            </div>
        );
    }

    const daysRemaining = Math.ceil((new Date(season.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">

            {/* HEADER HERO */}
            <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 md:p-12">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-5 pointer-events-none">
                    <Crown className="w-96 h-96" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/50 bg-amber-950/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-500">
                            <Calendar className="w-3 h-3" />
                            <span>Season {season.name}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                            Ranked <span className="text-amber-500 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Arena</span>
                        </h1>
                        <p className="max-w-xl text-zinc-400 text-lg">
                            Compete in rated battles to climb the ladder, earn exclusive titles, and claim seasonal rewards. Glory awaits the strong.
                        </p>
                        <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <Info className="w-4 h-4" />
                                <span>Ends in {daysRemaining} days</span>
                            </div>
                        </div>
                    </div>

                    <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your Standing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <RankBadge rating={playerRating.rating} faction={faction} size="lg" />
                                <div className="text-right">
                                    <div className="text-2xl font-black text-white">{playerRating.rating}</div>
                                    <div className="text-xs font-bold text-zinc-500">Current Rating</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded bg-zinc-950 p-2">
                                    <div className="text-lg font-bold text-green-500">{playerRating.wins}</div>
                                    <div className="text-[10px] uppercase font-bold text-zinc-600">Wins</div>
                                </div>
                                <div className="rounded bg-zinc-950 p-2">
                                    <div className="text-lg font-bold text-red-500">{playerRating.losses}</div>
                                    <div className="text-[10px] uppercase font-bold text-zinc-600">Losses</div>
                                </div>
                                <div className="rounded bg-zinc-950 p-2">
                                    <div className="text-lg font-bold text-zinc-300">{playerRating.peakRating}</div>
                                    <div className="text-[10px] uppercase font-bold text-zinc-600">Peak</div>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => setIsMatchmakingOpen(true)}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest shadow-lg shadow-amber-900/20"
                            >
                                <Swords className="w-5 h-5 mr-2" /> Start Combat
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* LEADERBOARD & REWARDS */}
            <Tabs defaultValue="leaderboard" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="leaderboard" className="font-bold uppercase tracking-wider text-xs">Global Leaderboard</TabsTrigger>
                    <TabsTrigger value="rewards" className="font-bold uppercase tracking-wider text-xs">Season Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="leaderboard" className="mt-6">
                    <Card className="border-zinc-800 bg-zinc-900/30">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950/50 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Titan</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4 text-right">Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {leaderboard.map((entry, index) => (
                                        <tr key={index} className={`hover:bg-zinc-800/50 transition-colors ${entry.userId === userId ? "bg-amber-950/20" : ""}`}>
                                            <td className="px-6 py-4 font-mono text-zinc-400">
                                                {index < 3 ? (
                                                    <span className={`flex items-center gap-2 ${index === 0 ? "text-amber-400" : index === 1 ? "text-zinc-300" : "text-orange-700"}`}>
                                                        <Trophy className="w-4 h-4" /> #{index + 1}
                                                    </span>
                                                ) : (
                                                    `#${index + 1}`
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-zinc-200">{entry.name}</div>
                                                <div className="text-xs text-zinc-500">{entry.metadata?.title || "Novice"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <RankBadge rating={entry.score} faction={(entry.faction as Faction) || "HORDE"} size="sm" />
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-zinc-400">
                                                {entry.metadata?.wins + entry.metadata?.losses > 0
                                                    ? Math.round((entry.metadata?.wins / (entry.metadata?.wins + entry.metadata?.losses)) * 100)
                                                    : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                                No warriors have entered the arena yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="rewards" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-amber-900/30 bg-amber-950/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-500">
                                    <Crown className="w-5 h-5" /> High Warlord (Top 1)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-zinc-400">
                                <p>• Exclusive Title: &quot;High Warlord&quot;</p>
                                <p>• 5000 Gems</p>
                                <p>• Legendary Weapon Skin</p>
                            </CardContent>
                        </Card>
                        <Card className="border-zinc-800 bg-zinc-900/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-zinc-300">
                                    <Trophy className="w-5 h-5" /> Champion (2400+ SR)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-zinc-400">
                                <p>• Title: &quot;Champion&quot;</p>
                                <p>• 2000 Gems</p>
                                <p>• Epic Armor Set</p>
                            </CardContent>
                        </Card>
                        <Card className="border-zinc-800 bg-zinc-900/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-zinc-300">
                                    <Medal className="w-5 h-5 ml-0" /> Gladiator (1800+ SR)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-zinc-400">
                                <p>• 1000 Gems</p>
                                <p>• Rare Equipment Box</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <MatchmakingModal
                isOpen={isMatchmakingOpen}
                onClose={() => setIsMatchmakingOpen(false)}
                currentRating={playerRating.rating}
            />

        </div>
    );
}

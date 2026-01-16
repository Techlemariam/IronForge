"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, User, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
    rank: number;
    userId: string;
    name: string;
    city: string | null;
    ownedTiles: number;
    guildTag?: string | null;
}

interface LeaderboardGuild {
    rank: number;
    id: string;
    name: string;
    tag: string;
    totalTiles: number;
}

interface TerritoryLeaderboardProps {
    users: LeaderboardUser[];
    guilds: LeaderboardGuild[];
}

export const TerritoryLeaderboard: React.FC<TerritoryLeaderboardProps> = ({ users, guilds }) => {
    return (
        <div className="w-full bg-black/40 backdrop-blur-md rounded-xl border border-emerald-500/20 shadow-xl overflow-hidden">
            <Tabs defaultValue="players" className="w-full">
                <div className="p-4 border-b border-emerald-500/20 flex justify-between items-center bg-emerald-950/20">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Leaderboards
                    </h3>
                    <TabsList className="bg-black/40">
                        <TabsTrigger value="players" className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Players
                        </TabsTrigger>
                        <TabsTrigger value="guilds" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Guilds
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="players" className="m-0">
                    <div className="divide-y divide-emerald-500/10">
                        {users.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No data available yet. Start running!</div>
                        ) : (
                            users.map((user) => (
                                <div key={user.userId} className="flex items-center p-4 hover:bg-emerald-500/5 transition-colors">
                                    <div className="w-8 flex justify-center font-bold text-gray-400 mr-4">
                                        {user.rank <= 3 ? <Medal className={`w-6 h-6 ${getRankColor(user.rank)}`} /> : user.rank}
                                    </div>
                                    <Avatar className="h-10 w-10 border border-emerald-500/30 mr-4">
                                        <AvatarFallback className="bg-emerald-900 text-emerald-300 font-bold">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white">{user.name}</span>
                                            {user.guildTag && (
                                                <Badge variant="outline" className="text-[10px] bg-blue-900/20 border-blue-800 text-blue-400 px-1 py-0 h-4 rounded">
                                                    [{user.guildTag}]
                                                </Badge>
                                            )}
                                        </div>
                                        {user.city && <p className="text-xs text-gray-400">{user.city}</p>}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-400">{user.ownedTiles}</div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tiles</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="guilds" className="m-0">
                    <div className="divide-y divide-emerald-500/10">
                        {guilds.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No guilds have claimed territory yet.</div>
                        ) : (
                            guilds.map((guild) => (
                                <div key={guild.id} className="flex items-center p-4 hover:bg-emerald-500/5 transition-colors">
                                    <div className="w-8 flex justify-center font-bold text-gray-400 mr-4">
                                        {guild.rank <= 3 ? <Medal className={`w-6 h-6 ${getRankColor(guild.rank)}`} /> : guild.rank}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white">{guild.name}</span>
                                            <Badge variant="outline" className="bg-purple-900/20 border-purple-800 text-purple-400">
                                                {guild.tag}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-amber-400">{guild.totalTiles}</div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Tiles</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

function getRankColor(rank: number) {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-gray-500";
}

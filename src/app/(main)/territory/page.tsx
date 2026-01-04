/**
 * Territory Conquest Main Page
 * 
 * Shows the interactive map, player territory stats, and leaderboards.
 */

import React from "react";
import { getTerritoryAppData, getTerritoryLeaderboard, getGuildLeaderboard } from "@/actions/systems/territory";
import { TerritoryMap } from "@/features/territory/components/TerritoryMap";
import { TerritoryStats } from "@/features/territory/components/TerritoryStats";
import { TerritoryLeaderboard } from "@/features/territory/components/TerritoryLeaderboard";
import { Shield, Map as MapIcon, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function TerritoryPage() {
    // Fetch data server-side
    const [appData, leaderboards, guildLeaderboards] = await Promise.all([
        getTerritoryAppData(),
        getTerritoryLeaderboard(),
        getGuildLeaderboard()
    ]);

    const { stats, tiles, homeLocation } = appData;

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-500/20 pb-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Shield className="w-10 h-10 text-emerald-500" />
                        TERRITORY CONQUEST
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl">
                        Expand your realm by running through the city. Run often to strengthen your control,
                        connect tiles for passive income bonuses, and defend your home sanctuary.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <TerritoryStats stats={stats} />

            {/* Main Interactive Section */}
            <Tabs defaultValue="map" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList className="bg-black/40 border border-emerald-500/20">
                        <TabsTrigger value="map" className="flex items-center gap-2">
                            <MapIcon className="w-4 h-4" />
                            World Map
                        </TabsTrigger>
                        <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Leaderboards
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="map" className="space-y-4">
                    <TerritoryMap tiles={tiles} stats={stats} homeLocation={homeLocation} />
                    <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20 text-sm text-emerald-300">
                        <p><strong>Pro Tip:</strong> Tiles in your 500m Home Zone are immune to control loss and generate more gold!</p>
                    </div>
                </TabsContent>

                <TabsContent value="leaderboard">
                    <TerritoryLeaderboard
                        users={leaderboards}
                        guilds={guildLeaderboards}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

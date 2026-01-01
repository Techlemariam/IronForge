"use client";

import React from "react";
import { TerritoryStatsData } from "../types";
import { Map, Shield, TrendingUp, Coins, Zap, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TerritoryStatsProps {
    stats: TerritoryStatsData;
}

export const TerritoryStats: React.FC<TerritoryStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                title="Owned Tiles"
                value={stats.ownedTiles}
                icon={<Map className="w-5 h-5 text-emerald-500" />}
                description="Securely controlled territory"
            />
            <StatCard
                title="Control Points"
                value={stats.totalControlPoints}
                icon={<Shield className="w-5 h-5 text-amber-500" />}
                description="Aggregated influence across city"
            />
            <StatCard
                title="Largest Realm"
                value={`${stats.largestConnectedArea} tiles`}
                icon={<Maximize2 className="w-5 h-5 text-blue-500" />}
                description="Biggest connected territory"
            />
            <StatCard
                title="Daily Income"
                value={`${stats.dailyGold} Gold`}
                icon={<Coins className="w-5 h-5 text-yellow-500" />}
                description="Passive gold generation"
            />
            <StatCard
                title="Passive Experience"
                value={`${stats.dailyXP} XP`}
                icon={<Zap className="w-5 h-5 text-purple-500" />}
                description="Experience from exploration"
            />
            <StatCard
                title="Contested Tiles"
                value={stats.contestedTiles}
                icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
                description="Tiles you're actively fighting for"
            />
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
    <Card className="bg-black/60 backdrop-blur-md border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400 capitalize">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </CardContent>
    </Card>
);

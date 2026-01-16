"use client";

import React from "react";
import { TerritoryStatsData } from "../types";
import { Map, Shield, TrendingUp, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TerritoryStatsProps {
    stats: TerritoryStatsData;
}

export const TerritoryStats: React.FC<TerritoryStatsProps> = ({ stats }) => {
    const getNextSettlementCountdown = () => {
        const now = new Date();
        const nextSunday = new Date();
        nextSunday.setDate(now.getDate() + (7 - now.getDay()));
        nextSunday.setHours(23, 59, 59, 999);

        const diff = nextSunday.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

        return `${days}d ${hours}h until Settlement`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                title="Daily Income"
                value={`${stats.dailyGold} Gold`}
                icon={<Coins className="w-5 h-5 text-yellow-500" />}
                description="Passive gold generation"
            />
            <StatCard
                title="Weekly Settlement"
                value={getNextSettlementCountdown()}
                icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
                description="Next ownership cycle"
                highlight
            />
            {/* Secondary Row if needed, but 4 columns works well on LG */}
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
    highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, highlight }) => (
    <Card className={`bg-black/60 backdrop-blur-md border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 ${highlight ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400 capitalize">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </CardContent>
    </Card>
);

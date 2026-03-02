'use client';

import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface HistoryPoint {
    date: string;
    e1rm: number;
    volume: number;
}

interface ExerciseProgressChartProps {
    data: HistoryPoint[];
    isLoading?: boolean;
}

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full h-48 bg-black/20 rounded-lg p-2 border border-white/5 animate-pulse">
                <div className="h-4 w-32 bg-zinc-800 rounded mb-4 ml-1" />
                <div className="h-32 bg-zinc-800/50 rounded" />
            </div>
        );
    }

    if (!data || data.length < 2) {
        return (
            <div className="h-32 flex items-center justify-center text-zinc-600 text-xs">
                Not enough data for chart
            </div>
        );
    }

    return (
        <div className="w-full h-48 bg-black/20 rounded-lg p-2 border border-white/5">
            <div className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider ml-1">Estimated 1RM Trend</div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorE1rm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#666' }}
                        tickFormatter={(vals) => vals.substring(5)} // MM-DD
                        interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#888' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="e1rm"
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#colorE1rm)"
                        strokeWidth={2}
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

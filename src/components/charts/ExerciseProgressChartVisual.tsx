"use client";

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

interface ExerciseProgressChartVisualProps {
    data: HistoryPoint[];
}

const ExerciseProgressChartVisual: React.FC<ExerciseProgressChartVisualProps> = ({ data }) => {
    return (
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
    );
};

export default ExerciseProgressChartVisual;

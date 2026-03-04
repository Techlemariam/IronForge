"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface HeartRateZoneChartVisualProps {
    zoneData: any[];
}

const HeartRateZoneChartVisual: React.FC<HeartRateZoneChartVisualProps> = ({ zoneData }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={zoneData}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
            >
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 600 }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                        backgroundColor: "var(--color-void)",
                        borderColor: "var(--color-steel)",
                        borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                    formatter={(value: any, name: any, props: any) => [
                        `${value} hrs`,
                        props.payload.originalName || "",
                    ]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {zoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default HeartRateZoneChartVisual;

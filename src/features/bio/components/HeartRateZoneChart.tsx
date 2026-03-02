"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { IntervalsActivity, AthleteSettings } from "@/types";
import { Activity } from "lucide-react";

interface HeartRateZoneChartProps {
  activities: IntervalsActivity[];
  settings?: AthleteSettings | null;
}

const ZONE_GAMIFICATION = [
  {
    name: "Recovery",
    label: "Regeneration",
    color: "#10b981",
    desc: "Active recovery & healing",
  }, // Z1
  {
    name: "Endurance",
    label: "Endurance Capacitor",
    color: "#3b82f6",
    desc: "Base building & fat burn",
  }, // Z2
  {
    name: "Tempo",
    label: "Rhythm Flow",
    color: "#6366f1",
    desc: "Aerobic power",
  }, // Z3
  {
    name: "Threshold",
    label: "Redline Limit",
    color: "#f59e0b",
    desc: "Lactate threshold",
  }, // Z4
  {
    name: "VO2 Max",
    label: "Nitro Boost",
    color: "#ef4444",
    desc: "Max aerobic capacity",
  }, // Z5
  {
    name: "Anaerobic",
    label: "Warp Drive",
    color: "#ec4899",
    desc: "Anaerobic capacity",
  }, // Z6
  {
    name: "Neuromuscular",
    label: "Overdrive",
    color: "#8b5cf6",
    desc: "Pure sprint power",
  }, // Z7
];

export const HeartRateZoneChart: React.FC<HeartRateZoneChartProps> = ({
  activities,
  // settings,
}) => {
  // Aggregation Logic
  const zoneData = useMemo(() => {
    // Initialize 7 zones
    const totals = new Array(7).fill(0);

    activities.forEach((activity) => {
      if (activity.zone_times) {
        activity.zone_times.forEach((seconds, index) => {
          if (index < 7) totals[index] += seconds;
        });
      }
    });

    // Format for Chart
    return totals.map((seconds, index) => {
      const hours = (seconds / 3600).toFixed(1);
      return {
        id: `Z${index + 1}`,
        name: ZONE_GAMIFICATION[index]?.label || `Zone ${index + 1}`,
        originalName: ZONE_GAMIFICATION[index]?.name,
        value: parseFloat(hours),
        desc: ZONE_GAMIFICATION[index]?.desc,
        color: ZONE_GAMIFICATION[index]?.color || "#8884d8",
      };
    });
  }, [activities]);

  const totalHours = zoneData.reduce((acc, curr) => acc + curr.value, 0);

  if (totalHours === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-xl border border-white/10 text-zinc-500">
        <Activity className="w-8 h-8 mb-2 opacity-50" />
        <p>No Heart Rate data found for this period.</p>
        <p className="text-xs mt-1">
          Make sure accurate zones are set in Intervals.icu
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-magma" />
            Zone Mastery
          </h3>
          <p className="text-zinc-400 text-sm">Time in Zone (Last 7 Days)</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white">
            {totalHours.toFixed(1)}h
          </div>
          <div className="text-xs text-zinc-500 uppercase font-bold">
            Total Cardio
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
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
                backgroundColor: "#09090b",
                borderColor: "#27272a",
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
      </div>

      {/* Legend / Insight */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {zoneData
          .filter((z) => z.value > 0)
          .slice(0, 4)
          .map((zone) => (
            <div
              key={zone.id}
              className="bg-white/5 rounded p-2 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  {zone.id}
                </span>
              </div>
              <div
                className="text-xs text-zinc-300 font-medium truncate"
                title={zone.desc}
              >
                {zone.desc}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

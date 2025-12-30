"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import type { VolumeFeedback } from "../hooks/useVolumeTracking";

interface VolumeProgressBadgeProps {
  volume: VolumeFeedback;
  compact?: boolean;
}

export function VolumeProgressBadge({
  volume,
  compact = false,
}: VolumeProgressBadgeProps) {
  const getStatusColor = () => {
    if (volume.percentage < 50)
      return "bg-yellow-900/30 border-yellow-600 text-yellow-500";
    if (volume.percentage >= 50 && volume.percentage < 100)
      return "bg-green-900/30 border-green-600 text-green-500";
    return "bg-red-900/30 border-red-600 text-red-500";
  };

  const getStatusIcon = () => {
    if (volume.percentage < 50) return <AlertTriangle className="w-3 h-3" />;
    if (volume.percentage >= 50 && volume.percentage < 100)
      return <TrendingUp className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  const getStatusLabel = () => {
    if (volume.percentage < 50) return "Low Volume";
    if (volume.percentage >= 50 && volume.percentage < 100) return "Optimal";
    return "High Volume";
  };

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={`text-xs ${getStatusColor()} flex items-center gap-1`}
      >
        {getStatusIcon()}
        <span>
          {volume.currentSets}/{volume.mrv}
        </span>
      </Badge>
    );
  }

  return (
    <div className={`rounded-lg border p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-semibold text-sm">{volume.muscleGroup}</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-0">
          {getStatusLabel()}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${volume.percentage < 50
              ? "bg-yellow-500"
              : volume.percentage < 100
                ? "bg-green-500"
                : "bg-red-500"
              }`}
            style={{ width: `${Math.min(volume.percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold min-w-[60px] text-right">
          {volume.currentSets}/{volume.mrv} sets
        </span>
      </div>
    </div>
  );
}

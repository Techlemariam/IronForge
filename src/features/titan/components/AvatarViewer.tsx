'use client';

import dynamic from "next/dynamic";
import { TitanAttributes } from "@/types";

const AvatarViewerVisual = dynamic(() => import("./AvatarViewerVisual"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-2xl">
      <div className="w-16 h-16 border-4 border-clay/20 border-t-clay rounded-full animate-spin mb-4" />
      <span className="text-clay font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Neural Link...</span>
    </div>
  ),
});

interface AvatarViewerProps {
  attributes: TitanAttributes;
  isElite: boolean;
  muscleHeatmap?: Record<string, number>;
}

const AvatarViewer: React.FC<AvatarViewerProps> = ({
  attributes,
  isElite,
  muscleHeatmap = {},
}) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-zinc-950 to-black rounded-lg overflow-hidden relative border border-zinc-800">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-clay font-bold uppercase tracking-widest text-xs">
          Titan Holo-Projector
        </h3>
        <p className="text-[10px] text-zinc-500 font-mono">
          Rendering Mode: Hard Light Construct
        </p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 text-[9px] font-mono uppercase">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500">Critical Load</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-500">Accumulating</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-clay rounded-full"></div>
          <span className="text-clay">Optimal</span>
        </div>
      </div>

      <AvatarViewerVisual
        attributes={attributes}
        isElite={isElite}
        muscleHeatmap={muscleHeatmap}
      />
    </div>
  );
};

export default AvatarViewer;

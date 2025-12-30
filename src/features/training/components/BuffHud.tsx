import { getBuffForZone } from "../logic/buffs";
import { Zap, Coins, Activity, Gauge, Timer } from "lucide-react";
import { TrainingMetric } from "../logic/zones";

interface BuffHudProps {
  currentZone: number;
  rewards: { xp: number; gold: number; energy: number };
  durationSeconds: number;
  metric: TrainingMetric;
  currentValue: number;
  onValueChange: (val: number) => void;
}

const BuffHud: React.FC<BuffHudProps> = ({
  currentZone,
  rewards,
  durationSeconds,
  metric,
  currentValue,
  onValueChange,
}) => {
  const activeBuff = getBuffForZone(currentZone);
  const Icon = activeBuff.icon;

  // Helper to format time
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Configuration based on metric
  const config = {
    hr: {
      title: "HR ZONE MONITOR",
      icon: <Activity className="w-3 h-3" />,
      simLabel: "SIMULATE INTENSITY (ZONE)",
      min: 1,
      max: 5,
      step: 1,
      unit: "Z",
    },
    power: {
      title: "POWER ZONE MONITOR",
      icon: <Zap className="w-3 h-3" />,
      simLabel: "SIMULATE POWER (WATTS)",
      min: 0,
      max: 500,
      step: 10,
      unit: "W",
    },
    pace: {
      title: "PACE ZONE MONITOR",
      icon: <Gauge className="w-3 h-3" />,
      simLabel: "SIMULATE SPEED (KPH)",
      min: 0,
      max: 30,
      step: 0.5,
      unit: "kph",
    },
  }[metric];

  return (
    <div className="absolute top-20 right-4 z-40 bg-zinc-900/90 border-2 border-zinc-700/50 rounded-xl p-4 w-64 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          {config.icon}
          <span>{config.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <Timer className="w-3 h-3" />
          <span>{formatTime(durationSeconds)}</span>
        </div>
      </div>

      {/* Active Buff Display */}
      <div
        className={`flex items-center gap-3 mb-4 p-2 rounded-lg bg-black/40 border border-zinc-800/50`}
      >
        <div
          className={`p-2 rounded-full bg-zinc-800 ${activeBuff.color} animate-pulse`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${activeBuff.color}`}>
            {activeBuff.name}
          </h3>
          <p className="text-[10px] text-zinc-400 leading-tight">
            {activeBuff.description}
          </p>
        </div>
      </div>

      {/* Rewards Ticker */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-zinc-800/50 rounded p-2 flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 uppercase">XP Gained</span>
          <span className="text-sm font-bold text-magma flex items-center gap-1">
            {Math.floor(rewards.xp)} <Zap className="w-3 h-3" />
          </span>
        </div>
        <div className="bg-zinc-800/50 rounded p-2 flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 uppercase">
            Gold Found
          </span>
          <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
            {Math.floor(rewards.gold)} <Coins className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Zone Selector (Simulation) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] text-zinc-500">
          <span>{config.simLabel}</span>
          <span className="font-mono text-zinc-300">
            {currentValue} {config.unit}
          </span>
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={currentValue}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-magma"
        />

        {metric === "hr" ? (
          <div className="flex justify-between text-[10px] text-zinc-600 px-1 font-mono">
            <span>Z1</span>
            <span>Z2</span>
            <span>Z3</span>
            <span>Z4</span>
            <span>Z5</span>
          </div>
        ) : (
          <div className="flex justify-between text-[10px] text-zinc-600 px-1 font-mono">
            <span>Min</span>
            <span>Avg</span>
            <span>Max</span>
          </div>
        )}
      </div>

      {/* Current Zone Indicator */}
      <div className="mt-2 text-center">
        <span
          className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${activeBuff.color} border-current bg-black/50`}
        >
          ZONE {currentZone} ACTIVE
        </span>
      </div>
    </div>
  );
};

export default BuffHud;

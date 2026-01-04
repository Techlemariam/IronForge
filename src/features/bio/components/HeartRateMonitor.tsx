import React, { useState, useEffect } from "react";
import {
  Heart,
  Bluetooth,
  Activity,
  Flame,
  Bike,
  Settings,
} from "lucide-react";
import { FTMSService } from "@/services/bluetooth-ftms";
import { IoTService } from "@/services/iot"; // IMPORT

interface HeartRateMonitorProps {
  bpm: number | null;
  isConnected: boolean;
  onConnect: () => void;
  onSimulate?: () => void;
  error?: string | null;
  hasAura?: boolean; // Elite Rank passive buff
}

const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({
  bpm,
  isConnected,
  onConnect,
  onSimulate,
  error,
  hasAura = false,
}) => {
  const [ftmsConnected, setFtmsConnected] = useState(false);
  const [targetPower, setTargetPower] = useState(150);
  const [showBikeControls, setShowBikeControls] = useState(false);

  // --- IOT TRIGGER ---
  useEffect(() => {
    if (bpm) {
      IoTService.syncAtmosphere(bpm);
    }
  }, [bpm]);

  const zoneColor = bpm && bpm < 120 ? "text-green-500" : "text-orange-500";
  const zoneStatus = bpm ? (bpm < 120 ? "ZONE 2 (READY)" : "RECOVERY") : "";
  const isOverheated = bpm && bpm > 120;

  // Elite Theme Override
  const containerBorder = hasAura
    ? isOverheated
      ? "border-orange-900/50"
      : "border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.15)]"
    : isOverheated
      ? "border-orange-900/50"
      : bpm
        ? "border-green-900/30"
        : "border-zinc-800";

  const containerBg =
    hasAura && !isOverheated && bpm
      ? "bg-[linear-gradient(45deg,rgba(0,0,0,0.9),rgba(255,215,0,0.05))]"
      : isOverheated
        ? "bg-orange-950/10"
        : bpm
          ? "bg-green-950/10"
          : "bg-zinc-900";

  const handleFtmsConnect = async () => {
    const success = await FTMSService.connect();
    setFtmsConnected(success);
    setShowBikeControls(success);
  };

  const setErgMode = async () => {
    await FTMSService.setTargetPower(targetPower);
  };

  return (
    <div
      className={`relative flex flex-col p-3 rounded-lg mb-4 transition-all duration-500 border ${containerBorder} ${containerBg}`}
    >
      {/* Aura Visual Indicator */}
      {hasAura && isConnected && (
        <div className="absolute -top-2 left-4 bg-black border border-[#ffd700] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
          <Flame className="w-3 h-3 text-[#ffd700] fill-current animate-pulse" />
          <span className="text-[9px] font-bold text-[#ffd700] uppercase tracking-wider">
            Aura: +1.5% Accuracy
          </span>
        </div>
      )}

      {/* Main HR Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full transition-colors ${isConnected ? (isOverheated ? "bg-orange-500/20" : "bg-green-500/20") : "bg-zinc-800"}`}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isConnected ? (isOverheated ? "text-orange-500 animate-pulse" : "text-green-500") : "text-zinc-500"}`}
            />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
              Recovery Monitor
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-bold font-mono transition-colors ${isConnected ? zoneColor : "text-zinc-600"}`}
              >
                {bpm ? bpm : "--"} <span className="text-sm">BPM</span>
              </span>
              {bpm && (
                <span
                  className={`text-xs font-bold transition-colors ${isOverheated ? "text-orange-400" : "text-green-400"}`}
                >
                  [{zoneStatus}]
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              <Bluetooth className="w-4 h-4" />
              HRM
            </button>
          ) : (
            <div
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded border ${hasAura ? "text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/30" : "text-green-500/80 bg-green-900/10 border-green-900/20"}`}
            >
              <Activity className="w-4 h-4" />
              LINKED
            </div>
          )}

          {!ftmsConnected ? (
            <button
              onClick={handleFtmsConnect}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
              title="Connect Smart Bike (FTMS)"
            >
              <Bike className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowBikeControls(!showBikeControls)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 rounded"
            >
              <Bike className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Smart Bike Controls (FTMS) */}
      {showBikeControls && (
        <div className="mt-4 pt-4 border-t border-zinc-800 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-cyan-500 flex items-center gap-1">
              <Settings className="w-3 h-3" /> ERG Mode Control
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="400"
              step="5"
              value={targetPower}
              onChange={(e) => setTargetPower(parseInt(e.target.value))}
              className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="font-mono font-bold text-white w-12 text-right">
              {targetPower}W
            </span>
            <button
              onClick={setErgMode}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded shadow-lg"
            >
              Set Load
            </button>
          </div>
        </div>
      )}

      {/* Hidden Simulation Trigger for Devs */}
      {isConnected && onSimulate && (
        <button
          onClick={onSimulate}
          className="opacity-0 hover:opacity-50 text-xs text-zinc-600 ml-2 absolute bottom-1 left-1"
        >
          (Sim)
        </button>
      )}
    </div>
  );
};

export default HeartRateMonitor;

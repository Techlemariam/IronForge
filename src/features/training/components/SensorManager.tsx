import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bluetooth, Heart, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensorManagerProps {
  isOpen: boolean;
  onClose: () => void;
  // We pass hooks data or hooks themselves?
  // Better to pass the hook results to keep this dumb or let it use hooks?
  // Let it use context? No, let's pass props for maximum flexibility (e.g. if parent manages connection)
  // Actually, hooks are singletons essentially if they use global state/context, but here they are local hooks.
  // If we use them here, we create NEW connections if not hoisted.
  // The hooks in TvMode manage the connection refs.
  // So we must pass the methods and state from TvMode.
  hrStatus: {
    connected: boolean;
    bpm: number | null;
    connect: () => void;
    disconnect: () => void;
  };
  powerStatus: {
    connected: boolean;
    watts: number;
    connect: () => void;
    disconnect: () => void;
  };
}

export const SensorManager: React.FC<SensorManagerProps> = ({
  isOpen,
  onClose,
  hrStatus,
  powerStatus,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bluetooth className="text-blue-400" /> Connect Sensors
            </h2>

            <div className="space-y-4">
              {/* Heart Rate */}
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl border border-zinc-700">
                <div className="flex items-center gap-3">
                  <Heart
                    className={cn(
                      "w-6 h-6",
                      hrStatus.connected
                        ? "text-red-500 fill-red-500"
                        : "text-zinc-500",
                    )}
                  />
                  <div>
                    <div className="font-bold text-zinc-200">Heart Rate</div>
                    <div className="text-sm text-zinc-500">
                      {hrStatus.connected
                        ? `${hrStatus.bpm ?? "--"} BPM`
                        : "Disconnected"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={
                    hrStatus.connected ? hrStatus.disconnect : hrStatus.connect
                  }
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-sm transition-colors",
                    hrStatus.connected
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-500",
                  )}
                >
                  {hrStatus.connected ? "Disconnect" : "Connect"}
                </button>
              </div>

              {/* Smart Trainer */}
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl border border-zinc-700">
                <div className="flex items-center gap-3">
                  <Zap
                    className={cn(
                      "w-6 h-6",
                      powerStatus.connected
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-500",
                    )}
                  />
                  <div>
                    <div className="font-bold text-zinc-200">Smart Trainer</div>
                    <div className="text-sm text-zinc-500">
                      {powerStatus.connected
                        ? `${powerStatus.watts}W`
                        : "Disconnected"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={
                    powerStatus.connected
                      ? powerStatus.disconnect
                      : powerStatus.connect
                  }
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-sm transition-colors",
                    powerStatus.connected
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-500",
                  )}
                >
                  {powerStatus.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

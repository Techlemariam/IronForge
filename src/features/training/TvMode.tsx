"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Zap,
  Timer,
  Flame,
  Trophy,
  ChevronUp,
  ChevronDown,
  Bluetooth,
  BluetoothOff,
  Maximize,
  Minimize,
  X,
  Loader2,
} from "lucide-react";
import { useTitanReaction } from "@/features/titan/useTitanReaction";
import { useBluetoothPower } from "@/features/bio/hooks/useBluetoothPower";
import { useBluetoothHeartRate } from "@/features/bio/hooks/useBluetoothHeartRate";
import { SensorManager } from "./components/SensorManager";
import { useCompanionRelay } from "@/features/companion/useCompanionRelay";
import { useGuildContribution } from "@/features/guild/hooks/useGuildContribution";
import { useLiveCombat } from "@/features/combat/hooks/useLiveCombat";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Scan, Podcast } from "lucide-react";
import { PocketCastsPlayer } from "../podcast/components/PocketCastsPlayer";

interface TvModeProps {
  onExit: () => void;
  initialHr?: number;
  initialPower?: number;
  ftp?: number;
  userId?: string;
  pocketCastsConnected?: boolean;
  streak?: number;
  maxHr?: number;
}

interface SessionStats {
  elapsedSeconds: number;
  xpEarned: number;
  goldEarned: number;
  kineticEnergy: number;
}

const ZONE_COLORS: Record<
  number,
  { bg: string; border: string; text: string }
> = {
  1: { bg: "bg-zinc-950", border: "border-zinc-800", text: "text-zinc-400" },
  2: { bg: "bg-blue-950/30", border: "border-blue-900", text: "text-blue-400" },
  3: {
    bg: "bg-green-950/30",
    border: "border-green-900",
    text: "text-green-400",
  },
  4: {
    bg: "bg-yellow-950/30",
    border: "border-yellow-900",
    text: "text-yellow-400",
  },
  5: { bg: "bg-red-950/30", border: "border-red-900", text: "text-red-500" },
};

const getZoneFromHr = (hr: number, maxHr: number = 190) => {
  const pct = (hr / maxHr) * 100;
  if (pct < 60) return 1;
  if (pct < 70) return 2;
  if (pct < 80) return 3;
  if (pct < 90) return 4;
  return 5;
};

export const TvMode: React.FC<TvModeProps> = ({
  onExit,
  initialHr = 60,
  initialPower = 100,
  ftp = 200,
  userId,
  pocketCastsConnected,
  streak: initialStreak = 0,
  maxHr = 190,
}) => {
  // Hooks
  const {
    bpm,
    isConnected: isHrConnected,
    connect: connectHr,
    disconnect: disconnectHr,
  } = useBluetoothHeartRate();

  const {
    data: powerData,
    isConnected: isPowerConnected,
    connect: connectPower,
    disconnect: disconnectPower,
  } = useBluetoothPower();

  // State
  const [hr, setHr] = useState(initialHr); // Fallback/Simulated
  const [power, setPower] = useState(initialPower); // Fallback/Simulated
  const [zone, setZone] = useState(1);
  const [streak, setStreak] = useState(initialStreak);
  const [hudVisible, setHudVisible] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [sensorsMenuOpen, setSensorsMenuOpen] = useState(false);
  const [podcastOpen, setPodcastOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    elapsedSeconds: 0,
    xpEarned: 0,
    goldEarned: 0,
    kineticEnergy: 0,
  });

  // Session Logic
  const searchParams = useSearchParams();
  // Use existing session from URL or generate new one
  const [sessionId] = useState(
    () => searchParams.get("session") || crypto.randomUUID(),
  );
  const [qrVisible, setQrVisible] = useState(false);

  // Companion Relay
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768; // Rough check for role
  const relayRole = searchParams.get("session") ? "CONTROLLER" : "RECEIVER"; // If session param exists, we joined

  const {
    lastEvent,
    broadcast,
    isConnected: isRelayConnected,
  } = useCompanionRelay(relayRole, sessionId);

  // Handle Companion Events (Receiver Handling)
  useEffect(() => {
    if (!lastEvent || relayRole === "CONTROLLER") return;

    if (lastEvent.type === "COMMAND") {
      if (lastEvent.payload === "PAUSE" || lastEvent.payload === "RESUME") {
        // Logic to toggle pause (currently using local state in TvMode, might need prop or internal state)
        // setPaused(p => !p);
        // For now, simpler:
        setHudVisible(true);
      }
    }
  }, [lastEvent, relayRole]);

  // Derived State
  const currentHr = bpm || hr;
  const currentPower = powerData?.watts || power;
  const currentCadence = powerData?.cadence || 0;
  const sensorsConnected = isPowerConnected || isHrConnected;

  // Titan Dialogue Hook
  const { thought: titanDialogue, mood } = useTitanReaction({
    heartRate: currentHr,
    power: currentPower,
    cadence: currentCadence,
    ftp: ftp,
    duration: sessionStats.elapsedSeconds,
    isPaused: false,
  });

  // Guild Wars Hook
  const guildStats = useGuildContribution({
    userId,
    watts: currentPower,
    heartRate: currentHr,
    ftp,
    maxHr,
    isPaused: sensorsMenuOpen,
  });

  // Live Combat Hook (Solo Boss)
  const { boss: soloBoss, lastDamage } = useLiveCombat({
    watts: currentPower,
    heartRate: currentHr,
    ftp,
    maxHr,
    isPaused: sensorsMenuOpen,
  });

  // --- EFFECTS ---

  // Auto-hide HUD after 5 seconds
  useEffect(() => {
    if (!hudVisible) return;
    const timeout = setTimeout(() => setHudVisible(false), 5000);
    return () => clearTimeout(timeout);
  }, [hudVisible, zone, titanDialogue]);

  // Show HUD on zone change or new thought
  useEffect(() => {
    setHudVisible(true);
  }, [zone, titanDialogue]);

  // Update zone when HR changes
  useEffect(() => {
    setZone(getZoneFromHr(currentHr, maxHr));
  }, [currentHr, maxHr]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionStats((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
        xpEarned: prev.xpEarned + (zone >= 3 ? 2 : 1),
        goldEarned: prev.goldEarned + (zone >= 4 ? 1 : 0),
        kineticEnergy: prev.kineticEnergy + (zone >= 4 ? 1 : 0),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [zone]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === " ") setHudVisible((v) => !v);
      if (e.key === "p" || e.key === "P") setPodcastOpen((v) => !v);
      if (e.key === "ArrowUp") setPanelExpanded(true);
      if (e.key === "ArrowDown") setPanelExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const zoneStyle = ZONE_COLORS[zone];

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black z-50 flex flex-col",
        "transition-shadow duration-500",
        zoneStyle.border,
        zoneStyle.bg,
      )}
      onClick={() => setHudVisible(true)}
    >
      {/* Sensor Manager Overlay */}
      <SensorManager
        isOpen={sensorsMenuOpen}
        onClose={() => setSensorsMenuOpen(false)}
        hrStatus={{
          connected: isHrConnected,
          bpm: bpm,
          connect: connectHr,
          disconnect: disconnectHr,
        }}
        powerStatus={{
          connected: isPowerConnected,
          watts: powerData?.watts || 0,
          connect: connectPower,
          disconnect: disconnectPower,
        }}
      />

      {/* --- MOBILE CONTROLLER LAYOUT (Visible on small screens) --- */}
      <div className="md:hidden flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-white italic tracking-tighter">
            IRON COMPANION
          </h2>
          <div className="flex gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isHrConnected ? "bg-green-500" : "bg-red-500",
              )}
            />
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isPowerConnected ? "bg-green-500" : "bg-red-500",
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-auto">
          <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center">
            <Heart
              className={cn(
                "w-8 h-8 mb-2",
                zone >= 4 ? "text-red-500 animate-pulse" : "text-zinc-500",
              )}
            />
            <span className="text-4xl font-black text-white">{currentHr}</span>
            <span className="text-xs text-zinc-500 uppercase">BPM</span>
          </div>
          <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center">
            <Zap
              className={cn(
                "w-8 h-8 mb-2",
                isPowerConnected ? "text-yellow-400" : "text-zinc-500",
              )}
            />
            <span className="text-4xl font-black text-white">
              {currentPower}
            </span>
            <span className="text-xs text-zinc-500 uppercase">WATTS</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSensorsMenuOpen(true);
            }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Bluetooth className="w-5 h-5" /> Manage Sensors
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <X className="w-5 h-5" /> End Session
          </button>
        </div>
      </div>

      {/* --- TV/DESKTOP LAYOUT (Hidden on mobile) --- */}
      <div className="hidden md:block relative w-full h-full">
        <div
          className={cn(
            "absolute inset-0 pointer-events-none border-8",
            zoneStyle.border,
            "shadow-[inset_0_0_60px_10px]",
          )}
        />

        <AnimatePresence>
          {hudVisible && !sensorsMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-10"
            >
              {/* LEFT: Heart Rate & Zone */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <Heart
                    className={cn(
                      "w-12 h-12 animate-pulse",
                      zone >= 4 ? "text-red-500" : "text-white",
                    )}
                  />
                  <div>
                    <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                      {currentHr}{" "}
                      <span className="text-2xl text-zinc-400 font-bold">
                        bpm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-2">
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full font-bold text-sm uppercase tracking-wider bg-black/50 backdrop-blur",
                      zoneStyle.text,
                    )}
                  >
                    Zone {zone}
                  </div>
                  <div className="text-zinc-500 text-sm font-mono">
                    {sessionStats.xpEarned} XP
                  </div>
                </div>
              </div>

              {/* CENTER: Titan Dialogue (Floating) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 max-w-2xl text-center">
                <AnimatePresence mode="wait">
                  {titanDialogue && (
                    <motion.div
                      key={titanDialogue}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="bg-black/60 backdrop-blur px-6 py-3 rounded-2xl border border-white/10"
                    >
                      <p className="text-xl font-medium text-white/90 italic">
                        &quot;{titanDialogue}&quot;
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: Power & Duration */}
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                      {currentPower}{" "}
                      <span className="text-2xl text-zinc-400 font-bold">
                        W
                      </span>
                    </div>
                  </div>
                  <Zap
                    className={cn(
                      "w-12 h-12",
                      isPowerConnected
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-700",
                    )}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-zinc-300 tabular-nums">
                    {formatTime(sessionStats.elapsedSeconds)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQrVisible(!qrVisible);
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        qrVisible
                          ? "bg-white text-black"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400",
                      )}
                    >
                      <Scan className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSensorsMenuOpen(true);
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {sensorsConnected ? (
                        <Bluetooth className="w-5 h-5 text-blue-400" />
                      ) : (
                        <BluetoothOff className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>

                    {/* Podcast Toggle Button */}
                    {pocketCastsConnected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPodcastOpen((prev) => !prev);
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          podcastOpen
                            ? "bg-magma text-white"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                        )}
                      >
                        <Podcast className={cn("w-5 h-5", podcastOpen ? "text-white" : "text-zinc-400")} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExit();
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pocket Casts Player Integration (Floating) */}
              <AnimatePresence>
                {podcastOpen && pocketCastsConnected && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="absolute top-32 right-0 w-96 z-50 mr-8"
                  >
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                      <div className="flex justify-between items-center bg-zinc-800 px-3 py-2 border-b border-zinc-700">
                        <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                          <Podcast className="w-3 h-3" />
                          Pocket Casts
                        </div>
                        <button onClick={() => setPodcastOpen(false)}>
                          <X className="w-3 h-3 text-zinc-400 hover:text-white" />
                        </button>
                      </div>
                      <PocketCastsPlayer />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom HUD: Guild Raid Boss */}
        {/* Bottom HUD: Live Combat (Solo & Guild) */}
        <AnimatePresence>
          {hudVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 flex gap-4"
            >
              {/* SOLO BOSS */}
              <div className="flex-1 bg-zinc-900/80 backdrop-blur border border-zinc-700 p-4 rounded-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <div
                    className="h-full bg-blue-900/30 transition-all duration-300 ease-out"
                    style={{
                      width: `${(soloBoss.currentHp / soloBoss.maxHp) * 100}%`,
                    }}
                  />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-blue-600 p-2 rounded-lg relative">
                    <Trophy className="w-6 h-6 text-white" />
                    {lastDamage > 0 && (
                      <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -20 }}
                        key={Date.now()}
                        className="absolute -top-4 -right-4 text-yellow-400 font-black text-xl drop-shadow-md"
                      >
                        -{lastDamage}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                      Solo Target
                    </div>
                    <div className="text-xl font-black text-white">
                      {soloBoss.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-zinc-300">
                      {soloBoss.currentHp.toLocaleString()} HP
                    </div>
                  </div>
                </div>
              </div>

              {/* GUILD BOSS */}
              <div className="flex-1 bg-zinc-900/80 backdrop-blur border border-zinc-700 p-4 rounded-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <div
                    className="h-full bg-red-900/30 transition-all duration-1000 ease-out"
                    style={{
                      width: `${(guildStats.bossHp / (guildStats.bossTotalHp || 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-red-400 font-bold uppercase tracking-wider">
                      Guild Raid
                    </div>
                    <div className="text-xl font-black text-white">
                      {guildStats.bossName !== "Unknown"
                        ? guildStats.bossName
                        : "Searching..."}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-amber-400">
                      +{guildStats.totalDamage} DMG
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* QR Code Overlay (Desktop) */}
        <AnimatePresence>
          {qrVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={() => setQrVisible(false)}
            >
              <div
                className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-zinc-100 p-4 rounded-xl">
                  <QRCodeSVG
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/training?mode=tv&session=${sessionId}`}
                    size={256}
                    level="H"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-black mb-2">
                    SCAN TO CONTROL
                  </h3>
                  <p className="text-zinc-500 text-sm max-w-xs">
                    Use your phone&apos;s camera to connect as a Companion
                    Controller.
                  </p>
                </div>
                <button
                  onClick={() => setQrVisible(false)}
                  className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import {
  X,
  Bike,
  Footprints,
  ExternalLink,
  Maximize2,
  Columns,
  PictureInPicture2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Activity,
  Clipboard,
  Check,
  Monitor,
  Heart,
  Zap,
  Gauge,
  Podcast,
} from "lucide-react";
import { PocketCastsPlayer } from "@/features/podcast/components/PocketCastsPlayer";
import { WorkoutDefinition } from "@/types/training";
import BuffHud from "./components/BuffHud";
import { getBuffForZone } from "./logic/buffs";
import {
  TrainingMetric,
  calculatePowerZone,
  calculatePaceZone,
} from "./logic/zones";
import { GauntletArena } from "../game/GauntletArena";
import { TvMode } from "./TvMode";
import { ChaseOverlay } from "./components/ChaseOverlay";
import { ChaseEngine } from "@/services/game/ChaseEngine";
import { ChaseState, ChaseDifficulty } from "@/types/chase";
import { updateCardioDuelProgressAction } from "@/actions/pvp/duel";
import { toast } from "sonner";
import { playSound } from "@/utils/root_utils";
import { useBluetoothSpeed } from "@/features/bio/hooks/useBluetoothSpeed";
import { Bluetooth } from "lucide-react";
import { checkOvertrainingStatusAction } from "@/actions/training/overtraining";
import { getStreakStatusAction } from "@/actions/user/streak";

// Dynamic import to avoid SSR issues with react-player
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export type CardioMode = "cycling" | "running" | "gauntlet" | "chase";

interface CardioStudioProps {
  mode: CardioMode;
  onClose: () => void;
  activeWorkout?: WorkoutDefinition;
  userProfile?: {
    ftpCycle?: number;
    ftpRun?: number;
    thresholdSpeedKph?: number;
  };
  userId?: string;
  activeDuel?: any; // Start precise, iterate to proper type
  pocketCastsConnected?: boolean;
}

/**
 * Layout modes for the Cardio Studio
 */
type LayoutMode = "split" | "video-pip" | "zwift-pip" | "tv";

const LAYOUT_OPTIONS: { mode: LayoutMode; label: string; shortcut: string }[] =
  [
    { mode: "split", label: "Split Screen", shortcut: "1" },
    { mode: "video-pip", label: "Video + Zwift PiP", shortcut: "2" },
    { mode: "zwift-pip", label: "Zwift + Video PiP", shortcut: "3" },
    { mode: "tv", label: "TV Mode", shortcut: "4 / T" },
  ];

const LAYOUT_ICONS: Record<LayoutMode, React.ReactNode> = {
  split: <Columns className="w-4 h-4" />,
  "video-pip": <PictureInPicture2 className="w-4 h-4" />,
  "zwift-pip": <PictureInPicture2 className="w-4 h-4 rotate-180" />,
  tv: <Monitor className="w-4 h-4" />,
};

// Main Component acting as a Switcher
export default function CardioStudio(props: CardioStudioProps) {
  const { mode, onClose, userProfile } = props;

  // Shared state used by both modes (for BuffHud simulation or Gauntlet inputs)
  const [simulatedValue, setSimulatedValue] = useState(0);
  const [metric, setMetric] = useState<TrainingMetric>(
    mode === "running" || mode === "chase" ? "pace" : "power",
  );

  // Chase mode state
  const [chaseState, setChaseState] = useState<ChaseState | null>(null);
  const [chaseDifficulty, setChaseDifficulty] = useState<ChaseDifficulty>("normal");
  const chaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [dataSource, setDataSource] = useState<"simulation" | "bluetooth">("simulation");

  // Bluetooth Hooks
  const {
    connect: connectBluetooth,
    disconnect: disconnectBluetooth,
    isConnected: isBluetoothConnected,
    data: bluetoothData,
    deviceName: bluetoothDeviceName
  } = useBluetoothSpeed();

  // Effect: Sync Bluetooth speed to simulatedValue when active (so UI updates uniformly)
  useEffect(() => {
    if (dataSource === "bluetooth" && isBluetoothConnected) {
      setSimulatedValue(bluetoothData.speedKph);
    }
  }, [dataSource, isBluetoothConnected, bluetoothData.speedKph]);

  // Default simulation values if 0
  useEffect(() => {
    if (simulatedValue === 0) {
      if (metric === "hr") setSimulatedValue(100);
      if (metric === "power") setSimulatedValue(150);
      if (metric === "pace") setSimulatedValue(10);
    }
  }, [metric, simulatedValue]);

  // Initialize chase mode
  useEffect(() => {
    if (mode === "chase" && !chaseState) {
      const chaser = ChaseEngine.getRandomChaser();
      if (chaser) {
        setChaseState(ChaseEngine.initializeChase(chaser, chaseDifficulty));
      }
    }
  }, [mode, chaseState, chaseDifficulty]);

  // Chase mode update loop
  useEffect(() => {
    if (mode === "chase" && chaseState && !chaseState.isCaught && !chaseState.hasEscaped) {
      chaseIntervalRef.current = setInterval(() => {
        setChaseState((prev) => {
          if (!prev) return prev;
          return ChaseEngine.updateChase(prev, simulatedValue, 1, chaseDifficulty);
        });
      }, 1000);

      return () => {
        if (chaseIntervalRef.current) {
          clearInterval(chaseIntervalRef.current);
        }
      };
    }
  }, [mode, chaseState, simulatedValue, chaseDifficulty]);

  // Handle chase caught - trigger combat
  const handleChaseCaught = useCallback(() => {
    // For now, just reset the chase. In future: trigger CombatArena
    playSound("fail");
    toast.error("You were caught! Combat would trigger here.");
    const chaser = ChaseEngine.getRandomChaser();
    if (chaser) {
      setChaseState(ChaseEngine.initializeChase(chaser, chaseDifficulty));
    }
  }, [chaseDifficulty]);

  // Handle chase escaped - give rewards
  const handleChaseEscaped = useCallback(() => {
    playSound("loot_epic");
    toast.success("You escaped! +50 XP, +25 Gold");
    const chaser = ChaseEngine.getRandomChaser();
    if (chaser) {
      setChaseState(ChaseEngine.initializeChase(chaser, chaseDifficulty));
    }
  }, [chaseDifficulty]);

  // === CHASE MODE RENDER ===
  if (mode === "chase") {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-zinc-900 to-black">
        {/* ChaseOverlay HUD */}
        {chaseState && (
          <ChaseOverlay
            chaseState={chaseState}
            difficulty={chaseDifficulty}
            currentPaceKph={simulatedValue}
            onCaughtConfirm={handleChaseCaught}
            onEscapedConfirm={handleChaseEscaped}
          />
        )}

        {/* Simulation Slider / Bluetooth Controls for Chase */}
        <div className="absolute bottom-4 left-4 z-[60] bg-black/80 p-4 rounded-lg border border-white/10 w-80">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Pace Source</p>
            <div className="flex gap-1 bg-zinc-900 p-0.5 rounded">
              <button
                onClick={() => setDataSource("simulation")}
                className={`px-2 py-0.5 text-[10px] uppercase rounded ${dataSource === "simulation" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Sim
              </button>
              <button
                onClick={() => setDataSource("bluetooth")}
                className={`px-2 py-0.5 text-[10px] uppercase rounded flex items-center gap-1 ${dataSource === "bluetooth" ? "bg-blue-900/50 text-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <Bluetooth className="w-3 h-3" /> BLE
              </button>
            </div>
          </div>

          {dataSource === "simulation" ? (
            <>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={simulatedValue}
                onChange={(e) => setSimulatedValue(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-sm font-mono text-orange-400 mt-2">
                <span>{simulatedValue.toFixed(1)} km/h</span>
                <span className="text-zinc-500">
                  {simulatedValue > 0 ? `${(60 / simulatedValue).toFixed(1)} min/km` : "--"}
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {!isBluetoothConnected ? (
                <button
                  onClick={connectBluetooth}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <Bluetooth className="w-4 h-4" />
                  Connect Device
                </button>
              ) : (
                <div className="bg-blue-900/20 border border-blue-900/50 rounded p-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-blue-200 font-bold flex items-center gap-1">
                      <Bluetooth className="w-3 h-3" /> Connected
                    </span>
                    <button onClick={disconnectBluetooth} className="text-zinc-500 hover:text-white">
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate mb-2">{bluetoothDeviceName || "Unknown Device"}</p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Speed</p>
                      <p className="text-xl font-mono font-bold text-blue-400 leading-none">
                        {bluetoothData.speedKph.toFixed(1)} <span className="text-sm">km/h</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase">Cadence</p>
                      <p className="text-sm font-mono text-zinc-300">{bluetoothData.cadence || "--"} rpm</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Difficulty Selector */}
          <div className="mt-4 flex gap-2">
            {(["easy", "normal", "hard", "nightmare"] as ChaseDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setChaseDifficulty(d);
                  const chaser = ChaseEngine.getRandomChaser();
                  if (chaser) {
                    setChaseState(ChaseEngine.initializeChase(chaser, d));
                  }
                }}
                className={`flex-1 py-1 text-xs font-bold uppercase rounded transition-colors ${chaseDifficulty === d
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  }

  if (mode === "gauntlet") {
    const currentWatts = metric === "power" ? simulatedValue : 0;
    const currentHr = metric === "hr" ? simulatedValue : 0;

    return (
      <div className="relative w-full h-screen bg-black">
        {/* Simulation Slider for Gauntlet */}
        <div className="absolute bottom-4 left-4 z-[60] bg-black/80 p-2 rounded border border-white/10 w-64">
          <p className="text-xs text-zinc-400 mb-1">DATA SIMULATION</p>
          <input
            type="range"
            min="0"
            max="400"
            value={simulatedValue}
            onChange={(e) => setSimulatedValue(Number(e.target.value))}
            className="w-full accent-magma"
          />
          <div className="flex justify-between text-xs font-mono text-magma mt-1">
            <span>
              {simulatedValue} {metric === "power" ? "W" : "BPM"}
            </span>
          </div>
        </div>

        <GauntletArena
          userLevel={1}
          userFtp={userProfile?.ftpCycle || 200}
          currentWatts={currentWatts}
          currentHr={currentHr}
          onClose={onClose}
        />
      </div>
    );
  }

  return (
    <CardioCockpit
      {...props}
      simulatedValue={simulatedValue}
      setSimulatedValue={setSimulatedValue}
      metric={metric}
      setMetric={setMetric}
    />
  );
}

// Separate component for Standard Mode to isolate hooks
interface CardioCockpitProps extends CardioStudioProps {
  simulatedValue: number;
  setSimulatedValue: (val: number) => void;
  metric: TrainingMetric;
  setMetric: (m: TrainingMetric) => void;
  userId?: string;
  activeDuel?: any;
  pocketCastsConnected?: boolean;
}

function CardioCockpit({
  mode,
  onClose,
  activeWorkout,
  userProfile,
  simulatedValue,
  setSimulatedValue,
  metric,
  setMetric,
  userId,
  activeDuel,
  pocketCastsConnected,
}: CardioCockpitProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");

  const [videoUrl, setVideoUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zwiftStream, setZwiftStream] = useState<MediaStream | null>(null);
  const zwiftVideoRef = useRef<HTMLVideoElement>(null);
  const [showPodcast, setShowPodcast] = useState(false);

  // Buff Logic State
  const [currentZone, setCurrentZone] = useState(2);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionRewards, setSessionRewards] = useState({
    xp: 0,
    gold: 0,
    energy: 0,
  });

  // Duel Logic State
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const lastReportedDistance = useRef(0);

  // Stats Refs to avoid interval resets causing time dilation
  const metricRef = useRef(metric);
  const simulatedValueRef = useRef(simulatedValue);
  const userProfileRef = useRef(userProfile);
  const activeDuelRef = useRef(activeDuel);
  const durationRef = useRef(0);

  useEffect(() => {
    metricRef.current = metric;
    simulatedValueRef.current = simulatedValue;
    userProfileRef.current = userProfile;
    activeDuelRef.current = activeDuel;
  }, [metric, simulatedValue, userProfile, activeDuel]);

  // Storage keys are now mode-specific
  const STORAGE_KEYS = useMemo(
    () => ({
      VIDEO_URL: `cardio_studio_${mode}_video_url`,
      LAYOUT: `cardio_studio_${mode}_layout`,
    }),
    [mode],
  );

  const handleCopyIntervals = () => {
    if (activeWorkout?.intervalsIcuString) {
      navigator.clipboard.writeText(activeWorkout.intervalsIcuString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mode-specific configuration
  const config = useMemo(() => {
    if (mode === "cycling") {
      return {
        title: "Cycling Studio",
        subtitle: "Cycle + Zwift Integration",
        icon: <Bike className="w-6 h-6 text-white" />,
        placeholderText:
          "Paste a YouTube URL or video link above to start your cycling session",
        accentColor: "from-cyan-500 to-cyan-600",
        headerGradient: "from-cyan-900/30 to-zinc-900/30",
      };
    } else {
      return {
        title: "Treadmill Studio",
        subtitle: "Run + Zwift Integration",
        icon: <Footprints className="w-6 h-6 text-white" />,
        placeholderText:
          "Paste a YouTube URL or video link above to start your running session",
        accentColor: "from-orange-500 to-orange-600",
        headerGradient: "from-orange-900/30 to-zinc-900/30",
      };
    }
  }, [mode]);

  // Load from localStorage on mount or mode change
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.VIDEO_URL);
      const savedLayout = localStorage.getItem(
        STORAGE_KEYS.LAYOUT,
      ) as LayoutMode | null;

      if (savedUrl) {
        setInputUrl(savedUrl);
        setVideoUrl(savedUrl);
      } else {
        setInputUrl("");
        setVideoUrl("");
      }

      if (
        savedLayout &&
        ["split", "video-pip", "zwift-pip"].includes(savedLayout)
      ) {
        setLayoutMode(savedLayout);
      } else {
        setLayoutMode("split");
      }
    } catch (e) {
      console.warn("Failed to load cardio studio settings:", e);
    }
  }, [STORAGE_KEYS]);

  // Persist videoUrl to localStorage
  useEffect(() => {
    if (videoUrl) {
      try {
        localStorage.setItem(STORAGE_KEYS.VIDEO_URL, videoUrl);
      } catch (e) {
        console.warn("Failed to save video URL:", e);
      }
    }
  }, [videoUrl, STORAGE_KEYS]);

  // Persist layout to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, layoutMode);
    } catch (e) {
      console.warn("Failed to save layout:", e);
    }
  }, [layoutMode, STORAGE_KEYS]);

  // Handle Stream attachment
  useEffect(() => {
    if (zwiftVideoRef.current && zwiftStream) {
      zwiftVideoRef.current.srcObject = zwiftStream;
    }
  }, [zwiftStream]);

  const handleStartStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "window",
          frameRate: { ideal: 60, max: 60 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setZwiftStream(stream);

      if (layoutMode === "split") {
        setLayoutMode("zwift-pip");
      }

      stream.getVideoTracks()[0].onended = () => {
        setZwiftStream(null);
      };
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  }, [layoutMode]);

  const handleStopStream = useCallback(() => {
    if (zwiftStream) {
      zwiftStream.getTracks().forEach((track) => track.stop());
      setZwiftStream(null);
    }
  }, [zwiftStream]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "KeyM":
          setIsMuted((m) => !m);
          break;
        case "Digit1":
        case "Numpad1":
          setLayoutMode("split");
          break;
        case "Digit2":
        case "Numpad2":
          setLayoutMode("video-pip");
          break;
        case "Digit3":
        case "Numpad3":
          setLayoutMode("zwift-pip");
          break;
        case "Digit4":
        case "Numpad4":
        case "KeyT":
          setLayoutMode("tv");
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleLoadVideo = useCallback(() => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    setVideoUrl(trimmed);
  }, [inputUrl]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoadVideo();
    }
  };

  const openZwift = useCallback(() => {
    window.open("zwift://", "_blank", "noopener,noreferrer");
  }, []);

  const openZwiftCompanion = useCallback(() => {
    window.open("https://companion.zwift.com", "_blank", "noopener,noreferrer");
  }, []);

  // Memoized class calculations
  const videoClasses = useMemo(() => {
    const base =
      "bg-black flex items-center justify-center transition-all duration-300";
    switch (layoutMode) {
      case "split":
        return `${base} w-1/2 h-full`;
      case "video-pip":
        return `${base} w-full h-full`;
      case "zwift-pip":
        const borderColor =
          mode === "cycling" ? "border-cyan-500/50" : "border-orange-500/50";
        return `${base} absolute bottom-4 left-4 w-80 h-48 z-20 rounded-lg overflow-hidden shadow-2xl border-2 ${borderColor} hover:scale-105 hover:z-30 cursor-pointer`;
      default:
        return `${base} w-1/2 h-full`;
    }
  }, [layoutMode, mode]);

  const zwiftClasses = useMemo(() => {
    const base =
      "bg-zinc-900 flex flex-col items-center justify-center transition-all duration-300";
    switch (layoutMode) {
      case "split":
        return `${base} w-1/2 h-full`;
      case "video-pip":
        const borderColor =
          mode === "cycling" ? "border-orange-500/50" : "border-cyan-500/50";
        return `${base} absolute bottom-4 left-4 w-80 h-48 z-20 rounded-lg overflow-hidden shadow-2xl border-2 ${borderColor} hover:scale-105 hover:z-30 cursor-pointer`;
      case "zwift-pip":
        return `${base} w-full h-full`;
      default:
        return `${base} w-1/2 h-full`;
    }
  }, [layoutMode, mode]);

  const handleClearVideo = useCallback(() => {
    setVideoUrl("");
    setInputUrl("");
    try {
      localStorage.removeItem(STORAGE_KEYS.VIDEO_URL);
    } catch (e) {
      console.warn("Failed to clear video URL:", e);
    }
  }, [STORAGE_KEYS]);

  // Buff Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
      durationRef.current += 1;
      const currentDuration = durationRef.current;

      const currentMetric = metricRef.current;
      const val = simulatedValueRef.current;
      const profile = userProfileRef.current;
      const duel = activeDuelRef.current;

      let zone = 1;
      if (currentMetric === "hr") {
        if (val <= 5) zone = Math.floor(val);
        else {
          const maxHr = 190;
          const pct = val / maxHr;
          if (pct < 0.6) zone = 1;
          else if (pct < 0.7) zone = 2;
          else if (pct < 0.8) zone = 3;
          else if (pct < 0.9) zone = 4;
          else zone = 5;
        }
      } else if (currentMetric === "power") {
        const ftp = profile?.ftpCycle || 200;
        zone = calculatePowerZone(val, ftp);
      } else if (currentMetric === "pace") {
        const threshold = profile?.thresholdSpeedKph || 12;
        zone = calculatePaceZone(val, threshold);
      }

      zone = Math.max(1, Math.min(5, zone));
      setCurrentZone(zone);

      const buff = getBuffForZone(zone);
      setSessionRewards((prev) => ({
        xp: prev.xp + 1 * buff.effects.xpMultiplier,
        gold: prev.gold + 0.05 * buff.effects.goldMultiplier,
        energy: prev.energy + 0.2 * buff.effects.energyMultiplier,
      }));

      // DUEL LOGIC: Calculate Distance & Report
      let currentSpeedKph = 0;
      if (currentMetric === "pace") {
        currentSpeedKph = val;
      } else if (currentMetric === "power") {
        currentSpeedKph = Math.sqrt(Math.max(0, val)) * 2.2;
      }

      const distIncrement = currentSpeedKph / 3600; // km per second

      setTotalDistanceKm((prev) => {
        const newDist = prev + distIncrement;

        // Report to server every 10s or 0.1km
        if (
          duel &&
          (newDist - lastReportedDistance.current > 0.1 ||
            currentDuration % 10 === 0)
        ) {
          updateCardioDuelProgressAction(duel.id, newDist).catch((err) =>
            console.error("Duel update failed", err)
          );
          lastReportedDistance.current = newDist;
        }

        return newDist;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setTotalDistanceKm]);

  // === TV MODE RENDER ===
  if (layoutMode === "tv") {
    return (
      <TvMode
        onExit={() => setLayoutMode("split")}
        initialHr={metric === "hr" ? simulatedValue : 120}
        initialPower={metric === "power" ? simulatedValue : 180}
        ftp={userProfile?.ftpCycle || 200}
        userId={userId}
        pocketCastsConnected={pocketCastsConnected}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header
        className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r ${config.headerGradient} border-b border-zinc-800`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 bg-gradient-to-br ${config.accentColor} rounded-lg shadow-lg`}
          >
            {config.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{config.title}</h1>
            <p className="text-xs text-zinc-400">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => setMetric("hr")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${metric === "hr" ? "bg-red-900/30 text-red-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Heart className="w-3 h-3" /> HR
          </button>
          <button
            onClick={() => setMetric("power")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${metric === "power" ? "bg-cyan-900/30 text-cyan-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Zap className="w-3 h-3" /> PWR
          </button>
          <button
            onClick={() => setMetric("pace")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${metric === "pace" ? "bg-green-900/30 text-green-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Gauge className="w-3 h-3" /> PACE
          </button>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
          {LAYOUT_OPTIONS.map(({ mode: m, label, shortcut }) => (
            <button
              key={m}
              onClick={() => setLayoutMode(m)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${layoutMode === m
                ? "bg-gradient-to-r from-zinc-700 to-zinc-600 text-white shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              title={`${label} (${shortcut})`}
            >
              {LAYOUT_ICONS[m]}
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Podcast Toggle */}
        {pocketCastsConnected && (
          <button
            onClick={() => setShowPodcast(!showPodcast)}
            className={`p-2 ml-2 rounded-lg transition-colors ${showPodcast ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            title="Toggle Podcast Player"
          >
            <Podcast className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Video URL Input Bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border-b border-zinc-800">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Paste YouTube URL or video link..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50"
        />
        <button
          onClick={handleLoadVideo}
          className={`px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 border border-zinc-600`}
        >
          <Play className="w-4 h-4" />
          Load
        </button>

        {videoUrl && (
          <div className="flex items-center gap-1 border-l border-zinc-700 pl-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title={`${isPlaying ? "Pause" : "Play"} (Space)`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title={`${isMuted ? "Unmute" : "Mute"} (M)`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleClearVideo}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Clear Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mission Briefing Panel */}
      {activeWorkout && (
        <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeWorkout.name}
              </h3>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
                {activeWorkout.durationLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl">
              {activeWorkout.description}
            </p>
          </div>

          {activeWorkout.intervalsIcuString && (
            <button
              onClick={handleCopyIntervals}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs text-zinc-300 transition-colors"
              title="Copy string for Intervals.icu builder"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Clipboard className="w-3 h-3" />
              )}
              {copied ? "Copied!" : "Copy Intervals String"}
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <BuffHud
          currentZone={currentZone}
          rewards={sessionRewards}
          durationSeconds={sessionDuration}
          metric={metric}
          currentValue={simulatedValue}
          onValueChange={setSimulatedValue}
        />

        {/* Podcast Player Overlay */}
        {showPodcast && (
          <div className="absolute top-20 right-6 z-50 w-96 shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300">
            <button
              onClick={() => setShowPodcast(false)}
              className="absolute -top-2 -right-2 z-[60] p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg border-2 border-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <PocketCastsPlayer />
          </div>
        )}

        {/* Video Panel */}
        <div
          className={videoClasses}
          onClick={
            layoutMode === "zwift-pip"
              ? () => setLayoutMode("video-pip")
              : undefined
          }
        >
          {videoUrl ? (
            <ReactPlayer
              url={videoUrl}
              playing={isPlaying}
              muted={isMuted}
              controls
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
              config={{
                youtube: {
                  playerVars: { modestbranding: 1 },
                },
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 p-8">
              <Activity className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Video Loaded</p>
              <p className="text-sm text-zinc-500 text-center max-w-xs">
                {config.placeholderText}
              </p>
            </div>
          )}
        </div>

        {/* Zwift Panel */}
        <div
          className={zwiftClasses}
          onClick={
            layoutMode === "video-pip"
              ? () => setLayoutMode("zwift-pip")
              : undefined
          }
        >
          {zwiftStream ? (
            <div className="relative w-full h-full group">
              <video
                ref={zwiftVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStopStream();
                  }}
                  className="px-3 py-1.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold rounded shadow-lg backdrop-blur-sm flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Stop Stream
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-3xl font-black text-white">Z</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Zwift {mode === "running" ? "Run" : ""}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 max-w-xs">
                Launch Zwift and stream the window here for a complete cockpit
                experience
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={openZwift}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-500/20"
                >
                  <Maximize2 className="w-5 h-5" />
                  Launch App
                </button>

                <button
                  onClick={handleStartStream}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-all border border-zinc-700 hover:border-zinc-600"
                >
                  <Monitor className="w-5 h-5" />
                  Stream Window
                </button>
                <p className="text-[10px] text-zinc-500 text-center -mt-1 pb-1">
                  Select &quot;Window&quot; tab in popup
                </p>

                <button
                  onClick={openZwiftCompanion}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 font-medium rounded-lg transition-all border border-zinc-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Companion App
                </button>
              </div>

              {layoutMode !== "split" && (
                <p className="text-xs text-zinc-500 mt-4">
                  Tip: Click PiP to expand • Use 1/2/3 to switch layouts
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="flex items-center justify-between px-6 py-2 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span>
            Layout:{" "}
            <span className="text-zinc-300">
              {LAYOUT_OPTIONS.find((l) => l.mode === layoutMode)?.label}
            </span>
          </span>
          {videoUrl && (
            <span>
              Video:{" "}
              <span className="text-zinc-400 truncate max-w-xs">
                {videoUrl}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
            Space
          </kbd>
          <span className="text-zinc-500">Play/Pause</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 ml-2">
            M
          </kbd>
          <span className="text-zinc-500">Mute</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 ml-2">
            1-3
          </kbd>
          <span className="text-zinc-600">Layout</span>
        </div>
      </footer>
    </div>
  );
}

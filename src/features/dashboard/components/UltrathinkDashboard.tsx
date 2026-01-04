import React, { useEffect, useState } from "react";
import {
  IntervalsWellness,
  WeaknessAudit,
  TSBForecast,
  TitanLoadCalculation,
  TTBIndices,
  IntervalsEvent,
  ExerciseLog,
} from "@/types";
import { TrainingPath } from "@/types/training";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Battery,
  Activity,
  Flame,
  Wind,
  Trophy,
  Gauge,
  ShieldAlert,
  ZapOff,
} from "lucide-react";
import { AnalyticsService } from "@/services/analytics";
import { AnalyticsWorkerService } from "@/services/analyticsWorker";
import { StorageService } from "@/services/storage";
import TTBCompass from "@/components/TTBCompass";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { TrainingMemoryManager } from "@/services/trainingMemoryManager";
import { Skeleton } from "@/components/ui/Skeleton";
import { JargonTooltip } from "@/components/ui/JargonTooltip";

interface UltrathinkDashboardProps {
  wellness: IntervalsWellness | null;
  audit: WeaknessAudit;
  forecast: TSBForecast[];
  ttb?: TTBIndices;
  events?: IntervalsEvent[];
  titanAnalysis?: TitanLoadCalculation;
  activePath?: TrainingPath;
}

const UltrathinkDashboard: React.FC<UltrathinkDashboardProps> = ({
  wellness,
  audit,
  forecast,
  ttb,
  events = [],
  titanAnalysis,
  activePath = "WARDEN",
}) => {
  const [acwrData, setAcwrData] = useState<{
    acwr: number;
    acute: number;
    chronic: number;
  } | null>(null);

  // --- WORKER COMPUTATION ---
  useEffect(() => {
    const runHeavyMath = async () => {
      const history = await StorageService.getHistory();
      if (history && wellness) {
        const res = await AnalyticsWorkerService.computeAdvancedStats(
          history,
          wellness,
        );
        setAcwrData({
          acwr: res.acwr,
          acute: res.acuteLoad,
          chronic: res.chronicLoad,
        });
      }
    };
    runHeavyMath();
  }, [wellness]);

  // Use passed prop or default to a "No Activity" state (or keep static for demo? Let's use 0s if missing to encourage real data)
  const displayTitan: TitanLoadCalculation = titanAnalysis || {
    standardTss: 0,
    titanLoad: 0,
    discrepancy: 0,
    advice: "No recent weight training detected.",
  };
  const upcomingRace = events.find(
    (e) => new Date(e.start_date_local) >= new Date(),
  );

  // ACWR Color Logic
  let acwrColor = "text-green-500";
  let acwrStatus = "Optimal Zone";
  if (acwrData) {
    if (acwrData.acwr > 1.5) {
      acwrColor = "text-red-500 animate-pulse";
      acwrStatus = "DANGER: High Injury Risk";
    } else if (acwrData.acwr > 1.3) {
      acwrColor = "text-orange-500";
      acwrStatus = "Caution: Overreaching";
    } else if (acwrData.acwr < 0.8) {
      acwrColor = "text-zinc-500";
      acwrStatus = "Detraining";
    }
  }

  // --- PARENTING SECURITY LAYER ---
  const debuffs = wellness
    ? TrainingMemoryManager.calculateDebuffs(
      wellness.sleepScore || 100,
      wellness.hrv || 50,
    )
    : [];
  const isSurvivalMode = wellness
    ? TrainingMemoryManager.shouldEnterSurvivalMode(
      {
        ctl: wellness.ctl || 0,
        atl: wellness.atl || 0,
        tsb: wellness.tsb || 0,
        hrv: wellness.hrv || 50,
        sleepScore: wellness.sleepScore || 100,
        bodyBattery: wellness.bodyBattery || 100,
        strengthDelta: 0,
        consecutiveStalls: 0,
        weeksInPhase: 0,
        nutritionMode: "MAINTENANCE",
        sleepDebt: 0,
        acwr: 1.0,
        junkMilePercent: 0,
        neuralLoad: 0,
        impactLoad: 0,
        interferenceEvents: 0,
      },
      activePath,
    )
    : false;

  // ... useEffect ...

  // Removed early return to allow Titan Load (Strength) to be visible even without Cardio Wellness
  // if (!wellness) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2 bg-purple-900/20 border border-purple-500/50 rounded-lg">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            Ultrathink Engine
          </h2>
          <p className="text-xs text-purple-400 font-mono">
            Predictive Biometrics & Logistics
          </p>
        </div>
      </div>

      {/* SURVIVAL MODE ALERT */}
      {isSurvivalMode && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-4 animate-pulse flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">
              ⚠️ SURVIVAL MODE ACTIVE
            </h3>
            <p className="text-xs text-red-400 mt-1">
              System integrity critical. All anabolic protocols suspended.
              Active Debuffs:{" "}
              {debuffs.map((d) => d.reason).join(", ") || "Low TSB"}.
            </p>
          </div>
        </div>
      )}

      {/* CAPACITY WARN (If not survival but debuffs exist) */}
      {!isSurvivalMode && debuffs.length > 0 && (
        <div className="bg-orange-950/30 border border-orange-500/50 rounded-lg p-3 flex items-center gap-3">
          <ZapOff className="w-5 h-5 text-orange-500" />
          <div className="flex-1">
            <h3 className="text-xs font-bold text-orange-500 uppercase">
              Capacity Reduced
            </h3>
            <p className="text-[10px] text-orange-400">
              {debuffs.map((d) => d.reason).join(" + ")} detected. High
              intensity load restricted.
            </p>
          </div>
        </div>
      )}

      {/* TTB & Weakness Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TTB Compass (Visual) */}
        {ttb && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex justify-center items-center">
            <TTBCompass indices={ttb} />
          </div>
        )}

        {/* Weakness Auditor Card */}
        <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24 text-zinc-500" />
          </div>

          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Auditor
          </h3>

          {audit.detected ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bottleneck Identified: {audit.type}</AlertTitle>
              <AlertDescription>{audit.message}</AlertDescription>
            </Alert>
          ) : (
            <div className="text-green-500 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>System Nominal. No obvious bottlenecks detected.</span>
            </div>
          )}
        </div>
      </div>

      {/* ACWR (NEW OPTIMIZATION) */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-5 flex items-center justify-between min-h-[100px]">
        {acwrData ? (
          <>
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full border bg-zinc-900 ${acwrData.acwr > 1.3 ? "border-red-900 text-red-500" : "border-green-900 text-green-500"}`}
              >
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  <JargonTooltip term="ACWR">ACWR Score</JargonTooltip>
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-black ${acwrColor}`}>
                    {acwrData.acwr}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono uppercase">
                    {acwrStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-zinc-500">
              <div>
                Acute: <span className="text-white">{acwrData.acute}</span>
              </div>
              <div>
                Chronic: <span className="text-white">{acwrData.chronic}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="space-y-2">
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={150} />
              </div>
            </div>
            <div className="space-y-1">
              <Skeleton variant="text" width={60} />
              <Skeleton variant="text" width={60} />
            </div>
          </>
        )}
      </div>

      {/* Existing Widgets (Events, VO2, Load, PR Forecast) */}
      {upcomingRace && (
        <div className="bg-[#1a1a1a] border border-[#ffd700]/50 rounded-lg p-4 flex items-center gap-4 animate-slide-up relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
          <div className="p-3 bg-[#ffd700]/20 rounded-full border border-[#ffd700] text-[#ffd700]">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Upcoming Boss Fight
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#ffd700] font-bold text-lg">
                {upcomingRace.name}
              </span>
              <span className="text-zinc-500 text-xs font-mono bg-black/50 px-2 rounded">
                {new Date(upcomingRace.start_date_local).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-950/30 border border-cyan-900 rounded-full text-cyan-500">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                <JargonTooltip term="VO2Max">Elite Engine</JargonTooltip>
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-cyan-400">
                  {wellness?.vo2max || "--"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  ml/kg/min
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">
              Target: Sub-70 Club
            </div>
            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden ml-auto">
              <div
                className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
                style={{
                  width: `${Math.min((((wellness?.vo2max || 0) / 70) * 100), 100)}% `,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 relative">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Overload Calculator
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  <JargonTooltip term="TSS">Standard HR Load</JargonTooltip>
                </span>
                <div className="w-8 font-mono text-zinc-500">
                  <span className="text-xl font-mono font-bold text-zinc-400">
                    {displayTitan.standardTss} TSS
                  </span>
                </div>
                <div className="text-zinc-700 text-xs">vs</div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-orange-600">
                    <JargonTooltip term="Titan Load">Titan Load (CNS)</JargonTooltip>
                  </span>
                  <span className="text-xl font-mono font-bold text-orange-500">
                    {displayTitan.titanLoad} TL
                  </span>
                  {displayTitan.appliedMultiplier &&
                    displayTitan.appliedMultiplier > 1.0 && (
                      <span className="text-[10px] text-orange-400 animate-pulse">
                        Buff Active: {displayTitan.appliedMultiplier}x
                      </span>
                    )}
                </div>
              </div>
              {titanAnalysis && (
                <div className="text-[10px] text-zinc-500 italic border-t border-zinc-800 pt-2">
                  {titanAnalysis.advice}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Predictive PR Window (7-Day Forecast)
          </h3>

          <div className="space-y-2">
            {forecast.map((day) => {
              const isOptimal = day.label.includes("Optimal");
              const isRisk = day.label.includes("High Risk");

              return (
                <div
                  key={day.dayOffset}
                  className="flex items-center gap-4 text-xs"
                >
                  <div className="w-8 font-mono text-zinc-400">
                    {day.dayOffset === 0 ? "TDY" : `+ ${day.dayOffset} d`}
                  </div>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute h-full rounded-full transition-all ${day.tsb < 0
                        ? "right-1/2 bg-red-500"
                        : "left-1/2 bg-green-500"
                        }`}
                      style={{
                        width: `${Math.min(Math.abs(day.tsb) * 2, 50)}% `,
                      }}
                    />
                    <div className="absolute left-1/2 w-px h-full bg-zinc-600"></div>
                  </div>
                  <div
                    className={`w-24 text-right font-bold ${isOptimal ? "text-green-400" : isRisk ? "text-red-400" : "text-zinc-500"}`}
                  >
                    {day.tsb > 0 ? `+ ${day.tsb} ` : day.tsb} <JargonTooltip term="TSB">TSB</JargonTooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltrathinkDashboard;

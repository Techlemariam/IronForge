"use client";

import React, { useState } from "react";
import { TrainingPath, LayerLevel, WorkoutDefinition } from "@/types/training";
import {
  MOBILITY_LAYER_BONUSES,
  RECOVERY_LAYER_BONUSES,
  PATH_INFO,
} from "@/data/builds";
import { PathSelector } from "@/components/PathSelector";
import { PassiveLayerProgress } from "@/components/PassiveLayerProgress";
import {
  ArrowLeft,
  Clock,
  Activity,
  Zap,
  Book,
  Dumbbell,
  Heart,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WORKOUT_LIBRARY } from "@/data/workouts";
import { cn } from "@/lib/utils";
import { HeartRateZoneChart } from "@/features/bio/components/HeartRateZoneChart";

interface TrainingCenterProps {
  activePath: TrainingPath;
  mobilityLevel: LayerLevel;
  recoveryLevel: LayerLevel;
  onClose: () => void;
  onSelectWorkout: (workout: WorkoutDefinition) => void;
  onImportRoutines?: () => void;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = ({
  activePath,
  mobilityLevel,
  recoveryLevel,
  onClose,
  onSelectWorkout,
  onImportRoutines,
}) => {
  const pathInfo = PATH_INFO[activePath];
  const pathColor = pathInfo.color.split("-")[1];

  // Data Fetching for Zones
  const [zoneActivities, setZoneActivities] = useState<any[]>([]);
  const [athleteSettings, setAthleteSettings] = useState<any>(null);

  React.useEffect(() => {
    // dynamic import or fetch from server actions
    const loadData = async () => {
      try {
        const [acts, settings] = await Promise.all([
          // Import these dynamically to avoid server component issues in client component if using actions directly here
          // or assume actions are passed as props.
          // For now, let's assume we can call the actions if they are 'use server' imported at top (which works in Nextjs 14+)
          // But wait, "TrainingCenter" is 'use client'. We can import server actions.
          import("@/actions/integrations/intervals").then((mod) =>
            mod.getActivitiesAction(
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // Last 7 days
              new Date().toISOString().split("T")[0],
            ),
          ),
          import("@/actions/integrations/intervals").then((mod) =>
            mod.getAthleteSettingsAction(),
          ),
        ]);
        setZoneActivities(acts);
        setAthleteSettings(settings);
      } catch (error) {
        console.error("Failed to load intervals data", error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-20">
      {/* Glassmorphic Header */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 p-8 shadow-2xl`}
      >
        <div
          className={`absolute inset-0 bg-${pathColor}-500/10 backdrop-blur-sm z-0`}
        />
        <div
          className={`absolute -right-20 -top-20 w-64 h-64 bg-${pathColor}-500/20 blur-[100px] rounded-full`}
        />

        <div className="relative z-10">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Citadel</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{pathInfo.icon}</span>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">
                  {pathInfo.name}
                </h1>
              </div>
              <p className="text-zinc-300 max-w-lg text-lg leading-relaxed">
                {pathInfo.description}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5 text-center min-w-[100px]">
                <div className="text-xs text-zinc-500 uppercase font-bold">
                  Strength
                </div>
                <div className={`text-xl font-black text-${pathColor}-400`}>
                  {pathInfo.strengthLevel}
                </div>
              </div>
              <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5 text-center min-w-[100px]">
                <div className="text-xs text-zinc-500 uppercase font-bold">
                  Cardio
                </div>
                <div className={`text-xl font-black text-${pathColor}-400`}>
                  {pathInfo.cardioLevel}
                </div>
              </div>
              {onImportRoutines && (
                <button
                  onClick={onImportRoutines}
                  className="bg-magma/20 backdrop-blur-md p-3 rounded-xl border border-magma/50 text-center min-w-[100px] hover:bg-magma/30 transition-colors"
                >
                  <div className="text-xs text-magma uppercase font-bold">
                    Hevy
                  </div>
                  <div className="text-sm font-black text-white">Import</div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Path Selector */}
        <section>
          <h2 className="text-xl font-bold uppercase text-magma mb-4 tracking-wider">
            Active Training Path
          </h2>
          <PathSelector initialPath={activePath} />
        </section>

        {/* Heart Rate Zones (New) */}
        <section>
          <HeartRateZoneChart
            activities={zoneActivities}
            settings={athleteSettings}
          />
        </section>

        {/* Passive Layers (Glass) */}
        <section className="relative overflow-hidden rounded-xl border border-white/5 p-6 shadow-xl">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md z-0" />
          <div className="relative z-10">
            <PassiveLayerProgress
              mobilityLevel={mobilityLevel}
              recoveryLevel={recoveryLevel}
              mobilitySessionsCompleted={mobilityLevel === "NONE" ? 2 : 15}
              recoverySessionsCompleted={recoveryLevel === "NONE" ? 5 : 45}
              mobilityBonuses={MOBILITY_LAYER_BONUSES[mobilityLevel]}
              recoveryBonuses={RECOVERY_LAYER_BONUSES[recoveryLevel]}
            />
          </div>
        </section>

        {/* New Codex 2.0 */}
        <CodexTabs activePath={activePath} onSelectWorkout={onSelectWorkout} />
      </div>
    </div>
  );
};

// --- CODEX 2.0 COMPONENTS ---

type Tab = "FOR_YOU" | "STRENGTH" | "CARDIO" | "RECOVERY";

const CodexTabs: React.FC<{
  activePath: TrainingPath;
  onSelectWorkout: (w: WorkoutDefinition) => void;
}> = ({ activePath, onSelectWorkout }) => {
  const [activeTab, setActiveTab] = useState<Tab>("FOR_YOU");

  // Filter Logic
  const recommended = WORKOUT_LIBRARY.filter((w) =>
    (w.recommendedPaths || []).includes(activePath),
  );
  const strength = WORKOUT_LIBRARY.filter(
    (w) => w.type !== "RUN" && w.type !== "BIKE",
  );
  const cardio = WORKOUT_LIBRARY.filter(
    (w) =>
      (w.type === "RUN" || w.type === "BIKE") &&
      !w.name.toLowerCase().includes("recovery"),
  );
  const recovery = WORKOUT_LIBRARY.filter(
    (w) => w.name.toLowerCase().includes("recovery") || w.intensity === "LOW",
  );

  const getWorkoutsForTab = () => {
    switch (activeTab) {
      case "FOR_YOU":
        return recommended;
      case "STRENGTH":
        return strength;
      case "CARDIO":
        return cardio;
      case "RECOVERY":
        return recovery;
      default:
        return [];
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-6 h-6 text-magma" />
          <h2 className="text-xl font-bold uppercase text-white tracking-wider">
            80/20 Codex
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-900/80 backdrop-blur-md rounded-lg border border-white/5">
          <TabButton
            active={activeTab === "FOR_YOU"}
            onClick={() => setActiveTab("FOR_YOU")}
            icon={<Zap className="w-3 h-3" />}
            label="For You"
            testId="tab-for-you"
          />
          <TabButton
            active={activeTab === "STRENGTH"}
            onClick={() => setActiveTab("STRENGTH")}
            icon={<Dumbbell className="w-3 h-3" />}
            label="Strength"
            testId="tab-strength"
          />
          <TabButton
            active={activeTab === "CARDIO"}
            onClick={() => setActiveTab("CARDIO")}
            icon={<Heart className="w-3 h-3" />}
            label="Cardio"
            testId="tab-cardio"
          />
          <TabButton
            active={activeTab === "RECOVERY"}
            onClick={() => setActiveTab("RECOVERY")}
            icon={<Activity className="w-3 h-3" />}
            label="Recovery"
            testId="tab-recovery"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {getWorkoutsForTab().map((workout) =>
            activeTab === "FOR_YOU" ? (
              <HeroWorkoutCard
                key={workout.id}
                workout={workout}
                onClick={() => onSelectWorkout(workout)}
                testId={`workout-card-${workout.id}`}
              />
            ) : (
              <CompactWorkoutCard
                key={workout.id}
                workout={workout}
                onClick={() => onSelectWorkout(workout)}
                testId={`workout-card-${workout.id}`}
              />
            ),
          )}
          {getWorkoutsForTab().length === 0 && (
            <div className="col-span-full text-center py-20 text-zinc-500 italic">
              No workouts found for this category.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  testId?: string;
}> = ({ active, onClick, icon, label, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all",
      active
        ? "bg-magma text-black shadow-lg shadow-magma/20"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const HeroWorkoutCard: React.FC<{
  workout: WorkoutDefinition;
  onClick: () => void;
  testId?: string;
}> = ({ workout, onClick, testId }) => {
  const intensityColor = {
    LOW: "text-blue-400",
    MEDIUM: "text-yellow-400",
    HIGH: "text-red-500",
  }[workout.intensity];

  return (
    <motion.div
      layout
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      onClick={onClick}
      data-testid={testId}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="col-span-1 md:col-span-2 lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl border border-magma/30 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-magma/10 transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-magma/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-magma/20 text-magma text-[10px] font-black uppercase px-2 py-1 rounded border border-magma/30">
            Recommended
          </span>
          {workout.rewards && (
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-[10px] font-bold text-yellow-400">
                {workout.rewards.xp} XP
              </span>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-black italic text-white mb-2 leading-tight group-hover:text-magma transition-colors">
          {workout.name}
        </h3>
        <p className="text-zinc-400 text-sm mb-6 line-clamp-3">
          {workout.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {workout.durationMin}m
            </div>
            <div className={`flex items-center gap-1 ${intensityColor}`}>
              <Activity className="w-4 h-4" />
              {workout.intensity}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded-full group-hover:bg-magma group-hover:text-black transition-colors">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CompactWorkoutCard: React.FC<{
  workout: WorkoutDefinition;
  onClick: () => void;
  testId?: string;
}> = ({ workout, onClick, testId }) => {
  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 },
      }}
      onClick={onClick}
      data-testid={testId}
      whileHover={{ scale: 1.01, x: 4 }}
      className="bg-black/20 border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/5 hover:border-white/10 transition-colors group flex items-center justify-between"
    >
      <div className="flex flex-col">
        <h4 className="font-bold text-zinc-200 text-sm group-hover:text-magma transition-colors">
          {workout.name}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
          <span className="bg-white/5 px-1.5 py-0.5 rounded text-zinc-400">
            {workout.durationMin}m
          </span>
          <span className="uppercase">{workout.type}</span>
        </div>
      </div>

      {workout.rewards ? (
        <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
          {workout.rewards.xp} XP
        </span>
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-magma/20 group-hover:text-magma transition-colors">
          <Dumbbell className="w-4 h-4 text-zinc-500 group-hover:text-magma" />
        </div>
      )}
    </motion.div>
  );
};

export default TrainingCenter;

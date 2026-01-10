"use client";

import React, { Suspense, useReducer, useEffect, useState } from "react";
import { toast } from "@/components/ui/GameToast";
import { PwaInstallBanner } from "@/components/ui/PwaInstallBanner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Exercise } from "@/types/ironforge";
import {
  IntervalsWellness,
  TTBIndices,
  WeaknessAudit,
  TSBForecast,
  IntervalsEvent,
  TitanLoadCalculation,
  Session,
  AppSettings,
} from "@/types";
import { User } from "@prisma/client";
import { AuditReport } from "@/types/auditor";
import { saveWorkoutAction } from "@/actions/integrations/hevy";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CampaignTracker } from "@/features/game/components/campaign/CampaignTracker";
import { AnimatePresence, motion } from "framer-motion";
import { HevyExerciseTemplate, HevyRoutine } from "@/types/hevy";
import { mapHevyToQuest, mapQuestToHevyPayload } from "@/utils/hevyAdapter";
import { mapSessionToQuest, mapQuestToSession } from "@/utils/typeMappers";
import { OracleRecommendation } from "@/types";
import OracleCard from "../oracle/components/OracleCard";
import UltrathinkDashboard from "@/features/dashboard/components/UltrathinkDashboard";
import { getProgressionAction } from "@/actions/progression/core";
import OracleVerdict from "@/features/oracle/components/OracleVerdict";
import GeminiLiveCoach from "@/features/training/components/GeminiLiveCoach";
import { Mic, Bike, Footprints, Settings, ArrowLeft } from "lucide-react";

import TrainingCenter from "@/features/training/TrainingCenter";
import {
  TrainingPath,
  LayerLevel,
  WeeklyMastery,
  Faction,
} from "@/types/training";
import { LeaderboardEntry } from "@/actions/social/leaderboards";
import { CardioMode } from "@/features/training/CardioStudio";
import { OracleChat } from "@/features/oracle/components/OracleChat";
import { WorkoutDefinition } from "@/types/training";
import { mapDefinitionToSession } from "@/utils/workoutMapper";
import { playSound } from "@/utils";

// Dynamic Imports with disabling SSR for client-heavy features
const RoutineSelector = dynamic(
  () => import("@/features/training/RoutineSelector"),
  { ssr: false },
);
const IronMines = dynamic(() => import("@/features/strength/IronMines"), {
  ssr: false,
});
const CombatArena = dynamic(() => import("@/features/game/CombatArena"), {
  ssr: false,
});
const SocialHub = dynamic(
  () => import("@/features/social/SocialHub").then((mod) => mod.SocialHub),
  { ssr: false },
);

const Marketplace = dynamic(() => import("@/components/game/Marketplace"), {
  ssr: false,
});
const TheForge = dynamic(() => import("@/features/game/TheForge"), {
  ssr: false,
});
const CardioStudio = dynamic(() => import("@/features/training/CardioStudio"), {
  ssr: false,
});
import StravaUpload from "@/features/training/components/strava/StravaUpload";
import { CitadelHub } from "@/features/dashboard/CitadelHub";
import { FirstLoginQuest } from "@/features/onboarding/FirstLoginQuest";
import { QuestBoard } from "@/components/gamification/QuestBoard";
import { StrengthContainer } from "@/features/strength/StrengthContainer";
import { ProgramBuilder } from "@/features/training/ProgramBuilder";
import { TrophyRoom } from "@/features/gamification/TrophyRoom";
import { GuildHall } from "@/features/guild/GuildHall";
import { TitanAvatar } from "@/features/titan/TitanAvatar";
import { PersistentHeader } from "@/components/core/PersistentHeader";
import { ShimmerBadge } from "@/components/ui/ShimmerBadge";
import { Citadel } from "./components/Citadel";
import { QuestCompletion } from "./components/QuestCompletion";
import { CoachToggle } from "./components/CoachToggle";
import { ViewRouter } from "./components/ViewRouter";
import {
  EquipmentArmory,
  Bestiary,
  WorldMap,
  Grimoire,
  Arena,
  CodexLoader,
} from "./components/SecondaryViews";
import {
  View,
  DashboardState,
  DashboardAction,
  DashboardData,
  DashboardClientProps,
} from "./types";
import { dashboardReducer } from "./logic/dashboardReducer";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { usePlatformContext } from "@/hooks/usePlatformContext";
import { TvHud } from "@/components/ui/TvHud";

const getAmbientZone = (
  view: View,
): "citadel" | "forge" | "arena" | "wilds" | "void" => {
  switch (view) {
    case "citadel":
    case "war_room":
    case "training_center":
    case "social_hub":
    case "guild_hall":
    case "program_builder":
    case "trophy_room":
    case "strength_log":
    case "strava_upload":
    case "cardio_studio":
      return "citadel";
    case "forge":
    case "armory":
    case "item_shop":
    case "marketplace":
      return "forge";
    case "arena":
    case "combat_arena":
    case "world_map":
    case "bestiary":
      return "arena";
    case "grimoire":
      return "void";
    case "import_routines": // <-- Added
      return "citadel";
    default:
      return "citadel";
  }
};

// Consolidated Data Object from Server

const DashboardClient: React.FC<DashboardClientProps> = (props) => {
  const {
    initialData,
    isDemoMode,
    userData,
    faction,
    hasCompletedOnboarding,
    hevyRoutines,
    hevyTemplates,
    intervalsConnected,
    stravaConnected,
    pocketCastsConnected,
    challenges,
    titanState,
    liteMode,
  } = props;

  // Leaderboard data passed from server component (or empty for backward-compat)
  const leaderboardData = props.leaderboardData || [];

  // Use Titan State if available, fallback to User (Legacy)
  const level = titanState?.level || userData?.level || 1;
  const nameMap = new Map<string, string>();
  // Checking page.tsx again: it doesn't pass nameMap in initialData. It was passing it before.
  // We should probably derive it or accept it.
  // The previous code had `nameMap: Map<string, string>` in InitialDataProps.
  // Let's assume for now we use an empty map or fetch it.

  const initialStateFromProps: DashboardState = {
    isCodexLoading: false,
    wellnessData: initialData.wellness,
    ttb: initialData.ttb,
    level: level,
    activeQuest: null,
    questTitle: "",
    exerciseNameMap: nameMap,
    startTime: null,
    currentView: "citadel",
    oracleRecommendation: initialData.recommendation, // rename matched
    auditReport: initialData.auditReport,
    weaknessAudit: initialData.auditReport?.highestPriorityGap
      ? {
        detected: true,
        type: "NONE",
        message: `Focus: ${initialData.auditReport.highestPriorityGap.muscleGroup}`,
        confidence: 1,
      }
      : null,
    forecast: initialData.forecast,
    events: initialData.events,
    titanAnalysis: initialData.titanAnalysis,
    isCoachOpen: false,
    activeBossId: null,
    activePath: initialData.activePath || "WARDEN",
    mobilityLevel: userData?.mobilityLevel || "NONE",
    recoveryLevel: userData?.recoveryLevel || "NONE",
    totalExperience: titanState?.xp || userData?.totalExperience || 0,

    weeklyMastery: initialData.weeklyMastery,
    cardioMode: "cycling", // Default
    returnView: null,
    faction: (faction as Faction) || "HORDE",
    challenges: challenges || [],
    activeDuel: initialData.activeDuel || props.activeDuel,
    trainingContext: initialData.trainingContext,
  };

  const [state, dispatch] = useReducer(dashboardReducer, initialStateFromProps);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);
  const router = useRouter();
  const platform = usePlatformContext();

  useEffect(() => {
    dispatch({ type: "UPDATE_CHALLENGES", payload: challenges || [] });
  }, [challenges, dispatch]);

  // God Tier 2: Soundscapes
  useAmbientSound(getAmbientZone(state.currentView));

  useEffect(() => {
    if (typeof window !== "undefined") {
      // P0: Demo Mode First - Default demo users as configured
      if (isDemoMode) {
        setIsConfigured(true);
        return; // Skip API key check for demo users
      }

      // Check both localStorage and server key
      const checkConfiguration = () => {
        const hasLocalKey = !!localStorage.getItem("hevy_api_key");
        const hasServerKey = !!userData?.hevyApiKey;
        setIsConfigured(hasLocalKey || hasServerKey);
      };

      // Initial check
      checkConfiguration();

      // Re-check on storage events (for cross-tab sync)
      window.addEventListener('storage', checkConfiguration);

      // Also poll every second for the first 5 seconds after mount
      // This helps catch localStorage changes in the same tab (e.g., from test setup)
      const pollInterval = setInterval(checkConfiguration, 1000);
      const stopPolling = setTimeout(() => clearInterval(pollInterval), 5000);

      return () => {
        window.removeEventListener('storage', checkConfiguration);
        clearInterval(pollInterval);
        clearTimeout(stopPolling);
      };
    }
  }, [isDemoMode, userData]);

  const handleSaveWorkout = async (isPrivate: boolean) => {
    if (!state.activeQuest || !state.startTime) return;

    const apiKey = userData?.hevyApiKey || localStorage.getItem("hevy_api_key");
    if (!apiKey) {
      toast.error("Access Denied", {
        description: "You need a Hevy API Key to save quests.",
      });
      router.push("/settings");
      return;
    }

    const payload = mapQuestToHevyPayload(
      state.activeQuest,
      state.questTitle,
      state.startTime,
      new Date(),
      isPrivate,
    );
    try {
      await saveWorkoutAction(apiKey, payload);
      toast.success("Quest Log Updated!", {
        description: "The Hevy Archive has explicitly recorded your victory.",
      });
    } catch (error) {
      console.error("Uplink to Hevy failed:", error);
      toast.warning("Loot Secured Locally", {
        description: "Uplink to Hevy failed. Check console.",
      });
    } finally {
      const newProgression = await getProgressionAction();
      if (newProgression) {
        dispatch({
          type: "RECALCULATE_PROGRESSION",
          payload: { level: newProgression.level },
        });
      }
      dispatch({ type: "SAVE_WORKOUT" });
    }
  };

  // View rendering delegated to ViewRouter component
  const viewRouterProps = {
    state,
    dispatch,
    userData,
    titanState,
    pocketCastsConnected,
    liteMode,
    onSaveWorkout: handleSaveWorkout,
    leaderboardEntries: leaderboardData, // Pass it down
  };

  const AnimatedViewWrapper = ({
    children,
    viewKey,
  }: {
    children: React.ReactNode;
    viewKey: string;
  }) => (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  if (!isConfigured) {
    return (
      <main id="config-screen" className="bg-void min-h-screen text-white flex items-center justify-center p-4">
        <div className="scanlines" />
        <Link
          href="/settings"
          className="absolute top-6 right-6 z-50 text-forge-muted hover:text-white transition-colors p-2 hover:rotate-90 duration-300"
        >
          <Settings size={24} />
        </Link>
        <div className="w-full h-screen flex items-center justify-center font-mono text-center p-4">
          <div>
            <h2 className="text-xl text-magma uppercase tracking-widest">
              Configuration Required
            </h2>
            <p className="text-forge-muted">
              Please configure your settings in the{" "}
              <Link href="/settings" className="text-magma underline">
                Settings Page
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.isCodexLoading) return <main id="codex-loader"><CodexLoader /></main>;

  return (
    <div id="main-content" className="bg-forge-900 min-h-screen bg-noise">
      <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-5" />

      <PwaInstallBanner />

      {platform === "tv" && (
        <TvHud
          questTitle={state.questTitle}
          heartRate={state.wellnessData?.hrv} // Using HRV as a proxy for HR if HR not direct
          bossName={state.activeBossId || undefined}
        />
      )}

      <Link
        href="/settings"
        className="fixed top-6 right-6 z-50 text-forge-muted hover:text-white transition-colors p-2 hover:rotate-90 duration-300"
        aria-label="Settings"
      >
        <Settings size={24} />
      </Link>

      <PersistentHeader
        level={state.level}
        xp={state.totalExperience}
        gold={userData?.gold || 0}
        faction={state.faction}
        powerRating={titanState?.powerRating || 0}
      />

      <AnimatePresence mode="wait">
        <AnimatedViewWrapper viewKey={state.currentView}>
          <main id="view-container">
            <ViewRouter {...viewRouterProps} />
          </main>
        </AnimatedViewWrapper>
      </AnimatePresence>

      {showOnboarding && (
        <FirstLoginQuest
          onComplete={(newState) => {
            setShowOnboarding(false);
            if (newState) {
              dispatch({
                type: "RECALCULATE_PROGRESSION",
                payload: { level: newState.level },
              });
            }
          }}
        />
      )}

      <CoachToggle onClick={() => dispatch({ type: "TOGGLE_COACH" })} />
      <GeminiLiveCoach
        isOpen={state.isCoachOpen}
        onClose={() => dispatch({ type: "TOGGLE_COACH" })}
      />

      <OracleChat
        context={{
          userId: userData?.id || "unknown",
          path: state.activePath,
          wellness: state.wellnessData,
          mastery: state.weeklyMastery,
          indices: state.ttb,
        }}
      />
    </div>
  );
};

export default DashboardClient;

"use client";

import React, { useReducer, useEffect, useState } from "react";
import { toast } from "@/components/ui/GameToast";
import { useRouter } from "next/navigation";



import { saveWorkoutAction } from "@/actions/integrations/hevy";


import { mapQuestToHevyPayload } from "@/utils/hevyAdapter";


import { getProgressionAction } from "@/actions/progression/core";



import { Faction } from "@/types/training";


// Dynamic Imports moved to ViewRouter
import { FirstLoginQuest } from "@/features/onboarding/FirstLoginQuest";
import {
  View,
  DashboardState,
  DashboardClientProps,
} from "./types";
import { dashboardReducer } from "./logic/dashboardReducer";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { usePlatformContext } from "@/hooks/usePlatformContext";

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

import { DashboardPresenter } from "./components/DashboardPresenter";

const DashboardClient: React.FC<DashboardClientProps> = (props) => {
  const {
    initialData,
    userData,
    faction,
    hasCompletedOnboarding,
    pocketCastsConnected,
    challenges,
    titanState,
    liteMode,
  } = props;

  const leaderboardData = props.leaderboardData || [];
  const level = titanState?.level || userData?.level || 1;
  const nameMap = new Map<string, string>();

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
    oracleRecommendation: initialData.recommendation,
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
    cardioMode: "cycling",
    returnView: null,
    faction: (faction as Faction) || "HORDE",
    challenges: challenges || [],
    activeDuel: initialData.activeDuel || props.activeDuel,
    trainingContext: initialData.trainingContext,
  };

  const [state, dispatch] = useReducer(dashboardReducer, initialStateFromProps);
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);
  const router = useRouter();
  const platform = usePlatformContext();

  useEffect(() => {
    dispatch({ type: "UPDATE_CHALLENGES", payload: challenges || [] });
  }, [challenges, dispatch]);

  useAmbientSound(getAmbientZone(state.currentView));

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

  return (
    <>
      <DashboardPresenter
        state={state}
        dispatch={dispatch}
        userData={userData}
        titanState={titanState}
        pocketCastsConnected={pocketCastsConnected}
        liteMode={liteMode}
        hasCompletedOnboarding={hasCompletedOnboarding}
        leaderboardData={leaderboardData}
        platform={platform}
        onSaveWorkout={handleSaveWorkout}
        onToggleCoach={() => dispatch({ type: "TOGGLE_COACH" })}
      />
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
    </>
  );
};

export default DashboardClient;

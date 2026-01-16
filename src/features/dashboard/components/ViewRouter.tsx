"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/GameToast";
import { DashboardState, DashboardAction } from "../types";
import { TitanState } from "@/actions/titan/core";
import { User } from "@prisma/client";
import { mapQuestToSession } from "@/utils/typeMappers";
import { mapDefinitionToSession } from "@/utils/workoutMapper";

// Static imports for lightweight components
import StravaUpload from "@/features/training/components/strava/StravaUpload";
import { StrengthContainer } from "@/features/strength/StrengthContainer";
import { ProgramBuilder } from "@/features/training/ProgramBuilder";
import { TrophyRoom } from "@/features/gamification/TrophyRoom";
import { GuildHall } from "@/features/guild/GuildHall";
import TrainingCenter from "@/features/training/TrainingCenter";
import { Citadel } from "./Citadel";
import { QuestCompletion } from "./QuestCompletion";
import {
    EquipmentArmory,
    Bestiary,
    WorldMap,
    Grimoire,
    Arena,
} from "./SecondaryViews";

// Dynamic imports for heavy/client-only components
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

import { LeaderboardEntry } from "@/actions/social/leaderboards";

export interface ViewRouterProps {
    state: DashboardState;
    dispatch: React.Dispatch<DashboardAction>;
    userData?: Partial<User> | null;
    titanState?: TitanState | null;
    pocketCastsConnected?: boolean;
    liteMode?: boolean;
    onSaveWorkout: (isPrivate: boolean) => void;
    leaderboardEntries?: LeaderboardEntry[];
}

/**
 * Routes to the appropriate view based on currentView state.
 * Extracted from DashboardClient to reduce component size.
 */
export const ViewRouter: React.FC<ViewRouterProps> = ({
    state,
    dispatch,
    userData,
    titanState,
    pocketCastsConnected,
    liteMode,
    onSaveWorkout,
    leaderboardEntries,
}) => {
    console.log("[ViewRouter] Rendering view:", state.currentView, "ActiveQuest:", !!state.activeQuest);
    switch (state.currentView) {
        case "citadel":
            return (
                <Citadel
                    state={state}
                    dispatch={dispatch}
                    titanState={titanState}
                    pocketCastsConnected={pocketCastsConnected}
                    liteMode={liteMode}
                    leaderboardEntries={leaderboardEntries}
                />
            );

        case "training_center":
            return (
                <TrainingCenter
                    activePath={state.activePath}
                    mobilityLevel={state.mobilityLevel}
                    recoveryLevel={state.recoveryLevel}
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                    onSelectWorkout={(workout) => {
                        if (workout.type === "STRENGTH" || workout.type === "MOBILITY") {
                            const session = mapDefinitionToSession(workout);
                            dispatch({ type: "START_GENERATED_QUEST", payload: session });
                        } else {
                            dispatch({ type: "START_CODEX_WORKOUT", payload: { workout } });
                        }
                    }}
                    onImportRoutines={() =>
                        dispatch({ type: "SET_VIEW", payload: "import_routines" })
                    }
                />
            );

        case "import_routines":
            return (
                <div className="p-4 md:p-8 animate-fade-in relative min-h-screen">
                    <button
                        onClick={() =>
                            dispatch({ type: "SET_VIEW", payload: "training_center" })
                        }
                        className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Training Center
                    </button>
                    <RoutineSelector
                        exerciseNameMap={state.exerciseNameMap}
                        onSelectRoutine={async (routine) => {
                            try {
                                const { importHevyRoutineToTemplateAction } =
                                    await import("@/actions/integrations/hevy");
                                await importHevyRoutineToTemplateAction(routine);
                                toast.success("Routine Imported", {
                                    description: `${routine.title} is now a Workout Template.`,
                                });
                                dispatch({ type: "SET_VIEW", payload: "training_center" });
                            } catch (err: unknown) {
                                console.error(err);
                                const message = err instanceof Error ? err.message : "Unknown error";
                                toast.error("Import Failed", { description: message });
                            }
                        }}
                        mode="import"
                    />
                </div>
            );

        case "war_room":
            return (
                <RoutineSelector
                    exerciseNameMap={state.exerciseNameMap}
                    onSelectRoutine={(routine) =>
                        dispatch({
                            type: "SELECT_ROUTINE",
                            payload: { routine, nameMap: state.exerciseNameMap },
                        })
                    }
                />
            );

        case "iron_mines":
            console.log("[ViewRouter] Mounting IronMines. ActiveQuest Exercises:", state.activeQuest?.length);
            return (
                <IronMines
                    session={mapQuestToSession(state.activeQuest!, state.questTitle)}
                    onComplete={() => dispatch({ type: "COMPLETE_QUEST" })}
                    onExit={() => dispatch({ type: "ABORT_QUEST" })}
                    hrvBaseline={titanState?.hrvBaseline || userData?.hrv || 60}
                    userId={userData?.id}
                />
            );

        case "item_shop":
        case "marketplace":
            return (
                <Marketplace
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                />
            );

        case "social_hub":
            return (
                <SocialHub
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                    currentUserId={userData?.id}
                />
            );

        case "quest_completion":
            return (
                <QuestCompletion
                    onSave={onSaveWorkout}
                    onCancel={() => dispatch({ type: "ABORT_QUEST" })}
                />
            );

        case "forge":
            return (
                <TheForge
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                />
            );

        case "armory":
            return <EquipmentArmory />;

        case "bestiary":
            return (
                <Bestiary
                    userLevel={state.level}
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                />
            );

        case "world_map":
            return (
                <WorldMap
                    userLevel={state.level}
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                    onEnterCombat={(bossId) =>
                        dispatch({ type: "START_COMBAT", payload: bossId })
                    }
                />
            );

        case "grimoire":
            return (
                <Grimoire
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                />
            );

        case "guild_hall":
            return (
                <ViewWithCloseButton
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                >
                    <GuildHall userId={userData?.id ?? ""} />
                </ViewWithCloseButton>
            );

        case "strength_log":
            return (
                <ViewWithCloseButton
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                >
                    <StrengthContainer userId={userData?.id ?? ""} />
                </ViewWithCloseButton>
            );

        case "program_builder":
            return (
                <ViewWithCloseButton
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                >
                    <ProgramBuilder userId={userData?.id ?? ""} />
                </ViewWithCloseButton>
            );

        case "trophy_room":
            return (
                <ViewWithCloseButton
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                >
                    <TrophyRoom userId={userData?.id ?? ""} />
                </ViewWithCloseButton>
            );

        case "arena":
            return (
                <Arena
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                />
            );

        case "combat_arena":
            return state.activeBossId ? (
                <CombatArena
                    bossId={state.activeBossId}
                    onClose={() => dispatch({ type: "SET_VIEW", payload: "world_map" })}
                />
            ) : (
                <Citadel
                    state={state}
                    dispatch={dispatch}
                    pocketCastsConnected={pocketCastsConnected}
                    titanState={titanState}
                    liteMode={liteMode}
                />
            );

        case "cardio_studio":
            return (
                <CardioStudio
                    mode={state.cardioMode || "cycling"}
                    activeWorkout={state.activeWorkout}
                    userProfile={{
                        ftpCycle: userData?.ftpCycle || 200,
                        ftpRun: userData?.ftpRun || 250,
                    }}
                    onClose={() => dispatch({ type: "RETURN_TO_PREVIOUS" })}
                    userId={userData?.id}
                    activeDuel={state.activeDuel}
                    pocketCastsConnected={pocketCastsConnected}
                    streak={titanState?.streak || userData?.loginStreak || 0}
                    maxHr={userData?.maxHr || 190}
                />
            );

        case "strava_upload":
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <StravaUpload />
                    <button
                        onClick={() => dispatch({ type: "SET_VIEW", payload: "citadel" })}
                        className="mt-8 text-slate-400 hover:text-white transition-colors"
                    >
                        Return to Citadel
                    </button>
                </div>
            );

        default:
            return (
                <Citadel state={state} dispatch={dispatch} titanState={titanState} />
            );
    }
};

/**
 * Reusable wrapper for views that just need a close button.
 */
const ViewWithCloseButton: React.FC<{
    children: React.ReactNode;
    onClose: () => void;
}> = ({ children, onClose }) => (
    <div className="p-4 relative min-h-screen">
        <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold"
        >
            Close
        </button>
        {children}
    </div>
);

export default ViewRouter;

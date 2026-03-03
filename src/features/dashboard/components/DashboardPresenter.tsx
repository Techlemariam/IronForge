"use client";

import React from "react";
import { PwaInstallBanner } from "@/components/ui/PwaInstallBanner";
import Link from "next/link";
import { Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { PersistentHeader } from "@/components/core/PersistentHeader";
import { CoachToggle } from "./CoachToggle";
import { ViewRouter } from "./ViewRouter";
import { CodexLoader } from "./SecondaryViews";
import GeminiLiveCoach from "@/features/training/components/GeminiLiveCoach";
import { OracleChat } from "@/features/oracle/components/OracleChat";
import { TvHud } from "@/features/dashboard/components/TvHud";

import {
    DashboardState,
    DashboardAction,
} from "../types";

interface DashboardPresenterProps {
    state: DashboardState;
    dispatch: React.Dispatch<DashboardAction>;
    userData: any;
    titanState?: any;
    pocketCastsConnected: boolean;
    liteMode?: boolean;
    hasCompletedOnboarding: boolean;
    leaderboardData: any[];
    platform: string;
    onSaveWorkout: (isPrivate: boolean) => Promise<void>;
    onToggleCoach: () => void;
    effectiveStats?: import("@/services/game/TitanService").EffectiveTitanStats;
    activeModifiers?: import("@/features/neural-lattice/types").StatModifier[];
    attributes?: import("@/services/game/TitanService").TitanAttributes;
}

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

export const DashboardPresenter: React.FC<DashboardPresenterProps> = (props) => {
    const {
        state,
        dispatch,
        userData,
        titanState,
        pocketCastsConnected,
        liteMode,
        platform,
        leaderboardData,
        onSaveWorkout,
        onToggleCoach,
        effectiveStats,
        activeModifiers,
        attributes,
    } = props;

    const viewRouterProps = {
        state,
        dispatch,
        userData,
        titanState,
        pocketCastsConnected,
        liteMode,
        onSaveWorkout,
        leaderboardEntries: leaderboardData,
        effectiveStats,
        activeModifiers,
        attributes: props.attributes,
    };

    if (state.isCodexLoading) return <main id="codex-loader"><CodexLoader /></main>;

    return (
        <div id="app-wrapper" className="bg-slate-950 min-h-screen bg-noise relative overflow-hidden">
            {/* Titan Scanline System */}
            <div className="scanline-overlay" />

            <PwaInstallBanner />

            {platform === "tv" && (
                <TvHud
                    questTitle={state.questTitle}
                    heartRate={state.wellnessData?.hrv}
                    bossName={state.activeBossId || undefined}
                />
            )}

            <Link
                href="/settings"
                className="fixed top-6 right-6 z-50 text-slate-500 hover:text-emerald-400 transition-all p-2 hover:rotate-90 duration-500 border border-transparent hover:border-emerald-500/20 bg-black/20 backdrop-blur-md"
                aria-label="Open Settings"
            >
                <Settings size={20} />
            </Link>

            <PersistentHeader
                level={state.level}
                xp={state.totalExperience}
                gold={userData?.gold || 0}
                faction={state.faction}
                powerRating={titanState?.powerRating || 0}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <AnimatePresence mode="wait">
                    <AnimatedViewWrapper viewKey={state.currentView}>
                        <main id="main-content" role="main" className="mechanical-panel p-1">
                            {/* Inner Bezel */}
                            <div className="border border-slate-900 bg-slate-900/40 p-4 sm:p-6 min-h-[70vh]">
                                <ViewRouter {...viewRouterProps} />
                            </div>
                        </main>
                    </AnimatedViewWrapper>
                </AnimatePresence>
            </div>

            <CoachToggle onClick={onToggleCoach} />
            <GeminiLiveCoach
                isOpen={state.isCoachOpen}
                onClose={onToggleCoach}
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

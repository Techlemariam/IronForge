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
        onSaveWorkout,
        onToggleCoach,
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
    };

    if (state.isCodexLoading) return <main id="codex-loader"><CodexLoader /></main>;

    return (
        <div id="main-content" className="bg-forge-900 min-h-screen bg-noise">
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-5" />

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

            {/* Onboarding Logic would normally go here, but we pass it as a component if needed or handle it specifically */}
            {/* For Storybook compatibility, we might want to mock the onboarding component too */}

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

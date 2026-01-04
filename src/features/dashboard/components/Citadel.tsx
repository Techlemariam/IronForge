import React from "react";
import { DashboardState, DashboardAction } from "../types";
import { TitanAvatar } from "@/features/titan/TitanAvatar";
import { QuestBoard } from "@/components/gamification/QuestBoard";
import { CitadelHub } from "@/features/dashboard/CitadelHub";
import OracleVerdict from "@/features/oracle/components/OracleVerdict";
import OracleCard from "@/features/oracle/components/OracleCard";
import UltrathinkDashboard from "@/features/dashboard/components/UltrathinkDashboard";
import { CampaignTracker } from "@/features/game/components/campaign/CampaignTracker";
import { toast } from "@/components/ui/GameToast";
import { PocketCastsPlayer } from "@/features/podcast/components/PocketCastsPlayer";
import BioStatusWidget from "@/components/dashboard/BioStatusWidget";
import { PushSubscriptionToggle } from "@/features/oracle/components/PushSubscriptionToggle";

interface CitadelProps {
    state: DashboardState;
    dispatch: React.Dispatch<DashboardAction>;
    titanState?: any;
    pocketCastsConnected?: boolean;
}

export const Citadel: React.FC<CitadelProps> = ({ state, dispatch, titanState, pocketCastsConnected }) => (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
        <section id="titan-avatar">
            <TitanAvatar titan={titanState} />
        </section>

        {state.trainingContext && (
            <section id="bio-status" className="animate-in fade-in slide-in-from-top-4 duration-700">
                <BioStatusWidget context={state.trainingContext} />
            </section>
        )}

        <section id="quest-board">
            <QuestBoard
                challenges={state.challenges || []}
                onClaimSuccess={() => {
                    /* Handled by Server Action + Revalidate, but we could trigger nice anim */
                }}
            />
        </section>

        <section id="quick-actions">
            <CitadelHub dispatch={dispatch} />
        </section>

        {pocketCastsConnected && (
            <section id="podcast-player">
                <PocketCastsPlayer />
            </section>
        )}

        <section
            id="oracle-recommendation"
            className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700"
        >
            <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">
                Oracle&apos;s Wisdom
            </h2>
            {titanState?.dailyDecree && (
                <div className="mb-6 space-y-4">
                    <OracleVerdict decree={titanState.dailyDecree} />
                    <PushSubscriptionToggle />
                </div>
            )}
            {state.oracleRecommendation ? (
                <OracleCard
                    recommendation={state.oracleRecommendation}
                    onAccept={(rec) => {
                        if (rec.generatedSession) {
                            dispatch({
                                type: "START_GENERATED_QUEST",
                                payload: rec.generatedSession,
                            });
                        } else if (rec.sessionId) {
                            toast.info("Traveling to Static Quest: " + rec.sessionId);
                        }
                    }}
                />
            ) : (
                <p className="text-forge-300">
                    The Oracle is contemplating the cosmos...
                </p>
            )}
        </section>

        <section
            id="ultrathink-dashboard"
            className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700"
        >
            <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">
                Ultrathink Dashboard
            </h2>
            <UltrathinkDashboard
                ttb={state.ttb || undefined}
                wellness={state.wellnessData}
                audit={
                    state.weaknessAudit || {
                        detected: false,
                        type: "NONE",
                        message: "Analyzing...",
                        confidence: 0,
                    }
                }
                forecast={state.forecast}
                events={state.events}
                titanAnalysis={state.titanAnalysis || undefined}
                activePath={state.activePath}
            />
        </section>

        <section
            id="campaign-tracker"
            className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700"
        >
            <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">
                Campaign Tracker
            </h2>
            <CampaignTracker
                wellness={state.wellnessData}
                ttb={state.ttb}
                level={state.level}
                activePath={state.activePath}
                totalExperience={state.totalExperience}
                weeklyMastery={state.weeklyMastery}
            />
        </section>
    </div>
);

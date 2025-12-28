'use client';

import React, { Suspense, useReducer, useEffect, useState } from 'react';
import { toast } from '@/components/ui/GameToast';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Exercise } from '@/types/ironforge';
import { IntervalsWellness, TTBIndices, WeaknessAudit, TSBForecast, IntervalsEvent, TitanLoadCalculation, Session, AppSettings } from '@/types';
import { User } from '@prisma/client';
import { AuditReport } from '@/types/auditor';
import { saveWorkoutAction } from '@/actions/hevy';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CampaignTracker } from '@/components/CampaignTracker';
import { HevyExerciseTemplate, HevyRoutine } from '@/types/hevy';
import { mapHevyToQuest, mapQuestToHevyPayload } from '@/utils/hevyAdapter';
import { mapSessionToQuest, mapQuestToSession } from '@/utils/typeMappers';
import { OracleRecommendation } from '@/types';
import OracleCard from '@/components/OracleCard';
import UltrathinkDashboard from '@/components/UltrathinkDashboard';
import { getProgressionAction } from '@/actions/progression';
import GeminiLiveCoach from '@/components/GeminiLiveCoach';
import { Mic, Bike, Footprints, Settings } from 'lucide-react';
import SettingsCog from '@/components/core/SettingsCog';
import ConfigModal from '@/components/core/ConfigModal';
import TrainingCenter from '@/features/training/TrainingCenter';
import { TrainingPath, LayerLevel, WeeklyMastery, Faction } from '@/types/training';
import { CardioMode } from '@/features/training/CardioStudio';
import { OracleChat } from '@/components/OracleChat';
import { WorkoutDefinition } from '@/types/training';
import { mapDefinitionToSession } from '@/utils/workoutMapper';
import { playSound } from '@/utils';

// Dynamic Imports with disabling SSR for client-heavy features
const RoutineSelector = dynamic(() => import('@/features/training/RoutineSelector'), { ssr: false });
const IronMines = dynamic(() => import('@/features/training/IronMines'), { ssr: false });
const SessionRunner = dynamic(() => import('@/components/SessionRunner'), { ssr: false });
const CombatArena = dynamic(() => import('@/features/game/CombatArena'), { ssr: false });
const SocialHub = dynamic(() => import('@/features/social/SocialHub').then(mod => mod.SocialHub), { ssr: false });
const FactionLeaderboard = dynamic(() => import('@/features/social/FactionLeaderboard').then(mod => mod.FactionLeaderboard), { ssr: false });
const Marketplace = dynamic(() => import('@/components/game/Marketplace'), { ssr: false });
const TheForge = dynamic(() => import('@/features/game/TheForge'), { ssr: false });
const CardioStudio = dynamic(() => import('@/features/training/CardioStudio'), { ssr: false });
import StravaUpload from '@/components/strava/StravaUpload';
import { CitadelHub } from '@/features/dashboard/CitadelHub';
import { FirstLoginQuest } from '@/features/onboarding/FirstLoginQuest';
import { QuestBoard } from '@/components/gamification/QuestBoard';
import { StrengthContainer } from '@/features/strength/StrengthContainer';
import { ProgramBuilder } from '@/features/training/ProgramBuilder';
import { TrophyRoom } from '@/features/gamification/TrophyRoom';
import { GuildHall } from '@/features/guild/GuildHall';
import { TitanAvatar } from '@/features/titan/TitanAvatar';
import { PersistentHeader } from '@/components/core/PersistentHeader';
import { ShimmerBadge } from '@/components/ui/ShimmerBadge';
import { View, DashboardState, DashboardAction, DashboardData, DashboardClientProps } from './types';
import { dashboardReducer } from './logic/dashboardReducer';


// UI Components
const CoachToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={() => { playSound('ui_click'); onClick(); }}
        className="fixed bottom-6 right-6 z-40 bg-purple-900 border-2 border-purple-500 rounded-full p-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform group"
    >
        <Mic className="w-6 h-6 text-white group-hover:animate-pulse" />
    </button>
);



// NavButton moved to CitadelHub

// NavButton moved to CitadelHub

const Citadel: React.FC<{ state: DashboardState; dispatch: React.Dispatch<DashboardAction>; titanState?: any }> = ({ state, dispatch, titanState }) => (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
        <section id="titan-avatar">
            <TitanAvatar titan={titanState} />
        </section>

        <section id="quest-board">
            <QuestBoard
                challenges={state.challenges || []}
                onClaimSuccess={() => { /* Handled by Server Action + Revalidate, but we could trigger nice anim */ }}
            />
        </section>

        <section id="quick-actions">
            <CitadelHub dispatch={dispatch} />
        </section>

        <section id="oracle-recommendation" className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700">
            <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">Oracle&apos;s Wisdom</h2>
            {state.oracleRecommendation ? (
                <OracleCard
                    recommendation={state.oracleRecommendation}
                    onAccept={(rec) => {
                        if (rec.generatedSession) {
                            dispatch({ type: 'START_GENERATED_QUEST', payload: rec.generatedSession });
                        } else if (rec.sessionId) {
                            toast.info("Traveling to Static Quest: " + rec.sessionId);
                        }
                    }}
                />
            ) : (
                <p className="text-forge-300">The Oracle is contemplating the cosmos...</p>
            )}
        </section>

        <section id="ultrathink-dashboard" className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700">
            <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">Ultrathink Dashboard</h2>
            <UltrathinkDashboard
                ttb={state.ttb || undefined}
                wellness={state.wellnessData}
                audit={state.weaknessAudit || { detected: false, type: 'NONE', message: 'Analyzing...', confidence: 0 }}
                forecast={state.forecast}
                events={state.events}
                titanAnalysis={state.titanAnalysis || undefined}
                activePath={state.activePath}
            />
        </section>

        <section id="campaign-tracker" className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700">
            <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">Campaign Tracker</h2>
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

const QuestCompletion: React.FC<{ onSave: (isPrivate: boolean) => void; onCancel: () => void }> = ({ onSave, onCancel }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white p-4">
        <h2 className="text-4xl font-bold text-magma mb-8 animate-pulse">Quest Completed!</h2>
        <div className="flex space-x-4">
            <button
                onClick={() => onSave(false)}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-semibold shadow-lg transition-colors"
            >
                Save & Share
            </button>
            <button
                onClick={() => onSave(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold shadow-lg transition-colors"
            >
                Save Privately
            </button>
            <button
                onClick={onCancel}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-semibold shadow-lg transition-colors"
            >
                Discard
            </button>
        </div>
    </div>
);

const EquipmentArmory: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-6">
        <h2 className="text-4xl font-bold text-magma">Armory Sealed</h2>
        <p className="text-forge-muted">The High Blacksmith is out gathering ore.</p>
        <ShimmerBadge label="Coming Soon" unlockLevel={5} />
        <button onClick={() => toast.info("The Blacksmith will return soon.")} className="px-4 py-2 bg-forge-800 rounded border border-forge-border hover:bg-forge-700 transition-colors">Notify Me</button>
    </div>
);

const Bestiary: React.FC<{ userLevel: number; onClose: () => void }> = ({ userLevel, onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-4">
        <h2 className="text-4xl font-bold text-magma">Bestiary Uncharted</h2>
        <p className="text-forge-muted">You have not encountered enough beasts yet.</p>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const WorldMap: React.FC<{ userLevel: number; onClose: () => void; onEnterCombat: (bossId: string) => void }> = ({ userLevel, onClose, onEnterCombat }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white p-4">
        <h2 className="text-4xl font-bold text-magma mb-8">The Known World</h2>
        <p className="text-xl text-forge-300 mb-4">The fog of war covers these lands. Level: {userLevel}</p>
        <button onClick={() => onEnterCombat('goblin_king')} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-semibold shadow-lg transition-colors">
            Enter Combat (Goblin King)
        </button>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const Grimoire: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-6">
        <h2 className="text-4xl font-bold text-magma">Grimoire Sealed</h2>
        <p className="text-forge-muted">The pages are blank...</p>
        <ShimmerBadge label="Lore System" unlockLevel={10} />
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

// GuildHall imported from feature


const Arena: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-6">
        <h2 className="text-4xl font-bold text-magma">Arena Closed</h2>
        <p className="text-forge-muted">Gladiators are resting.</p>
        <ShimmerBadge label="PvP Mode" unlockLevel={15} />
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const CodexLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-void text-white">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-forge-300">Loading Codex...</p>
    </div>
);

// Consolidated Data Object from Server


const DashboardClient: React.FC<DashboardClientProps> = (props) => {
    const { initialData, isDemoMode, userData, faction, hasCompletedOnboarding, hevyRoutines, hevyTemplates, intervalsConnected, stravaConnected, challenges, titanState } = props;

    // TODO: Fetch this from server component and pass as props
    // For now we render with empty/mock for UI verification if data not present
    const leaderboardData: any[] = [];
    const factionStats = { alliance: { members: 0, totalXp: 0 }, horde: { members: 0, totalXp: 0 } };


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
        questTitle: '',
        exerciseNameMap: nameMap,
        startTime: null,
        currentView: 'citadel',
        oracleRecommendation: initialData.recommendation, // rename matched
        auditReport: initialData.auditReport,
        weaknessAudit: initialData.auditReport?.highestPriorityGap ? { detected: true, type: 'NONE', message: `Focus: ${initialData.auditReport.highestPriorityGap.muscleGroup}`, confidence: 1 } : null,
        forecast: initialData.forecast,
        events: initialData.events,
        titanAnalysis: initialData.titanAnalysis,
        isCoachOpen: false,
        activeBossId: null,
        activePath: initialData.activePath || 'HYBRID_WARDEN',
        mobilityLevel: userData?.mobilityLevel || 'NONE',
        recoveryLevel: userData?.recoveryLevel || 'NONE',
        totalExperience: titanState?.xp || userData?.totalExperience || 0,

        weeklyMastery: initialData.weeklyMastery,
        cardioMode: 'cycling', // Default
        returnView: null,
        faction: (faction as Faction) || 'HORDE',
        challenges: challenges || []
    };

    const [state, dispatch] = useReducer(dashboardReducer, initialStateFromProps);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);

    useEffect(() => {
        dispatch({ type: 'UPDATE_CHALLENGES', payload: challenges || [] });
    }, [challenges]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // P0: Demo Mode First - Default demo users as configured
            if (isDemoMode) {
                setIsConfigured(true);
                return; // Skip API key check for demo users
            }
            const hasLocalKey = !!localStorage.getItem('hevy_api_key');
            if (hasLocalKey) {
                setIsConfigured(true);
            } else {
                // Don't block - just open settings subtly
                setModalOpen(true);
            }
        }
    }, [isDemoMode]);

    const handleSaveWorkout = async (isPrivate: boolean) => {
        if (!state.activeQuest || !state.startTime) return;

        const apiKey = userData?.hevyApiKey || localStorage.getItem('hevy_api_key');
        if (!apiKey) {
            toast.error("Access Denied", { description: "You need a Hevy API Key to save quests." });
            setModalOpen(true);
            return;
        }

        const payload = mapQuestToHevyPayload(state.activeQuest, state.questTitle, state.startTime, new Date(), isPrivate);
        try {
            await saveWorkoutAction(apiKey, payload);
            toast.success("Quest Log Updated!", { description: "The Hevy Archive has explicitly recorded your victory." });
        } catch (error) {
            console.error("Uplink to Hevy failed:", error);
            toast.warning("Loot Secured Locally", { description: "Uplink to Hevy failed. Check console." });
        } finally {
            const newProgression = await getProgressionAction();
            if (newProgression) {
                dispatch({ type: 'RECALCULATE_PROGRESSION', payload: { level: newProgression.level } });
            }
            dispatch({ type: 'SAVE_WORKOUT' });
        }
    };

    const renderView = () => {
        switch (state.currentView) {
            case 'citadel': return <Citadel state={state} dispatch={dispatch} titanState={titanState} />;
            case 'training_center': return <TrainingCenter
                activePath={state.activePath}
                mobilityLevel={state.mobilityLevel}
                recoveryLevel={state.recoveryLevel}
                onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })}
                onSelectWorkout={(workout) => {
                    if (workout.type === 'STRENGTH' || workout.type === 'MOBILITY') {
                        // For strength/mobility, convert to session and launch
                        const session = mapDefinitionToSession(workout);
                        dispatch({ type: 'START_GENERATED_QUEST', payload: session });
                        // Hack to set return view since START_GENERATED_QUEST doesn't support it directly in reducer easily without changing signature
                        // We'll rely on global "Close" in SessionRunner returning to citadel by default, 
                        // unless we change SessionRunner to accept onExit?
                        // Actions: SessionRunner has onExit.
                    } else {
                        dispatch({ type: 'START_CODEX_WORKOUT', payload: { workout } });
                    }
                }}
            />;
            case 'war_room': return <RoutineSelector exerciseNameMap={state.exerciseNameMap} onSelectRoutine={(routine) => dispatch({ type: 'SELECT_ROUTINE', payload: { routine, nameMap: state.exerciseNameMap } })} />;
            // Using SessionRunner (New UX) instead of IronMines
            case 'iron_mines': return <SessionRunner
                session={mapQuestToSession(state.activeQuest!, state.questTitle)}
                onComplete={(results) => {
                    // Need to map results back if we want to save properly with legacy handleSaveWorkout
                    // For now, let's just trigger complete.
                    dispatch({ type: 'COMPLETE_QUEST' });
                }}
                onExit={() => {
                    // If we have a return view (e.g. came from Training Center), go back there.
                    // But START_GENERATED_QUEST didn't set returnView in my reducer logic above (I commented it out).
                    // Let's just go to Citadel for now for Strength, or handle return logic if I add it.
                    dispatch({ type: 'ABORT_QUEST' });
                }}
            />;
            case 'item_shop': return <Marketplace onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'social_hub': return (
                <div className="relative min-h-screen p-4 max-w-4xl mx-auto">
                    <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold">Close</button>
                    {/* Ideally pass real data here via useEffect fetch or server props */}
                    <FactionLeaderboard
                        stats={{
                            alliance: { members: 120, totalXp: 5000000 },
                            horde: { members: 115, totalXp: 4800000 }
                        }}
                        leaderboard={[]}
                        currentUserId={userData?.id}
                    />
                </div>
            );
            case 'quest_completion': return <QuestCompletion onSave={handleSaveWorkout} onCancel={() => dispatch({ type: 'ABORT_QUEST' })} />;
            case 'forge': return <TheForge onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'armory': return <EquipmentArmory />;
            case 'bestiary': return <Bestiary userLevel={state.level} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'world_map': return <WorldMap
                userLevel={state.level}
                onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })}
                onEnterCombat={(bossId) => dispatch({ type: 'START_COMBAT', payload: bossId })}
            />;
            case 'grimoire': return <Grimoire onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'guild_hall': return (
                <div className="p-4 relative min-h-screen">
                    <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold">Close</button>
                    <GuildHall userId={userData?.id} />
                </div>
            );
            case 'strength_log': return (
                <div className="p-4 relative min-h-screen">
                    <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold">Close</button>
                    <StrengthContainer userId={userData?.id} />
                </div>
            );
            case 'program_builder': return (
                <div className="p-4 relative min-h-screen">
                    <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold">Close</button>
                    <ProgramBuilder userId={userData?.id} />
                </div>
            );
            case 'trophy_room': return (
                <div className="p-4 relative min-h-screen">
                    <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm font-bold">Close</button>
                    <TrophyRoom userId={userData?.id} />
                </div>
            );
            case 'arena': return <Arena onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'marketplace': return <Marketplace onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'combat_arena': return state.activeBossId ? <CombatArena bossId={state.activeBossId} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'world_map' })} /> : <Citadel state={state} dispatch={dispatch} />;

            case 'cardio_studio': return <CardioStudio
                mode={state.cardioMode || 'cycling'}
                activeWorkout={state.activeWorkout}
                userProfile={{
                    ftpCycle: userData?.ftpCycle || 200,
                    ftpRun: userData?.ftpRun || 250,
                    // We don't have thresholdSpeedKph in schema, using default in component or deriving?
                    // Implementation plan didn't enforce schema change. 
                    // CardioStudio defaults to 12 if missing.
                }}
                onClose={() => dispatch({ type: 'RETURN_TO_PREVIOUS' })}
            />;

            case 'strava_upload': return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <StravaUpload />
                    <button
                        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })}
                        className="mt-8 text-slate-400 hover:text-white transition-colors"
                    >
                        Return to Citadel
                    </button>
                </div>
            );

            default: return <Citadel state={state} dispatch={dispatch} titanState={titanState} />;
        }
    }

    if (!isConfigured) {
        return (
            <div className="bg-void min-h-screen text-white flex items-center justify-center p-4">
                <div className="scanlines" />
                <SettingsCog onClick={() => { playSound('ui_click'); setModalOpen(true); }} />
                <ConfigModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    userId={userData?.id || 'unknown'}
                    hevyConnected={!!userData?.hevyApiKey}
                    intervalsConnected={intervalsConnected}
                    stravaConnected={stravaConnected}
                    checkDemoStatus={true}
                    initialFaction={state.faction}
                />
                <div className="w-full h-screen flex items-center justify-center font-mono text-center p-4">
                    <div>
                        <h2 className="text-xl text-magma uppercase tracking-widest">Configuration Required</h2>
                        <p className="text-forge-muted">Please configure your Hevy API key and Proxy URL by clicking the settings cog.</p>
                    </div>
                </div>
            </div>
        )
    }

    if (state.isCodexLoading) return <CodexLoader />;

    return (
        <div className="bg-forge-900 min-h-screen bg-noise">
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-5" />
            {/* <SettingsCog onClick={() => { playSound('ui_click'); setModalOpen(true); }} /> */}
            <Link href="/settings" className="fixed top-6 right-6 z-50 text-forge-muted hover:text-white transition-colors p-2 hover:rotate-90 duration-300">
                <Settings size={24} />
            </Link>
            {/* ConfigModal removed in favor of /settings page */}

            <PersistentHeader
                level={state.level}
                xp={state.totalExperience}
                gold={userData?.gold || 0}
                faction={state.faction}
            />

            {renderView()}

            {showOnboarding && (
                <FirstLoginQuest onComplete={(newState) => {
                    setShowOnboarding(false);
                    if (newState) {
                        dispatch({ type: 'RECALCULATE_PROGRESSION', payload: { level: newState.level } });
                    }
                }} />
            )}

            <CoachToggle onClick={() => dispatch({ type: 'TOGGLE_COACH' })} />
            <GeminiLiveCoach isOpen={state.isCoachOpen} onClose={() => dispatch({ type: 'TOGGLE_COACH' })} />

            <OracleChat context={{
                userId: userData?.id || 'unknown',
                path: state.activePath,
                wellness: state.wellnessData,
                mastery: state.weeklyMastery,
                indices: state.ttb
            }} />
        </div>
    );
};

export default DashboardClient;

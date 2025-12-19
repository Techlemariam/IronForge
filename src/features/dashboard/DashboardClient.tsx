'use client';

import React, { Suspense, useReducer, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Exercise } from '@/types/ironforge';
import { IntervalsWellness, TTBIndices, WeaknessAudit, TSBForecast, IntervalsEvent, TitanLoadCalculation, Session, AppSettings } from '@/types';
import { AuditReport } from '@/types/auditor';
import { saveWorkoutToHevy } from '@/services/hevy';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CampaignTracker } from '@/components/CampaignTracker';
import { HevyExerciseTemplate, HevyRoutine } from '@/types/hevy';
import { mapHevyToQuest, mapQuestToHevyPayload } from '@/utils/hevyAdapter';
import { mapSessionToQuest } from '@/utils/typeMappers';
import { OracleRecommendation } from '@/types';
import OracleCard from '@/components/OracleCard';
import UltrathinkDashboard from '@/components/UltrathinkDashboard';
import { ProgressionService } from '@/services/progression';
import GeminiLiveCoach from '@/components/GeminiLiveCoach';
import { Mic } from 'lucide-react';
import SettingsCog from '@/components/core/SettingsCog';
import ConfigModal from '@/components/core/ConfigModal';

// Dynamic Imports with disabling SSR for client-heavy features
const RoutineSelector = dynamic(() => import('@/features/training/RoutineSelector'), { ssr: false });
const IronMines = dynamic(() => import('@/features/training/IronMines'), { ssr: false });
const QuestCompletion = dynamic(() => import('@/features/training/components/QuestCompletion'), { ssr: false });
const EquipmentArmory = dynamic(() => import('@/components/settings/EquipmentArmory'), { ssr: false });
const Bestiary = dynamic(() => import('@/components/game/Bestiary'), { ssr: false });
const WorldMap = dynamic(() => import('@/components/game/WorldMap'), { ssr: false });
const Grimoire = dynamic(() => import('@/components/game/Grimoire'), { ssr: false });
const GuildHall = dynamic(() => import('@/features/game/GuildHall'), { ssr: false });
const Arena = dynamic(() => import('@/components/game/Arena'), { ssr: false });
const Marketplace = dynamic(() => import('@/components/game/Marketplace'), { ssr: false });

// UI Components
const CoachToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-40 bg-purple-900 border-2 border-purple-500 rounded-full p-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform group"
    >
        <Mic className="w-6 h-6 text-white group-hover:animate-pulse" />
    </button>
);

type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion' | 'armory' | 'bestiary' | 'world_map' | 'grimoire' | 'guild_hall' | 'arena' | 'marketplace';

interface DashboardState {
    isCodexLoading: boolean;
    wellnessData: IntervalsWellness | null;
    ttb: TTBIndices | null;
    level: number;
    activeQuest: Exercise[] | null;
    questTitle: string;
    exerciseNameMap: Map<string, string>;
    startTime: Date | null;
    currentView: View;
    oracleRecommendation: OracleRecommendation | null;
    auditReport: AuditReport | null;
    // Computed props for UltrathinkDashboard
    weaknessAudit: WeaknessAudit | null;
    forecast: TSBForecast[];
    events: IntervalsEvent[];
    titanAnalysis: TitanLoadCalculation | null;
    isCoachOpen: boolean;
}

type DashboardAction =
    | { type: 'INITIAL_DATA_LOAD_START' }
    | { type: 'INITIAL_DATA_LOAD_SUCCESS'; payload: { nameMap: Map<string, string>, ttb: TTBIndices, wellness: IntervalsWellness, level: number, auditReport: AuditReport, oracleRec: OracleRecommendation, weaknessAudit: WeaknessAudit, forecast: TSBForecast[], events: IntervalsEvent[], titanAnalysis: TitanLoadCalculation | null } }
    | { type: 'INITIAL_DATA_LOAD_FAILURE' }
    | { type: 'SELECT_ROUTINE'; payload: { routine: HevyRoutine, nameMap: Map<string, string> } }
    | { type: 'COMPLETE_QUEST' }
    | { type: 'SAVE_WORKOUT' }
    | { type: 'ABORT_QUEST' }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'START_GENERATED_QUEST'; payload: Session }
    | { type: 'RECALCULATE_PROGRESSION'; payload: { level: number } }
    | { type: 'TOGGLE_COACH' };

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
    switch (action.type) {
        case 'INITIAL_DATA_LOAD_START': return { ...state, isCodexLoading: true };
        case 'INITIAL_DATA_LOAD_SUCCESS': return {
            ...state,
            isCodexLoading: false,
            exerciseNameMap: action.payload.nameMap,
            ttb: action.payload.ttb,
            wellnessData: action.payload.wellness,
            level: action.payload.level,
            auditReport: action.payload.auditReport,
            oracleRecommendation: action.payload.oracleRec,
            weaknessAudit: action.payload.weaknessAudit,
            forecast: action.payload.forecast,
            events: action.payload.events,
            titanAnalysis: action.payload.titanAnalysis
        };
        case 'INITIAL_DATA_LOAD_FAILURE': return { ...state, isCodexLoading: false };
        case 'SELECT_ROUTINE':
            return {
                ...state,
                questTitle: action.payload.routine.title,
                activeQuest: mapHevyToQuest(action.payload.routine, action.payload.nameMap),
                startTime: new Date(),
                currentView: 'iron_mines',
            };
        case 'COMPLETE_QUEST': return { ...state, currentView: 'quest_completion' };
        case 'SAVE_WORKOUT':
        case 'ABORT_QUEST':
            return { ...state, activeQuest: null, questTitle: '', startTime: null, currentView: 'citadel' };
        case 'SET_VIEW': return { ...state, currentView: action.payload };
        case 'START_GENERATED_QUEST':
            return {
                ...state,
                questTitle: action.payload.name,
                activeQuest: mapSessionToQuest(action.payload.blocks.flatMap(b => b.exercises || [])),
                startTime: new Date(),
                currentView: 'iron_mines',
            };
        case 'RECALCULATE_PROGRESSION':
            return { ...state, level: action.payload.level };
        case 'TOGGLE_COACH': return { ...state, isCoachOpen: !state.isCoachOpen };
        default: return state;
    }
};

const CodexLoader: React.FC = () => (
    <div className='flex flex-col items-center justify-center h-full text-center p-8 bg-forge-body w-full min-h-screen'>
        <LoadingSpinner />
        <p className='font-mono text-warrior-light mt-4 uppercase tracking-widest text-shadow-neon-cyan'>SYSTEM ONLINE</p>
        <p className='font-sans text-sm text-rarity-common'>Initializing Codex...</p>
    </div>
);

const NavButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <div
        className="bg-forge-800/50 border-2 border-forge-border rounded-lg shadow-lg aspect-square flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 hover:bg-forge-700 hover:border-rarity-common group"
        onClick={onClick}
    >
        <span className="font-serif uppercase text-warrior tracking-widest text-sm transition-all duration-200 group-hover:text-rarity-common group-hover:text-shadow-neon-cyan-sm">
            {children}
        </span>
    </div>
);

const Citadel: React.FC<{ state: DashboardState; dispatch: React.Dispatch<DashboardAction> }> = ({ state, dispatch }) => (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
        <section id="quick-actions">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'war_room' })}>New Quest</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'armory' })}>Armory</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'bestiary' })}>Bestiary</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'guild_hall' })}>Guild Hall</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'grimoire' })}>Grimoire</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'world_map' })}>World Map</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'arena' })}>Arena</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'marketplace' })}>Market</NavButton>
            </div>
        </section>

        {state.oracleRecommendation && (
            <section id="oracle-directive">
                <OracleCard
                    recommendation={state.oracleRecommendation}
                    onAccept={(rec) => {
                        if (rec.generatedSession) {
                            dispatch({ type: 'START_GENERATED_QUEST', payload: rec.generatedSession });
                        } else if (rec.sessionId) {
                            alert("Redirecting to Static Quest: " + rec.sessionId);
                        }
                    }}
                />
            </section>
        )}

        <section id="campaign-tracker">
            <CampaignTracker wellness={state.wellnessData} ttb={state.ttb} level={state.level} />
        </section>

        <section id="ultrathink-dashboard">
            {state.wellnessData && state.weaknessAudit ? (
                <UltrathinkDashboard
                    wellness={state.wellnessData}
                    audit={state.weaknessAudit}
                    forecast={state.forecast}
                    ttb={state.ttb || undefined}
                    events={state.events}
                    titanAnalysis={state.titanAnalysis || undefined}
                />
            ) : (
                <div className="p-4 text-center text-zinc-500">
                    Initializing Ultrathink Engine...
                </div>
            )}
        </section>
    </div>
);

export interface InitialDataProps {
    nameMap: Map<string, string>;
    ttb: TTBIndices;
    wellness: IntervalsWellness;
    level: number;
    auditReport: AuditReport;
    oracleRec: OracleRecommendation;
    weaknessAudit: WeaknessAudit;
    forecast: TSBForecast[];
    events: IntervalsEvent[];
    titanAnalysis: TitanLoadCalculation | null;
}

const DashboardClient: React.FC<InitialDataProps> = (initialData) => {
    // Initial state derived from props
    const initialStateFromProps: DashboardState = {
        isCodexLoading: false,
        wellnessData: initialData.wellness,
        ttb: initialData.ttb,
        level: initialData.level,
        activeQuest: null,
        questTitle: '',
        exerciseNameMap: initialData.nameMap,
        startTime: null,
        currentView: 'citadel',
        oracleRecommendation: initialData.oracleRec,
        auditReport: initialData.auditReport,
        weaknessAudit: initialData.weaknessAudit,
        forecast: initialData.forecast,
        events: initialData.events,
        titanAnalysis: initialData.titanAnalysis,
        isCoachOpen: false
    };

    const [state, dispatch] = useReducer(dashboardReducer, initialStateFromProps);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        // Check if API key and URL are set
        if (typeof window !== 'undefined') {
            const apiKey = localStorage.getItem('hevy_api_key');
            if (apiKey) {
                setIsConfigured(true);
            } else {
                setModalOpen(true);
            }
        }
    }, []);

    const handleSaveWorkout = async (isPrivate: boolean) => {
        if (!state.activeQuest || !state.startTime) return;
        const payload = mapQuestToHevyPayload(state.activeQuest, state.questTitle, state.startTime, new Date(), isPrivate);
        try {
            await saveWorkoutToHevy(payload);
            alert("VICTORY! The Archive (Hevy) has been updated.");
        } catch (error) {
            console.error("Uplink to Hevy failed:", error);
            alert("WARNING: Loot secured locally, but Uplink to Hevy failed. Check console for details.");
        } finally {
            const newProgression = await ProgressionService.getProgressionState();
            dispatch({ type: 'RECALCULATE_PROGRESSION', payload: { level: newProgression.level } });
            dispatch({ type: 'SAVE_WORKOUT' });
        }
    };

    const renderView = () => {
        switch (state.currentView) {
            case 'citadel': return <Citadel state={state} dispatch={dispatch} />;
            case 'war_room': return <RoutineSelector onSelectRoutine={(routine) => dispatch({ type: 'SELECT_ROUTINE', payload: { routine, nameMap: state.exerciseNameMap } })} />;
            case 'iron_mines': return <IronMines initialData={state.activeQuest!} title={state.questTitle} onComplete={() => dispatch({ type: 'COMPLETE_QUEST' })} onAbort={() => dispatch({ type: 'ABORT_QUEST' })} />;
            case 'quest_completion': return <QuestCompletion onSave={handleSaveWorkout} onCancel={() => dispatch({ type: 'ABORT_QUEST' })} />;
            case 'armory': return <EquipmentArmory />;
            case 'bestiary': return <Bestiary userLevel={state.level} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'world_map': return <WorldMap userLevel={state.level} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'grimoire': return <Grimoire onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'guild_hall': return <GuildHall onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'arena': return <Arena onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'marketplace': return <Marketplace onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            default: return <Citadel state={state} dispatch={dispatch} />;
        }
    }

    if (!isConfigured) {
        return (
            <div className="bg-void min-h-screen text-white flex items-center justify-center p-4">
                <div className="scanlines" />
                <SettingsCog onClick={() => setModalOpen(true)} />
                <ConfigModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
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
            <SettingsCog onClick={() => setModalOpen(true)} />
            <ConfigModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
            {renderView()}

            <CoachToggle onClick={() => dispatch({ type: 'TOGGLE_COACH' })} />
            <GeminiLiveCoach isOpen={state.isCoachOpen} onClose={() => dispatch({ type: 'TOGGLE_COACH' })} />
        </div>
    );
};

export default DashboardClient;

'use client';

import React, { Suspense, useReducer, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Exercise } from '@/types/ironforge';
import { IntervalsWellness, TTBIndices, WeaknessAudit, TSBForecast, IntervalsEvent, TitanLoadCalculation, Session, AppSettings } from '@/types';
import { AuditReport } from '@/types/auditor';
import { saveWorkoutAction } from '@/actions/hevy';
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
import { Mic, Bike } from 'lucide-react';
import SettingsCog from '@/components/core/SettingsCog';
import ConfigModal from '@/components/core/ConfigModal';
import TrainingCenter from '@/features/training/TrainingCenter';
import { TrainingPath, LayerLevel, WeeklyMastery } from '@/types/training';

// Dynamic Imports with disabling SSR for client-heavy features
const RoutineSelector = dynamic(() => import('@/features/training/RoutineSelector'), { ssr: false });
const IronMines = dynamic(() => import('@/features/training/IronMines'), { ssr: false });
const CombatArena = dynamic(() => import('@/features/game/CombatArena'), { ssr: false });
const Marketplace = dynamic(() => import('@/components/game/Marketplace'), { ssr: false });
const TheForge = dynamic(() => import('@/features/game/TheForge'), { ssr: false });
const CyclingStudio = dynamic(() => import('@/features/training/CyclingStudio'), { ssr: false });

// UI Components
const CoachToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-40 bg-purple-900 border-2 border-purple-500 rounded-full p-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform group"
    >
        <Mic className="w-6 h-6 text-white group-hover:animate-pulse" />
    </button>
);

type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion' | 'armory' | 'bestiary' | 'world_map' | 'grimoire' | 'guild_hall' | 'arena' | 'marketplace' | 'combat_arena' | 'forge' | 'training_center' | 'cycling_studio';

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
    weaknessAudit: WeaknessAudit | null;
    forecast: TSBForecast[];
    events: IntervalsEvent[];
    titanAnalysis: TitanLoadCalculation | null;
    isCoachOpen: boolean;
    activeBossId: string | null;
    activePath: TrainingPath;
    mobilityLevel: LayerLevel;
    recoveryLevel: LayerLevel;
    totalExperience: number;
    weeklyMastery?: WeeklyMastery;
}

type DashboardAction =
    | { type: 'INITIAL_DATA_LOAD_START' }
    | { type: 'INITIAL_DATA_LOAD_SUCCESS'; payload: any }
    | { type: 'INITIAL_DATA_LOAD_FAILURE' }
    | { type: 'SELECT_ROUTINE'; payload: { routine: HevyRoutine, nameMap: Map<string, string> } }
    | { type: 'COMPLETE_QUEST' }
    | { type: 'SAVE_WORKOUT' }
    | { type: 'ABORT_QUEST' }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'START_COMBAT'; payload: string }
    | { type: 'START_GENERATED_QUEST'; payload: Session }
    | { type: 'RECALCULATE_PROGRESSION'; payload: { level: number } }
    | { type: 'TOGGLE_COACH' }
    | { type: 'UPDATE_PATH'; payload: TrainingPath };

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
        case 'START_COMBAT': return { ...state, currentView: 'combat_arena', activeBossId: action.payload };

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
        case 'UPDATE_PATH': return { ...state, activePath: action.payload };
        default: return state;
    }
};

const NavButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="relative flex items-center justify-center p-4 border border-forge-500 bg-forge-800 text-white font-bold uppercase tracking-wider text-sm rounded-lg shadow-lg hover:bg-forge-700 transition-all duration-200 overflow-hidden group"
    >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-forge-600 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-forge-400 rounded-lg transition-all duration-300"></div>
    </button>
);

const Citadel: React.FC<{ state: DashboardState; dispatch: React.Dispatch<DashboardAction> }> = ({ state, dispatch }) => (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
        <section id="quick-actions">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'war_room' })}>New Quest</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'training_center' })}>Training Path</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'forge' })}>The Forge</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'armory' })}>Armory</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'bestiary' })}>Bestiary</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'guild_hall' })}>Guild Hall</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'grimoire' })}>Grimoire</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'world_map' })}>World Map</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'arena' })}>Arena</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'marketplace' })}>Market</NavButton>
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'cycling_studio' })}><Bike className="w-4 h-4 inline mr-1" />Cycling</NavButton>
            </div>
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
                            alert("Redirecting to Static Quest: " + rec.sessionId);
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
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white">
        <h2 className="text-4xl font-bold text-magma">Armory Under Construction...</h2>
    </div>
);

const Bestiary: React.FC<{ userLevel: number; onClose: () => void }> = ({ userLevel, onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white">
        <h2 className="text-4xl font-bold text-magma">Bestiary Under Construction...</h2>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const WorldMap: React.FC<{ userLevel: number; onClose: () => void; onEnterCombat: (bossId: string) => void }> = ({ userLevel, onClose, onEnterCombat }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white p-4">
        <h2 className="text-4xl font-bold text-magma mb-8">World Map Under Construction...</h2>
        <p className="text-xl text-forge-300 mb-4">Your current level: {userLevel}</p>
        <button onClick={() => onEnterCombat('goblin_king')} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-semibold shadow-lg transition-colors">
            Enter Combat (Goblin King)
        </button>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const Grimoire: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white">
        <h2 className="text-4xl font-bold text-magma">Grimoire Under Construction...</h2>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const GuildHall: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white">
        <h2 className="text-4xl font-bold text-magma">Guild Hall Under Construction...</h2>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const Arena: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white">
        <h2 className="text-4xl font-bold text-magma">Arena Under Construction...</h2>
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded">Close</button>
    </div>
);

const CodexLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-void text-white">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-forge-300">Loading Codex...</p>
    </div>
);

export interface InitialDataProps {
    apiKey?: string | null;
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
    activePath?: TrainingPath;
    mobilityLevel?: LayerLevel;
    recoveryLevel?: LayerLevel;
    totalExperience: number;
    weeklyMastery?: WeeklyMastery;
}

const DashboardClient: React.FC<InitialDataProps> = (initialData) => {
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
        isCoachOpen: false,
        activeBossId: null,
        activePath: initialData.activePath || 'HYBRID_WARDEN',
        mobilityLevel: initialData.mobilityLevel || 'NONE',
        recoveryLevel: initialData.recoveryLevel || 'NONE',
        totalExperience: initialData.totalExperience,
        weeklyMastery: initialData.weeklyMastery
    };

    const [state, dispatch] = useReducer(dashboardReducer, initialStateFromProps);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasLocalKey = !!localStorage.getItem('hevy_api_key');
            if (initialData.apiKey || hasLocalKey) {
                setIsConfigured(true);
            } else {
                setModalOpen(true);
            }
        }
    }, [initialData.apiKey]);

    const handleSaveWorkout = async (isPrivate: boolean) => {
        if (!state.activeQuest || !state.startTime) return;

        const apiKey = initialData.apiKey || localStorage.getItem('hevy_api_key');
        if (!apiKey) {
            alert("No API Key found. Please configure in settings.");
            setModalOpen(true);
            return;
        }

        const payload = mapQuestToHevyPayload(state.activeQuest, state.questTitle, state.startTime, new Date(), isPrivate);
        try {
            await saveWorkoutAction(apiKey, payload);
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
            case 'training_center': return <TrainingCenter
                activePath={state.activePath}
                mobilityLevel={state.mobilityLevel}
                recoveryLevel={state.recoveryLevel}
                onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })}
            />;
            case 'war_room': return <RoutineSelector exerciseNameMap={state.exerciseNameMap} onSelectRoutine={(routine) => dispatch({ type: 'SELECT_ROUTINE', payload: { routine, nameMap: state.exerciseNameMap } })} />;
            case 'iron_mines': return <IronMines initialData={state.activeQuest!} title={state.questTitle} onComplete={() => dispatch({ type: 'COMPLETE_QUEST' })} onAbort={() => dispatch({ type: 'ABORT_QUEST' })} />;
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
            case 'guild_hall': return <GuildHall onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'arena': return <Arena onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'marketplace': return <Marketplace onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
            case 'combat_arena': return state.activeBossId ? <CombatArena bossId={state.activeBossId} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'world_map' })} /> : <Citadel state={state} dispatch={dispatch} />;
            case 'cycling_studio': return <CyclingStudio onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;

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

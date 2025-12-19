import React, { Suspense, lazy, useReducer, useEffect } from 'react';
import { Exercise } from '../types/ironforge';
import { IntervalsWellness, TTBIndices, WeaknessAudit, TSBForecast, IntervalsEvent, TitanLoadCalculation, IntervalsActivity, Session } from '../types';
import { AuditReport } from '../types/auditor';
import { getHevyExerciseTemplates, getHevyWorkoutHistory, saveWorkoutToHevy } from '../services/hevy';
import { auditWeaknesses } from '../utils/weaknessAuditor';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import TTBCompass from '../components/TTBCompass';
import PredictivePRWindow from '../components/TTB_Radar';
import { CampaignTracker } from '../components/CampaignTracker';
import { HevyExerciseTemplate, HevyRoutine } from '../types/hevy';
import { mapHevyToQuest, mapQuestToHevyPayload } from '../utils/hevyAdapter';
import { OracleService } from '../services/oracle';
import { OracleRecommendation } from '../types';
import OracleCard from '../components/OracleCard';
import { runFullAudit } from '../services/auditorOrchestrator';
import { intervalsClient } from '../services/intervals';
import UltrathinkDashboard from '../components/UltrathinkDashboard';
import { AnalyticsService } from '../services/analytics';
import { ProgressionService } from '../services/progression';
import GeminiLiveCoach from '../components/GeminiLiveCoach';
import { Mic } from 'lucide-react';

const RoutineSelector = lazy(() => import('../features/training/RoutineSelector'));
const IronMines = lazy(() => import('../features/training/IronMines'));
const QuestCompletion = lazy(() => import('../features/training/components/QuestCompletion'));
const EquipmentArmory = lazy(() => import('../components/settings/EquipmentArmory'));
const Bestiary = lazy(() => import('../components/game/Bestiary'));
const WorldMap = lazy(() => import('../components/game/WorldMap'));
const Grimoire = lazy(() => import('../components/game/Grimoire')) as React.FC<{ onClose: () => void }>;
const GuildHall = lazy(() => import('../features/game/GuildHall'));
const Arena = lazy(() => import('../components/game/Arena'));
const Marketplace = lazy(() => import('../components/game/Marketplace'));

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

const initialState: DashboardState = {
  isCodexLoading: true,
  wellnessData: null,
  ttb: null,
  level: 1,
  activeQuest: null,
  questTitle: '',
  exerciseNameMap: new Map(),
  startTime: null,
  currentView: 'citadel',
  oracleRecommendation: null,
  auditReport: null,
  weaknessAudit: null,
  forecast: [],
  events: [],
  titanAnalysis: null,
  isCoachOpen: false
};

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
        activeQuest: action.payload.blocks.flatMap(b => b.exercises || []) as any,
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
  <div className='flex flex-col items-center justify-center h-full text-center p-8 bg-forge-body'>
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
              // If it's a static session, we'd need to fetch it. 
              // For now, let's assume it's generated for simple flow.
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

const Dashboard: React.FC = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        dispatch({ type: 'INITIAL_DATA_LOAD_START' });
        const templatesData = await getHevyExerciseTemplates();
        const nameMap = new Map(templatesData.exercise_templates.map((t: HevyExerciseTemplate) => [t.id, t.title]));

        // 1. Run Auditor
        const report = await runFullAudit();
        console.log("Auditor Report:", report);

        // Transform AuditReport to WeaknessAudit for Ultrathink
        const weaknessAudit: WeaknessAudit = {
          detected: !!report.highestPriorityGap,
          type: report.highestPriorityGap ? 'RECOVERY_DEBT' : 'NONE', // Simplified mapping
          message: report.highestPriorityGap ? `Focus on ${report.highestPriorityGap.muscleGroup}` : 'Systems Optimal',
          confidence: 0.9,
        };

        // 2. Fetch Wellness from Intervals.icu
        const today = new Date().toISOString().split('T')[0];
        let wellness: IntervalsWellness = await intervalsClient.getWellness(today);

        // Fallback for empty wellness (if API fails or no data for today)
        if (!wellness || !wellness.id) {
          console.warn("No wellness data found for today, using fallback/empty.");
          wellness = { ctl: 0, ramp_rate: 0, bodyBattery: 0, sleepScore: 0 };
        }

        const fakeTTB: TTBIndices = { strength: 75, endurance: 60, wellness: wellness.sleepScore || 50, lowest: 'endurance' };

        // 3. Fetch Events (Next 90 Days)
        const ninetyDaysOut = new Date();
        ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);
        const events = await intervalsClient.getEvents(today, ninetyDaysOut.toISOString().split('T')[0]);

        // 4. Fetch Activities (Last 28 Days) for Titan Load
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
        const activities = await intervalsClient.getActivities(twentyEightDaysAgo.toISOString().split('T')[0], today);

        // Find latest activity for Titan Calc
        let titanAnalysis: TitanLoadCalculation | null = null;
        if (activities.length > 0) {
          const sorted = activities.sort((a, b) => b.id!.localeCompare(a.id!));
          const latest = sorted[0];
          const durMins = latest.moving_time ? latest.moving_time / 60 : 60;
          const intensity = latest.icu_intensity ? latest.icu_intensity / 100 : 0.5;
          const estimatedVol = durMins * 100; // Proxy volume
          titanAnalysis = AnalyticsService.calculateTitanLoad(estimatedVol, intensity, durMins);
        }

        // 5. Calculate Progression
        const progression = await ProgressionService.getProgressionState();

        // 6. Consult Oracle
        const oracleRec = await OracleService.consult(wellness, fakeTTB, [], report, titanAnalysis);

        // 7. Calculate TSB Forecast
        // We assume today's load is the Titan Load of the active/latest session if recent
        const todaysLoad = titanAnalysis ? titanAnalysis.titanLoad : 0;
        const realForecast = AnalyticsService.calculateTSBForecast(wellness, [todaysLoad]);

        dispatch({
          type: 'INITIAL_DATA_LOAD_SUCCESS',
          payload: {
            nameMap,
            ttb: fakeTTB,
            wellness: wellness,
            level: progression.level,
            auditReport: report,
            oracleRec,
            weaknessAudit,
            forecast: realForecast,
            events,
            titanAnalysis
          }
        });
      } catch (error) {
        console.error("Failed to load initial data:", error);
        dispatch({ type: 'INITIAL_DATA_LOAD_FAILURE' });
      }
    };
    fetchInitialData();
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
      // Recalculate level after workout
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
      case 'armory': return <React.Suspense fallback={<LoadingSpinner />}><EquipmentArmory /></React.Suspense>;
      case 'bestiary': return <Bestiary userLevel={state.level} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
      case 'world_map': return <WorldMap userLevel={state.level} onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
      case 'grimoire': return <Grimoire onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
      case 'guild_hall': return <GuildHall onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
      case 'arena': return <Arena onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
      case 'marketplace': return <Marketplace onClose={() => dispatch({ type: 'SET_VIEW', payload: 'citadel' })} />;
      default: return <Citadel state={state} dispatch={dispatch} />;
    }
  }

  if (state.isCodexLoading) return <CodexLoader />;

  return (
    <div className="bg-forge-900 min-h-screen bg-noise">
      <Suspense fallback={<CodexLoader />}>
        {renderView()}
      </Suspense>
      <CoachToggle onClick={() => dispatch({ type: 'TOGGLE_COACH' })} />
      <GeminiLiveCoach isOpen={state.isCoachOpen} onClose={() => dispatch({ type: 'TOGGLE_COACH' })} />
    </div>
  );
};

export default Dashboard;

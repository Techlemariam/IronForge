
import React, { Suspense, lazy, useReducer, useEffect } from 'react';
import { Exercise, IntervalsWellness, TTBIndices } from '../types/ironforge';
import { getHevyExerciseTemplates, getHevyWorkoutHistory, saveWorkoutToHevy } from '../services/hevy';
import { auditWeaknesses } from '../utils/weaknessAuditor';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import TTBCompass from '../../components/TTBCompass';
import PredictivePRWindow from '../../components/TTB_Radar';
import { CampaignTracker } from '../../components/CampaignTracker';
import { HevyExerciseTemplate, HevyRoutine } from '../types/hevy';
import { mapHevyToQuest, mapQuestToHevyPayload } from '../utils/hevyAdapter';

const RoutineSelector = lazy(() => import('../features/training/RoutineSelector'));
const IronMines = lazy(() => import('../features/training/IronMines'));
const QuestCompletion = lazy(() => import('../features/training/components/QuestCompletion'));

type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion';

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
};

type DashboardAction = 
  | { type: 'INITIAL_DATA_LOAD_START' }
  | { type: 'INITIAL_DATA_LOAD_SUCCESS'; payload: { nameMap: Map<string, string>, ttb: TTBIndices, wellness: IntervalsWellness, level: number } }
  | { type: 'INITIAL_DATA_LOAD_FAILURE' }
  | { type: 'SELECT_ROUTINE'; payload: { routine: HevyRoutine, nameMap: Map<string, string> } }
  | { type: 'COMPLETE_QUEST' }
  | { type: 'SAVE_WORKOUT' }
  | { type: 'ABORT_QUEST' }
  | { type: 'SET_VIEW'; payload: View };

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'INITIAL_DATA_LOAD_START': return { ...state, isCodexLoading: true };
    case 'INITIAL_DATA_LOAD_SUCCESS': return { ...state, isCodexLoading: false, ...action.payload };
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <NavButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'war_room' })}>New Quest</NavButton>
                <NavButton onClick={() => alert('Armory coming soon!')}>Armory</NavButton>
                <NavButton onClick={() => alert('Bestiary coming soon!')}>Bestiary</NavButton>
                <NavButton onClick={() => alert('Grimoire coming soon!')}>Grimoire</NavButton>
                <NavButton onClick={() => alert('World Map coming soon!')}>World Map</NavButton>
            </div>
        </section>
        
        <section id="campaign-tracker">
             <CampaignTracker wellness={state.wellnessData} ttb={state.ttb} level={state.level} />
        </section>

        <section id="ultrathink-dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {state.ttb && <TTBCompass indices={state.ttb} />}
                <PredictivePRWindow />
            </div>
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
        const historyResponse = await getHevyWorkoutHistory(30);
        auditWeaknesses(historyResponse.workouts);

        dispatch({ 
          type: 'INITIAL_DATA_LOAD_SUCCESS', 
          payload: {
            nameMap,
            ttb: { strength: 75, endurance: 60, wellness: 85, lowest: 'endurance' },
            wellness: { ctl: 20, ramp_rate: 2 },
            level: 4,
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
      dispatch({ type: 'SAVE_WORKOUT' });
    }
  };

  const renderView = () => {
      switch(state.currentView) {
          case 'citadel': return <Citadel state={state} dispatch={dispatch} />;
          case 'war_room': return <RoutineSelector onSelectRoutine={(routine) => dispatch({ type: 'SELECT_ROUTINE', payload: { routine, nameMap: state.exerciseNameMap } })} />;
          case 'iron_mines': return <IronMines initialData={state.activeQuest!} title={state.questTitle} onComplete={() => dispatch({ type: 'COMPLETE_QUEST' })} onAbort={() => dispatch({ type: 'ABORT_QUEST' })} />;
          case 'quest_completion': return <QuestCompletion onSave={handleSaveWorkout} onCancel={() => dispatch({ type: 'ABORT_QUEST' })} />;
          default: return <Citadel state={state} dispatch={dispatch} />;
      }
  }

  if (state.isCodexLoading) return <CodexLoader />;

  return (
      <div className="bg-forge-900 min-h-screen bg-noise">
        <Suspense fallback={<CodexLoader />}>
            {renderView()}
        </Suspense>
      </div>
  );
};

export default Dashboard;

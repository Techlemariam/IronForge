
import React, { useState, useEffect } from 'react';
import RoutineSelector from '../features/training/RoutineSelector';
import IronMines from '../features/training/IronMines';
import QuestCompletion from '../features/training/components/QuestCompletion';
import { Exercise, IntervalsWellness, TTBIndices } from '../types/ironforge';
import { mapHevyToQuest, mapQuestToHevyPayload } from '../utils/hevyAdapter';
import { HevyRoutine, HevyExerciseTemplate } from '../types/hevy';
import { getHevyExerciseTemplates, saveWorkoutToHevy, getHevyWorkoutHistory } from '../services/hevy';
import { auditWeaknesses, MuscleVolume } from '../utils/weaknessAuditor';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import ForgeCard from '../components/ui/ForgeCard';
import ForgeButton from '../components/ui/ForgeButton';
import WeaknessRadar from '../components/game/Weakness_Radar';
import CharacterSheet from '../../components/CharacterSheet';
import { User, Settings } from 'lucide-react';
import { SkillProvider } from '../../context/SkillContext';
import TTBCompass from '../../components/TTBCompass';
import PredictivePRWindow from '../../components/TTB_Radar';
import { CampaignTracker } from '../../components/CampaignTracker';


type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion';

const CodexLoader: React.FC = () => (
    <div className='flex flex-col items-center justify-center h-full text-center p-8'>
        <LoadingSpinner />
        <p className='font-mono text-rune mt-4 uppercase tracking-widest'>Initializing Systems...</p>
        <p className='font-mono text-sm text-forge-muted'>Decoding Ancient Codex</p>
    </div>
);

const Citadel: React.FC<{
    onEnterMines: () => void;
    weaknessData: MuscleVolume[] | null;
    isAnalysisLoading: boolean;
    onOpenCharacterSheet: () => void;
    ttb: TTBIndices | null;
    wellness: IntervalsWellness | null;
    level: number;
}> = ({ onEnterMines, weaknessData, isAnalysisLoading, onOpenCharacterSheet, ttb, wellness, level }) => {
    const [isRadarVisible, setIsRadarVisible] = useState(false);

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-8 animate-fade-in">
            <header className='absolute top-0 left-0 right-0 p-4 flex justify-between items-center'>
                <div className="font-serif text-lg text-amber-400 tracking-widest">
                    IRONFORGE
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onOpenCharacterSheet} className="text-gray-600 hover:text-white transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                    <button className="text-gray-600 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className='flex-grow flex flex-col items-center justify-center'>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                    {/* Left Column */}
                    <div className="md:col-span-1 flex flex-col gap-8">
                        {ttb && <TTBCompass indices={ttb} />}
                        <PredictivePRWindow />
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-2">
                        <CampaignTracker wellness={wellness} ttb={ttb} level={level} />
                    </div>
                </div>
            </main>
        </div>
    );
}

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('citadel');
  const [activeQuest, setActiveQuest] = useState<Exercise[] | null>(null);
  const [questTitle, setQuestTitle] = useState<string>('');
  const [exerciseNameMap, setExerciseNameMap] = useState<Map<string, string>>(new Map());
  const [isCodexLoading, setIsCodexLoading] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [weaknessData, setWeaknessData] = useState<MuscleVolume[] | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(true);
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set(['ach_first_quest', 'ach_reach_level_5']));
  const [wellnessData, setWellnessData] = useState<IntervalsWellness | null>(null);
  const [ttb, setTtb] = useState<TTBIndices | null>(null);
  const [level, setLevel] = useState<number>(1);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsCodexLoading(true);
        setIsAnalysisLoading(true);

        const templatesData = await getHevyExerciseTemplates();
        const nameMap = new Map(templatesData.exercise_templates.map((t: HevyExerciseTemplate) => [t.id, t.title]));
        setExerciseNameMap(nameMap);

        const historyResponse = await getHevyWorkoutHistory(30);
        const analysisResults = auditWeaknesses(historyResponse.workouts);
        setWeaknessData(analysisResults);

        // Mock data for new components
        setTtb({ strength: 75, endurance: 60, wellness: 85, lowest: 'endurance' });
        setWellnessData({ ctl: 20, ramp_rate: 2 });
        setLevel(4);


      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsCodexLoading(false);
        setIsAnalysisLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleRoutineSelect = (routine: HevyRoutine) => {
    const questData = mapHevyToQuest(routine, exerciseNameMap);
    setQuestTitle(routine.title);
    setActiveQuest(questData);
    setStartTime(new Date());
    setCurrentView('iron_mines');
  };

  const handleQuestComplete = () => {
    setCurrentView('quest_completion');
  };

  const handleSaveWorkout = async (isPrivate: boolean) => {
    if (!activeQuest || !startTime) return;

    const payload = mapQuestToHevyPayload(activeQuest, questTitle, startTime, new Date(), isPrivate);

    try {
      await saveWorkoutToHevy(payload);
      alert("VICTORY! The Archive (Hevy) has been updated.");
    } catch (error) {
      console.error("Uplink to Hevy failed:", error);
      alert("WARNING: Loot secured locally, but Uplink to Hevy failed. Check console for details.");
    } finally {
      setActiveQuest(null);
      setQuestTitle('');
      setStartTime(null);
      setCurrentView('citadel');
    }
  };

  const handleQuestAbort = () => {
    setActiveQuest(null);
    setQuestTitle('');
    setStartTime(null);
    setCurrentView('citadel');
  };

  const renderView = () => {
      if(isCodexLoading) return <CodexLoader />;

      switch(currentView) {
          case 'citadel':
              return <Citadel onEnterMines={() => setCurrentView('war_room')} weaknessData={weaknessData} isAnalysisLoading={isAnalysisLoading} onOpenCharacterSheet={() => setIsCharacterSheetOpen(true)} ttb={ttb} wellness={wellnessData} level={level} />;
          case 'war_room':
              return <RoutineSelector onSelectRoutine={handleRoutineSelect} />;
          case 'iron_mines':
              return <IronMines initialData={activeQuest!} title={questTitle} onComplete={handleQuestComplete} onAbort={handleQuestAbort} />;
          case 'quest_completion':
              return <QuestCompletion onSave={handleSaveWorkout} onCancel={handleQuestAbort} />;
          default:
              return <Citadel onEnterMines={() => setCurrentView('war_room')} weaknessData={weaknessData} isAnalysisLoading={isAnalysisLoading} onOpenCharacterSheet={() => setIsCharacterSheetOpen(true)} ttb={ttb} wellness={wellnessData} level={level} />;
      }
  }

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto h-screen bg-black overflow-hidden"
      style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/hexellence.png')" }}
    >
        <div className="absolute top-0 left-0 text-[20rem] font-serif font-black text-white/5 opacity-5 -translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
            AL
        </div>
        <div className="absolute top-0 right-0 text-[20rem] font-serif font-black text-white/5 opacity-5 translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
            HY
        </div>

      {renderView()}
      {isCharacterSheetOpen && (
        <SkillProvider unlockedAchievementIds={unlockedAchievements} wellness={wellnessData}>
          <CharacterSheet unlockedIds={unlockedAchievements} onClose={() => setIsCharacterSheetOpen(false)} />
        </SkillProvider>
      )}
    </div>
  );
};

export default Dashboard;

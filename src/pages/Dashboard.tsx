
import React, { useState, useEffect } from 'react';
import RoutineSelector from '../features/training/RoutineSelector';
import IronMines from '../features/training/IronMines';
import QuestCompletion from '../features/training/components/QuestCompletion';
import { Exercise } from '../types/ironforge';
import { mapHevyToQuest, mapQuestToHevyPayload } from '../utils/hevyAdapter';
import { HevyRoutine, HevyExerciseTemplate } from '../types/hevy';
import { getHevyExerciseTemplates, saveWorkoutToHevy, getHevyWorkoutHistory } from '../services/hevy';
import { auditWeaknesses, MuscleVolume } from '../utils/weaknessAuditor';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import ForgeCard from '../components/ui/ForgeCard';
import ForgeButton from '../components/ui/ForgeButton';
import WeaknessRadar from '../components/game/Weakness_Radar';

type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion';

const CodexLoader: React.FC = () => (
    <div className='flex flex-col items-center justify-center h-full text-center p-8'>
        <LoadingSpinner />
        <p className='font-mono text-rune mt-4 uppercase tracking-widest'>Initializing Systems...</p>
        <p className='font-mono text-sm text-forge-muted'>Decoding Ancient Codex</p>
    </div>
);

const Citadel: React.FC<{ onEnterMines: () => void; weaknessData: MuscleVolume[] | null; isAnalysisLoading: boolean }> = ({ onEnterMines, weaknessData, isAnalysisLoading }) => {
    const [isRadarVisible, setIsRadarVisible] = useState(false);

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-8 animate-fade-in">
            <header className='flex-shrink-0'>
                <ForgeCard className="flex items-center justify-between">
                    <div>
                        <h2 className='font-heading text-lg tracking-widest uppercase'>Iron Acolyte</h2>
                        <p className='font-mono text-sm text-forge-muted'>Status: Combat Ready</p>
                    </div>
                    <div className='w-1/3 h-4 bg-black border border-blood rounded-full'>
                        <div className="w-3/4 h-full bg-blood" />
                    </div>
                </ForgeCard>
            </header>

            <main className='flex-grow flex flex-col items-center justify-center'>
                <div className='text-center'>
                    <h1 className="font-heading text-4xl md:text-6xl text-white tracking-widest">IRONFORGE</h1>
                    <p className="font-mono text-rune">The body is a weapon. Keep it sharp.</p>
                </div>

                <div className="mt-8 w-full max-w-md">
                    <button
                        onClick={() => setIsRadarVisible(true)}
                        className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-center hover:border-blood transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isAnalysisLoading || !weaknessData}
                    >
                        <span className="font-mono text-rune uppercase tracking-widest">Weakness Radar</span>
                    </button>
                </div>

                {isRadarVisible && weaknessData && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-fast">
                        <ForgeCard className="max-w-lg w-full m-4">
                            <WeaknessRadar muscleData={weaknessData} isLoading={isAnalysisLoading} />
                            <div className="mt-6 flex justify-center">
                                <ForgeButton
                                    onClick={() => setIsRadarVisible(false)}
                                    variant='secondary'
                                >
                                    Close
                                </ForgeButton>
                            </div>
                        </ForgeCard>
                    </div>
                )}
            </main>

            <footer className='flex-shrink-0 flex justify-center'>
                <ForgeButton 
                    variant="magma"
                    onClick={onEnterMines} 
                    className='px-10 py-4 animate-pulse'
                >
                    Enter The War Room
                </ForgeButton>
            </footer>
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsCodexLoading(true);
        setIsAnalysisLoading(true);
        
        // Fetch exercise templates to map IDs to names
        const templatesData = await getHevyExerciseTemplates();
        const nameMap = new Map(templatesData.exercise_templates.map((t: HevyExerciseTemplate) => [t.id, t.title]));
        setExerciseNameMap(nameMap);
        
        // Fetch workout history and analyze weaknesses
        const historyResponse = await getHevyWorkoutHistory(30);
        const analysisResults = auditWeaknesses(historyResponse.workouts);
        setWeaknessData(analysisResults);

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
              return <Citadel onEnterMines={() => setCurrentView('war_room')} weaknessData={weaknessData} isAnalysisLoading={isAnalysisLoading} />;
          case 'war_room':
              return <RoutineSelector onSelectRoutine={handleRoutineSelect} />;
          case 'iron_mines':
              return <IronMines initialData={activeQuest!} title={questTitle} onComplete={handleQuestComplete} onAbort={handleQuestAbort} />;
          case 'quest_completion':
              return <QuestCompletion onSave={handleSaveWorkout} onCancel={handleQuestAbort} />;
          default:
              return <Citadel onEnterMines={() => setCurrentView('war_room')} weaknessData={weaknessData} isAnalysisLoading={isAnalysisLoading} />;
      }
  }

  return (
    <div className="w-full max-w-5xl mx-auto h-screen">
      {renderView()}
    </div>
  );
};

export default Dashboard;

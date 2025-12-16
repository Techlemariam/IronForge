
import React, { useState, useEffect } from 'react';
import RoutineSelector from '../features/training/RoutineSelector';
import IronMines from '../features/training/IronMines';
import { Exercise } from '../types/ironforge';
import { mapHevyToQuest, mapQuestToHevyPayload } from '../utils/hevyAdapter';
import { HevyRoutine, HevyExerciseTemplate } from '../types/hevy';
import { getHevyExerciseTemplates, saveWorkoutToHevy } from '../services/hevy';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import ForgeCard from '../components/ui/ForgeCard';
import ForgeButton from '../components/ui/ForgeButton';

type View = 'citadel' | 'war_room' | 'iron_mines';

// --- Skeleton Loader for Codex ---
const CodexLoader: React.FC = () => (
    <div className='flex flex-col items-center justify-center h-full text-center p-8'>
        <LoadingSpinner />
        <p className='font-mono text-rune mt-4 uppercase tracking-widest'>Initializing Systems...</p>
        <p className='font-mono text-sm text-forge-muted'>Decoding Ancient Codex</p>
    </div>
);

// --- The Citadel View ---
const Citadel: React.FC<{ onEnterMines: () => void }> = ({ onEnterMines }) => (
    <div className="w-full h-full flex flex-col p-4 md:p-8 animate-fade-in">
        <header className='flex-shrink-0'>
            <ForgeCard className="flex items-center justify-between">
                <div>
                    <h2 className='font-heading text-lg tracking-widest uppercase'>Iron Acolyte</h2>
                    <p className='font-mono text-sm text-forge-muted'>Status: Combat Ready</p>
                </div>
                {/* Placeholder for TTB Radar / HP Bar */}
                <div className='w-1/3 h-4 bg-black border border-blood rounded-full'>
                    <div className="w-3/4 h-full bg-blood" />
                </div>
            </ForgeCard>
        </header>

        <main className='flex-grow flex items-center justify-center'>
            <div className='text-center'>
                <h1 className="font-heading text-4xl md:text-6xl text-white tracking-widest">IRONFORGE</h1>
                <p className="font-mono text-rune">The body is a weapon. Keep it sharp.</p>
            </div>
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

// --- Main Dashboard Container ---
const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('citadel');
  const [activeQuest, setActiveQuest] = useState<Exercise[] | null>(null);
  const [questTitle, setQuestTitle] = useState<string>('');
  const [exerciseNameMap, setExerciseNameMap] = useState<Map<string, string>>(new Map());
  const [isCodexLoading, setIsCodexLoading] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchExerciseNames = async () => {
      try {
        const templatesData = await getHevyExerciseTemplates();
        const nameMap = new Map(templatesData.exercise_templates.map((t: HevyExerciseTemplate) => [t.id, t.title]));
        setExerciseNameMap(nameMap);
      } catch (error) {
        console.error("Failed to load Exercise Codex:", error);
      } finally {
        setIsCodexLoading(false);
      }
    };
    fetchExerciseNames();
  }, []);

  const handleRoutineSelect = (routine: HevyRoutine) => {
    const questData = mapHevyToQuest(routine, exerciseNameMap);
    setQuestTitle(routine.title);
    setActiveQuest(questData);
    setStartTime(new Date());
    setCurrentView('iron_mines');
  };

  const handleQuestComplete = async () => {
    if (!activeQuest || !startTime) return;
    const payload = mapQuestToHevyPayload(activeQuest, questTitle, startTime, new Date());
    try {
      await saveWorkoutToHevy(payload);
      alert("VICTORY! The Archive (Hevy) has been updated.");
    } catch (error) {
      console.error(error);
      alert("WARNING: Loot secured locally, but Uplink to Hevy failed.");
    } finally {
      setActiveQuest(null);
      setQuestTitle('');
      setStartTime(null);
      setCurrentView('citadel');
    }
  };
  
  const renderView = () => {
      if(isCodexLoading && currentView !== 'iron_mines') return <CodexLoader />;

      switch(currentView) {
          case 'citadel':
              return <Citadel onEnterMines={() => setCurrentView('war_room')} />;
          case 'war_room':
              return <RoutineSelector onSelectRoutine={handleRoutineSelect} />;
          case 'iron_mines':
              return <IronMines initialData={activeQuest!} title={questTitle} onComplete={handleQuestComplete} />;
          default:
              return <Citadel onEnterMines={() => setCurrentView('war_room')} />;
      }
  }

  return (
    <div className="w-full max-w-5xl mx-auto h-screen">
      {renderView()}
    </div>
  );
};

export default Dashboard;

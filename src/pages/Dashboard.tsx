import React, { useState } from 'react';
import RoutineSelector from '../features/training/RoutineSelector';
import Quest_Log, { Exercise } from '../../components/Quest_Log';
import { mapHevyToQuest } from '../utils/hevyAdapter';
import { HevyRoutine } from '../../types/hevy';

const Dashboard: React.FC = () => {
  // State: Har vi valt ett pass än?
  const [activeQuest, setActiveQuest] = useState<Exercise[] | null>(null);
  const [questTitle, setQuestTitle] = useState<string>('');

  const handleRoutineSelect = (routine: HevyRoutine) => {
    // 1. Konvertera Hevy -> IronForge
    const dungeonData = mapHevyToQuest(routine);
    // 2. Sätt titel och starta passet
    setQuestTitle(routine.title);
    setActiveQuest(dungeonData);
  };

  const handleQuestComplete = () => {
    // Återgå till menyn (Här kommer vi senare lägga in "Save to Hevy")
    setActiveQuest(null);
    setQuestTitle('');
  };

  return (
    <div className="min-h-screen bg-forge-black pb-20">
      {/* Om vi INTE har ett aktivt pass -> Visa Mission Select */}
      {!activeQuest ? (
        <RoutineSelector onSelectRoutine={handleRoutineSelect} />
      ) : (
        /* Om vi HAR ett pass -> Visa Quest Log (Dungeon) */
        <Quest_Log 
          initialData={activeQuest} // Du måste uppdatera Quest_Log props för att ta emot detta!
          title={questTitle}
          onComplete={handleQuestComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;

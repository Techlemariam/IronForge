
import React, { useState } from 'react';
import RoutineSelector from '../features/training/RoutineSelector';
import Quest_Log from '../features/training/Quest_Log';
import { Exercise } from '../types/ironforge';
import { mapHevyToQuest } from '../utils/hevyAdapter';
import { HevyRoutine } from '../types/hevy';

const Dashboard: React.FC = () => {
  const [activeQuest, setActiveQuest] = useState<Exercise[] | null>(null);
  const [questTitle, setQuestTitle] = useState<string>('');

  const handleRoutineSelect = (routine: HevyRoutine) => {
    console.log("Routine Selected:", routine.title);
    const dungeonData = mapHevyToQuest(routine);
    setQuestTitle(routine.title);
    setActiveQuest(dungeonData);
  };

  const handleQuestComplete = () => {
    alert("Dungeon Cleared! Loot secured. (Data saved locally)");
    setActiveQuest(null);
    setQuestTitle('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!activeQuest && (
        <div className="mb-6 p-4">
          <h1 className="text-3xl font-bold text-white">Select a Routine</h1>
        </div>
      )}

      {!activeQuest ? (
        <RoutineSelector onSelectRoutine={handleRoutineSelect} />
      ) : (
        <Quest_Log 
          initialData={activeQuest} 
          title={questTitle}
          onComplete={handleQuestComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;

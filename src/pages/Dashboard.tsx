
import React, { useState, useEffect } from 'react';
import RoutineSelector from '../features/training/RoutineSelector';
import Quest_Log from '../features/training/Quest_Log';
import { Exercise } from '../types/ironforge';
import { mapHevyToQuest } from '../utils/hevyAdapter';
import { HevyRoutine, HevyExerciseTemplate } from '../types/hevy';
import { getHevyExerciseTemplates } from '../services/hevy';

const Dashboard: React.FC = () => {
  const [activeQuest, setActiveQuest] = useState<Exercise[] | null>(null);
  const [questTitle, setQuestTitle] = useState<string>('');
  const [exerciseNameMap, setExerciseNameMap] = useState<Map<string, string>>(new Map());
  const [isCodexLoading, setIsCodexLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExerciseNames = async () => {
      try {
        console.log("Fetching the Exercise Codex...");
        const templatesData = await getHevyExerciseTemplates();
        // !!! THE REAL FIX !!!
        // The Hevy API returns the array in a key that matches the endpoint name.
        const templates: HevyExerciseTemplate[] = templatesData.exercise_templates || [];
        const nameMap = new Map<string, string>();
        templates.forEach(template => {
          nameMap.set(template.id, template.title);
        });
        setExerciseNameMap(nameMap);
        console.log(`Codex loaded with ${nameMap.size} entries.`);
      } catch (error) {
        console.error("Failed to load Exercise Codex:", error);
      } finally {
        setIsCodexLoading(false);
      }
    };

    fetchExerciseNames();
  }, []);

  const handleRoutineSelect = (routine: HevyRoutine) => {
    console.log("Routine Selected:", routine.title);
    const dungeonData = mapHevyToQuest(routine, exerciseNameMap);
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
        isCodexLoading ? (
          <p className="text-center text-white">Decoding the ancient codex...</p>
        ) : (
          <RoutineSelector onSelectRoutine={handleRoutineSelect} />
        )
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

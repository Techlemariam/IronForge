
import React, { useState, useContext, useEffect } from 'react';
import { Session, BlockType, Block, Exercise, ExerciseLog, AppSettings, IntervalsWellness } from '../types';
import ActionView from './ActionView';
import TransitionView from './TransitionView';
import PreWorkoutCheck from './PreWorkoutCheck';
import { CheckCircle2, Crown, Save, Upload, Loader2, Zap, AlertTriangle, PlayCircle, Trash2 } from 'lucide-react';
import { useBluetoothHeartRate } from '../hooks/useBluetoothHeartRate';
import { AchievementContext } from '../context/AchievementContext';
import { useSkills } from '../context/SkillContext';
import { StorageService, ActiveSessionState } from '../services/storage';
import { IntegrationService } from '../services/integration';
import { IntervalsService } from '../services/intervals';

interface SessionRunnerProps {
  session: Session;
  onExit: () => void;
}

const SessionRunner: React.FC<SessionRunnerProps> = ({ session, onExit }) => {
  const [activeSession, setActiveSession] = useState<Session>(session);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data for Gamification
  const [wellnessData, setWellnessData] = useState<IntervalsWellness | null>(null);
  
  // Export State
  const [exportStatus, setExportStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  
  // Recovery State
  const [foundRecovery, setFoundRecovery] = useState<ActiveSessionState | null>(null);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  const achievementContext = useContext(AchievementContext);
  const { purchasedSkillIds } = useSkills(); 
  
  const { bpm, isConnected, connectToDevice, toggleSimulation, error } = useBluetoothHeartRate();

  // --- CHECK FOR CRASH RECOVERY ---
  useEffect(() => {
      const checkRecovery = async () => {
          const recovered = await StorageService.getActiveSession();
          if (recovered && !completed) {
              setFoundRecovery(recovered);
          }
          setCheckingRecovery(false);
      };
      checkRecovery();
  }, []);

  // --- RESTORE SESSION ---
  const handleRestore = () => {
      if (!foundRecovery) return;
      
      // Merge saved exercise state into the session
      const restoredSession = { ...foundRecovery.sessionData };
      const currentBlock = restoredSession.blocks[foundRecovery.currentBlockIndex];
      
      if (currentBlock.type === BlockType.STATION) {
          currentBlock.exercises = foundRecovery.exercises;
      }

      setActiveSession(restoredSession);
      setCurrentBlockIndex(foundRecovery.currentBlockIndex);
      setHasCheckedIn(true); // Skip check-in if restoring
      setFoundRecovery(null);
  };

  const handleDiscard = async () => {
      await StorageService.clearActiveSession();
      setFoundRecovery(null);
  };

  // --- FETCH WELLNESS FOR GAME MECHANICS ---
  useEffect(() => {
      const fetchWellness = async () => {
          if (foundRecovery) return; // Don't fetch if waiting for user decision

          const settings = await StorageService.getState<AppSettings>('settings');
          if (settings && settings.intervalsApiKey) {
               const today = new Date().toISOString().split('T')[0];
               if (navigator.onLine) {
                   const w = await IntervalsService.getWellness(today, settings.intervalsAthleteId, settings.intervalsApiKey);
                   const titanW = IntervalsService.mapWellnessToTitanStats(w);
                   setWellnessData(titanW);
               } else {
                   setWellnessData({ id: 'offline', bodyBattery: 80, sleepScore: 85 });
               }
          } else {
               setWellnessData({ id: 'sim', bodyBattery: 75, sleepScore: 70 });
          }
      };
      if (!checkingRecovery) fetchWellness();
  }, [checkingRecovery, foundRecovery]);

  // --- APPLY TALENT BONUSES ---
  useEffect(() => {
     if (hasCheckedIn && !foundRecovery) { // Only apply if starting fresh
         const modSession = JSON.parse(JSON.stringify(session));
         const hasVikingStrength = purchasedSkillIds.has('push_2'); 
         const hasQuadzilla = purchasedSkillIds.has('legs_3'); 
         
         modSession.blocks.forEach((block: Block) => {
             if (block.type === BlockType.STATION && block.exercises) {
                 block.exercises.forEach((ex: Exercise) => {
                     if (ex.id === 'ex_landmine_press' && hasVikingStrength && ex.trainingMax) {
                         ex.trainingMax += 2.5;
                         ex.name = `[BUFFED] ${ex.name}`;
                     }
                     if (ex.id === 'ex_belt_squat' && hasQuadzilla && ex.trainingMax) {
                         ex.trainingMax += 5; 
                         ex.name = `[TITAN] ${ex.name}`;
                     }
                 });
             }
             if (block.type === BlockType.TRANSITION && hasQuadzilla && block.targetSetupName?.includes('Belt Squat')) {
                 block.setupInstructions?.push("Quadzilla Perk: Setup time expectations reduced.");
             }
         });
         setActiveSession(modSession);
     }
  }, [session, purchasedSkillIds, hasCheckedIn]);

  // --- SAVE LOGIC ---
  useEffect(() => {
    const saveResults = async () => {
        if (!completed || isSaving) return;
        setIsSaving(true);

        try {
            if (achievementContext) {
                if (activeSession.id === 'session_a') {
                    achievementContext.unlockAchievement('clear_deadmines');
                } else if (activeSession.id === 'session_b') {
                    achievementContext.unlockAchievement('defender_ironforge');
                }
            }

            const logs: ExerciseLog[] = [];
            const today = new Date().toISOString();

            activeSession.blocks.forEach(block => {
                if (block.type === BlockType.STATION && block.exercises) {
                    block.exercises.forEach(ex => {
                        const validSets = ex.sets.filter(s => s.completed && s.weight && (s.completedReps || typeof s.reps === 'number'));
                        if (validSets.length > 0) {
                            const bestSet = validSets[validSets.length - 1];
                            const weight = bestSet.weight || 0;
                            const actualReps = bestSet.completedReps || (typeof bestSet.reps === 'number' ? bestSet.reps : 0);
                            const e1rm = Math.round(weight * (1 + actualReps / 30));

                            if (actualReps > 0) {
                                logs.push({
                                    date: today,
                                    exerciseId: ex.id,
                                    e1rm: e1rm,
                                    rpe: 9, 
                                    isEpic: bestSet.isPrZone
                                });
                            }
                        }
                    });
                }
            });

            for (const log of logs) {
                await StorageService.saveLog(log);
            }
            
            // Clear active session on successful save
            await StorageService.clearActiveSession();
            
        } catch (e) {
            console.error("Failed to save session", e);
        } finally {
            setIsSaving(false);
        }
    };

    if (completed) {
        saveResults();
    }
  }, [completed]);

  const handleExport = async () => {
      setExportStatus('UPLOADING');
      try {
          const settings = await StorageService.getState<AppSettings>('settings');
          if (!settings) throw new Error("No settings found");

          const type = IntegrationService.detectSessionType(activeSession);
          let success = false;

          if (type === 'CARDIO') {
              success = await IntegrationService.uploadToIntervals(activeSession, settings);
          } else {
              success = await IntegrationService.uploadToHevy(activeSession, settings);
          }

          setExportStatus(success ? 'SUCCESS' : 'ERROR');

      } catch (e) {
          console.error(e);
          setExportStatus('ERROR');
      }
  };

  const handleAbort = () => {
      if (window.confirm("Abandon Quest? All unsaved progress will be lost.")) {
          StorageService.clearActiveSession();
          onExit();
      }
  };

  // --- RECOVERY UI ---
  if (foundRecovery) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 animate-fade-in font-serif">
              <div className="max-w-md w-full border-2 border-red-500 rounded-lg p-6 bg-red-950/20 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                  <div className="flex items-center gap-3 text-red-500 mb-4">
                      <AlertTriangle className="w-8 h-8" />
                      <h2 className="text-xl font-black uppercase tracking-widest">Session Interrupted</h2>
                  </div>
                  <p className="text-zinc-300 mb-6 font-sans text-sm">
                      We found an active session in the database. <br/>
                      <span className="text-white font-bold">"{foundRecovery.sessionData.name}"</span>
                      <br/>started at {new Date(foundRecovery.startTime).toLocaleTimeString()}.
                  </p>
                  <div className="space-y-3">
                      <button 
                        onClick={handleRestore}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all shadow-lg"
                      >
                          <PlayCircle className="w-5 h-5" /> Resume Quest
                      </button>
                      <button 
                        onClick={handleDiscard}
                        className="w-full py-3 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-red-500 rounded font-bold uppercase text-xs flex items-center justify-center gap-2"
                      >
                          <Trash2 className="w-4 h-4" /> Discard
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (!hasCheckedIn) {
    return (
      <PreWorkoutCheck 
        session={activeSession} 
        onProceed={(finalSession) => {
            setActiveSession(finalSession);
            setHasCheckedIn(true);
        }} 
        onCancel={onExit}
      />
    );
  }

  const currentBlock = activeSession.blocks[currentBlockIndex];

  // Callback to persist state when ActionView changes data
  const handleSessionUpdate = (updatedExercises: Exercise[]) => {
      // Create a shallow copy of active session with new exercises
      const updatedSession = { ...activeSession };
      const block = updatedSession.blocks[currentBlockIndex];
      block.exercises = updatedExercises;
      
      setActiveSession(updatedSession);

      // Fire-and-forget save to DB
      StorageService.saveActiveSession({
          sessionId: activeSession.id,
          startTime: foundRecovery?.startTime || new Date().toISOString(),
          currentBlockIndex,
          exercises: updatedExercises,
          sessionData: updatedSession
      });
  };

  const handleNext = () => {
    // Save checkpoint before transition
    StorageService.saveActiveSession({
          sessionId: activeSession.id,
          startTime: foundRecovery?.startTime || new Date().toISOString(),
          currentBlockIndex: currentBlockIndex + 1, // Advance index
          exercises: [], // Next block starts clean (if station)
          sessionData: activeSession
    });

    if (currentBlock.id === 'block_ghd_acc') {
        achievementContext?.unlockAchievement('spine_of_deathwing');
    }
    if (currentBlock.id === 'block_landmine_main') {
        achievementContext?.unlockAchievement('krol_blade');
    }

    if (currentBlockIndex < activeSession.blocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setCompleted(true);
    }
  };

  const isRested = (wellnessData?.sleepScore || 0) > 80;

  if (completed) {
    const sessionType = IntegrationService.detectSessionType(activeSession);

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-6 text-center space-y-6 animate-fade-in font-serif">
        <div className="w-24 h-24 rounded-full bg-green-900/20 flex items-center justify-center border-2 border-green-800 text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Quest Complete</h1>
        <p className="text-zinc-500 max-w-md font-sans text-sm">
            {isSaving ? "Writing to Tomes..." : "Great work. The logistical data has been logged to the Local Database."}
        </p>

        {isRested && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <div className="p-1 bg-blue-500 rounded-full">
                    <Zap className="w-3 h-3 text-white fill-current" />
                </div>
                <span className="text-blue-300 font-bold uppercase tracking-widest text-xs">
                    Rested XP Bonus: +100% Experience
                </span>
            </div>
        )}
        
        {purchasedSkillIds.has('push_2') && activeSession.id === 'session_a' && (
            <div className="flex items-center gap-2 text-[#ffd700] bg-yellow-950/30 border border-[#ffd700]/30 px-4 py-2 rounded text-xs uppercase font-bold tracking-widest">
                <Crown className="w-4 h-4" />
                Viking Strength Bonus Applied
            </div>
        )}

        {!isSaving && (
            <div className="w-full max-w-xs space-y-3">
                <button 
                  onClick={handleExport}
                  disabled={exportStatus === 'UPLOADING' || exportStatus === 'SUCCESS'}
                  className={`w-full py-4 border-2 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                    ${sessionType === 'CARDIO' 
                        ? 'bg-blue-900/20 border-blue-600 text-blue-400 hover:bg-blue-900/40' 
                        : 'bg-orange-900/20 border-orange-600 text-orange-400 hover:bg-orange-900/40'}
                    ${exportStatus === 'SUCCESS' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                    {exportStatus === 'UPLOADING' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : exportStatus === 'SUCCESS' ? (
                        <CheckCircle2 className="w-5 h-5" />
                    ) : (
                        <Upload className="w-5 h-5" />
                    )}
                    
                    {exportStatus === 'UPLOADING' ? 'Syncing...' 
                     : exportStatus === 'SUCCESS' ? 'Exported' 
                     : sessionType === 'CARDIO' ? 'Upload to Intervals.icu' 
                     : 'Log to Hevy'}
                </button>
                
                {exportStatus === 'ERROR' && (
                    <p className="text-red-500 text-xs">Upload failed. Check API Keys in settings.</p>
                )}
            </div>
        )}

        <button 
          onClick={onExit}
          disabled={isSaving}
          className="px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold uppercase tracking-wider rounded transition-transform active:scale-95 shadow-lg flex items-center gap-2"
        >
          {isSaving ? <Save className="w-4 h-4 animate-bounce" /> : null}
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (currentBlock.type === BlockType.TRANSITION) {
    return (
      <TransitionView 
        key={currentBlock.id} 
        block={currentBlock} 
        onComplete={handleNext} 
        onAbort={handleAbort}
      />
    );
  }

  return (
    <ActionView 
      key={currentBlock.id} 
      block={currentBlock} 
      onComplete={handleNext}
      onAbort={handleAbort}
      bpm={bpm}
      isBtConnected={isConnected}
      onBtConnect={connectToDevice}
      onBtSimulate={toggleSimulation}
      btError={error}
      wellness={wellnessData} 
      onSessionUpdate={handleSessionUpdate} // Pass persistence callback
    />
  );
};

export default SessionRunner;

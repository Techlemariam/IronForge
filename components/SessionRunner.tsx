
import React, { useState, useContext, useEffect } from 'react';
import { Session, BlockType, Block, Exercise, ExerciseLog, AppSettings, IntervalsWellness } from '../types';
import Quest_Log from './Quest_Log';
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
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  
  // Data for Gamification
  const [wellnessData, setWellnessData] = useState<IntervalsWellness | null>(null);
  const [historyLogs, setHistoryLogs] = useState<ExerciseLog[]>([]);
  const [exportStatus, setExportStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [foundRecovery, setFoundRecovery] = useState<ActiveSessionState | null>(null);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  const achievementContext = useContext(AchievementContext);
  const { purchasedSkillIds } = useSkills(); 
  
  // Bluetooth HRM
  const { bpm } = useBluetoothHeartRate();

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

  // --- LOAD HISTORY & WELLNESS ---
  useEffect(() => {
      const fetchData = async () => {
          if (foundRecovery) return; 
          
          // 1. Fetch History for PR logic
          const history = await StorageService.getHistory();
          setHistoryLogs(history);

          // 2. Fetch Settings & Wellness
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
      if (!checkingRecovery) fetchData();
  }, [checkingRecovery, foundRecovery]);

  // --- RESTORE SESSION ---
  const handleRestore = () => {
      if (!foundRecovery) return;
      setActiveSession(foundRecovery.sessionData);
      setHasCheckedIn(true);
      setFoundRecovery(null);
  };

  const handleDiscard = async () => {
      await StorageService.clearActiveSession();
      setFoundRecovery(null);
  };

  // --- SAVE LOGIC ---
  useEffect(() => {
    const saveResults = async () => {
        if (!completed || isSaving) return;
        setIsSaving(true);

        try {
            if (achievementContext) {
                // Simplified Achievement Check for Demo
                if (activeSession.id === 'session_a') achievementContext.unlockAchievement('clear_deadmines');
            }

            const logs: ExerciseLog[] = [];
            const today = new Date().toISOString();

            activeSession.blocks.forEach(block => {
                if (block.exercises) {
                    block.exercises.forEach(ex => {
                        const validSets = ex.sets.filter(s => s.completed && s.weight);
                        if (validSets.length > 0) {
                            const bestSet = validSets.reduce((prev, current) => (prev.weight || 0) > (current.weight || 0) ? prev : current);
                            const weight = bestSet.weight || 0;
                            const reps = bestSet.completedReps || 0;
                            const e1rm = Math.round(weight * (1 + reps / 30));

                            logs.push({
                                date: today,
                                exerciseId: ex.id,
                                e1rm: e1rm,
                                rpe: 9, 
                                isEpic: bestSet.rarity === 'legendary'
                            });
                        }
                    });
                }
            });

            for (const log of logs) {
                await StorageService.saveLog(log);
            }
            
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

  const handleAbortRequest = () => {
      setShowAbandonConfirm(true);
  };

  const confirmAbandon = async () => {
      await StorageService.clearActiveSession();
      onExit();
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
                      Resume "{foundRecovery.sessionData.name}"?
                  </p>
                  <div className="space-y-3">
                      <button onClick={handleRestore} className="w-full py-4 bg-green-600 text-white font-black uppercase rounded">Resume Quest</button>
                      <button onClick={handleDiscard} className="w-full py-3 bg-zinc-900 border border-zinc-700 text-zinc-400 uppercase">Discard</button>
                  </div>
              </div>
          </div>
      );
  }

  // --- PRE-CHECK ---
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

  // --- COMPLETION SCREEN ---
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
                <Zap className="w-3 h-3 text-white fill-current" />
                <span className="text-blue-300 font-bold uppercase tracking-widest text-xs">Rested XP Bonus</span>
            </div>
        )}

        {!isSaving && (
            <div className="w-full max-w-xs space-y-3">
                <button 
                  onClick={handleExport}
                  disabled={exportStatus === 'UPLOADING' || exportStatus === 'SUCCESS'}
                  className={`w-full py-4 border-2 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                    ${sessionType === 'CARDIO' ? 'bg-blue-900/20 border-blue-600 text-blue-400' : 'bg-orange-900/20 border-orange-600 text-orange-400'}
                    ${exportStatus === 'SUCCESS' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                    {exportStatus === 'UPLOADING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {exportStatus === 'UPLOADING' ? 'Syncing...' : exportStatus === 'SUCCESS' ? 'Exported' : 'Upload Data'}
                </button>
            </div>
        )}

        <button onClick={onExit} disabled={isSaving} className="px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold uppercase tracking-wider rounded shadow-lg flex items-center gap-2">
          {isSaving ? <Save className="w-4 h-4 animate-bounce" /> : null}
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- MAIN TRAINING VIEW (QUEST LOG) ---
  return (
    <>
        {showAbandonConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in font-serif">
                <div className="bg-[#111] border-2 border-red-900 w-full max-w-sm rounded-lg p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                    <h3 className="text-red-500 font-bold uppercase text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        Abandon Quest?
                    </h3>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-sans">
                        Retreating now will forfeit all progress made in this session. Are you sure you want to return to the dashboard?
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={confirmAbandon} 
                            className="w-full py-4 bg-red-900/20 border border-red-600/50 text-red-500 hover:bg-red-900 hover:text-white font-bold uppercase tracking-widest rounded transition-all"
                        >
                            Confirm Retreat
                        </button>
                        <button 
                            onClick={() => setShowAbandonConfirm(false)} 
                            className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        <Quest_Log 
            session={activeSession}
            history={historyLogs}
            onComplete={() => setCompleted(true)}
            onAbort={handleAbortRequest}
        />
    </>
  );
};

export default SessionRunner;


import React, { useState, useEffect, Suspense } from 'react';
import { SESSIONS } from './data';
import SessionRunner from './components/SessionRunner';
import Layout from './components/Layout'; // IMPORT LAYOUT

// Lazy Load Heavy Components to speed up TTI (Time To Interactive)
const SkillTree = React.lazy(() => import('./components/SkillTree'));
const CharacterSheet = React.lazy(() => import('./components/CharacterSheet'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const UltrathinkDashboard = React.lazy(() => import('./components/UltrathinkDashboard'));
const MindfulnessModal = React.lazy(() => import('./components/MindfulnessModal'));
// Valhalla Lazy Load
const ValhallaGate = React.lazy(() => import('./components/ValhallaGate'));
// New Features Lazy Load
const DungeonBuilder = React.lazy(() => import('./components/DungeonBuilder'));
const GuildHall = React.lazy(() => import('./components/GuildHall'));
const AvatarViewer = React.lazy(() => import('./components/AvatarViewer'));
const EquipmentArmory = React.lazy(() => import('./components/EquipmentArmory'));

import AchievementToast from './components/AchievementToast';
import OracleCard from './components/OracleCard';
import QuestLog from './components/QuestLog';
import GeminiLiveCoach from './components/GeminiLiveCoach'; 

import { useAchievements } from './hooks/useAchievements';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { Brain, WifiOff, Map, Hammer, Users, Video, Box, Bot } from 'lucide-react';
import { AppSettings, IntervalsWellness, WeaknessAudit, TSBForecast, OracleRecommendation, TTBIndices, Session, MeditationLog, ValhallaPayload, ExerciseLog, TitanAttributes, IntervalsEvent } from './types';
import { AnalyticsService } from './services/analytics';
import { AnalyticsWorkerService } from './services/analyticsWorker'; 
import { IntervalsService } from './services/intervals';
import { OracleService } from './services/oracle';
import { SkillProvider } from './context/SkillContext';
import { AchievementContext } from './context/AchievementContext';
import { StorageService } from './services/storage';
import { calculateTitanRank, calculateTitanAttributes } from './utils';
import { CampaignTracker } from './components/CampaignTracker';

// Loading Spinner Component for Suspense
const LoadingFallback = () => (
    <div className="h-full w-full flex items-center justify-center p-10">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#c79c6e] rounded-full animate-spin"></div>
    </div>
);

export default function App() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Dynamic Quest List State
  const [availableSessions, setAvailableSessions] = useState<Session[]>(SESSIONS);

  // View Toggles
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showCharSheet, setShowCharSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true); 
  const [showMindfulness, setShowMindfulness] = useState(false);
  const [showValhalla, setShowValhalla] = useState(false);
  const [showDungeonBuilder, setShowDungeonBuilder] = useState(false);
  const [showGuildHall, setShowGuildHall] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [showGeminiLive, setShowGeminiLive] = useState(false);

  const [isAppLoading, setIsAppLoading] = useState(true);

  // Global Wellness & Analytics State
  const [wellnessData, setWellnessData] = useState<IntervalsWellness | null>(null);
  const [weaknessAudit, setWeaknessAudit] = useState<WeaknessAudit | null>(null);
  const [tsbForecast, setTsbForecast] = useState<TSBForecast[]>([]);
  const [ttbIndices, setTtbIndices] = useState<TTBIndices | null>(null);
  const [meditationLogs, setMeditationLogs] = useState<MeditationLog[]>([]);
  const [historyLogs, setHistoryLogs] = useState<ExerciseLog[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<IntervalsEvent[]>([]);
  const [muscleHeatmap, setMuscleHeatmap] = useState<Record<string, number>>({});
  
  // Oracle State
  const [oracleRec, setOracleRec] = useState<OracleRecommendation | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    intervalsApiKey: '',
    intervalsAthleteId: '',
    hevyApiKey: ''
  });

  // Hooks
  const { unlockedIds, unlockAchievement, currentToast, clearToast, loading: achievementsLoading } = useAchievements();
  const isOnline = useNetworkStatus();
  
  // Derived State
  const { level, isElite } = calculateTitanRank(unlockedIds);
  const [attributes, setAttributes] = useState<TitanAttributes>({strength: 1, endurance: 1, technique: 1, recovery: 1, mental: 1, hypertrophy: 1});

  useEffect(() => {
      setAttributes(calculateTitanAttributes(unlockedIds, wellnessData, new Set(), meditationLogs));
  }, [unlockedIds, wellnessData, meditationLogs]);

  const refreshMeditationLogs = async () => {
    const logs = await StorageService.getMeditationHistory();
    setMeditationLogs(logs);
  };

  // Load Settings & Run Analytics
  useEffect(() => {
    const initApp = async () => {
        await StorageService.init();
        const savedSettings = await StorageService.getState<AppSettings>('settings');
        
        const activeSettings = { 
            intervalsApiKey: savedSettings?.intervalsApiKey || '',
            intervalsAthleteId: savedSettings?.intervalsAthleteId || '',
            hevyApiKey: savedSettings?.hevyApiKey || '',
            valhallaId: savedSettings?.valhallaId,
            heroName: savedSettings?.heroName,
            hueBridgeIp: savedSettings?.hueBridgeIp,
            hueUsername: savedSettings?.hueUsername
        };

        setSettings(activeSettings);
        setIsAppLoading(false);

        setTimeout(async () => {
            const history = await StorageService.getHistory();
            setHistoryLogs(history);
            const medLogs = await StorageService.getMeditationHistory();
            setMeditationLogs(medLogs);
            
            const today = new Date().toISOString().split('T')[0];
            let wellness: IntervalsWellness | null = null;
            let events: IntervalsEvent[] = [];

            if (activeSettings.intervalsApiKey && navigator.onLine) {
                // 1. Fetch Wellness
                const rawW = await IntervalsService.getWellness(today, activeSettings.intervalsAthleteId, activeSettings.intervalsApiKey);
                wellness = IntervalsService.mapWellnessToTitanStats(rawW);
                
                // 2. Fetch Events
                const dateOffset = (days: number) => {
                    const d = new Date();
                    d.setDate(d.getDate() + days);
                    return d.toISOString().split('T')[0];
                };
                events = await IntervalsService.getEvents(activeSettings.intervalsAthleteId, activeSettings.intervalsApiKey, dateOffset(-7), dateOffset(14));
                setUpcomingEvents(events);

                // 3. Fetch Planned Daily Quest
                const plannedQuest = await IntervalsService.getPlannedWorkout(today, activeSettings.intervalsAthleteId, activeSettings.intervalsApiKey);
                if (plannedQuest) {
                    setAvailableSessions(prev => {
                        // Avoid duplicates if re-fetched
                        if (prev.find(s => s.id === plannedQuest.id)) return prev;
                        return [plannedQuest, ...prev];
                    });
                }

            } else {
                wellness = { id: 'simulated', bodyBattery: 85, sleepScore: 90, ctl: 60, atl: 40, tsb: -5, vo2max: 58 };
            }
            setWellnessData(wellness);

            if (wellness) {
                const activities = (activeSettings.intervalsApiKey && navigator.onLine) 
                    ? await IntervalsService.getRecentActivities(activeSettings.intervalsAthleteId, activeSettings.intervalsApiKey)
                    : [];
                
                const analysisHistory = history.length > 0 ? history : AnalyticsService.getMockHistory();
                const audit = AnalyticsService.auditWeakness(analysisHistory, wellness);
                const forecast = AnalyticsService.forecastPRWindow(wellness);
                const ttb = AnalyticsService.calculateTTB(analysisHistory, activities, wellness);
                
                setWeaknessAudit(audit);
                setTsbForecast(forecast);
                setTtbIndices(ttb);
                setOracleRec(OracleService.consult(wellness, ttb, events));

                // --- TRIGGER WORKER FOR HEATMAP ---
                AnalyticsWorkerService.computeAdvancedStats(analysisHistory, wellness)
                    .then(res => setMuscleHeatmap(res.heatmap))
                    .catch(e => console.error("Worker Error", e));
            }
        }, 0);
    };

    initApp();
  }, [unlockedIds]); 

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveState('settings', newSettings).catch(console.error);
  };
  
  const handleValhallaBind = (heroName: string, id: string) => {
      const updated = { ...settings, heroName, valhallaId: id };
      saveSettings(updated);
  };

  const handleCustomSessionSave = (session: Session) => {
      setAvailableSessions(prev => [session, ...prev]);
      setShowDungeonBuilder(false);
  };

  // Nav Handler from Layout
  const handleNavigate = (view: string) => {
      switch(view) {
          case 'dashboard': 
            setShowGuildHall(false); setShowArmory(false); setShowSettings(false); 
            break;
          case 'guild': setShowGuildHall(true); break;
          case 'armory': setShowArmory(true); break;
          case 'character': setShowCharSheet(true); break;
          case 'settings': setShowSettings(true); break;
      }
  };

  if (isAppLoading || achievementsLoading) {
      return <LoadingFallback />;
  }

  // Active Session View (Takes over the layout content or full screen? Let's keep it consistent: Full screen for focus)
  if (activeSessionId) {
      const session = availableSessions.find(s => s.id === activeSessionId);
      if (session) {
          return (
             <AchievementContext.Provider value={{ unlockAchievement, unlockedIds }}>
                <SkillProvider unlockedAchievementIds={unlockedIds} wellness={wellnessData}>
                    {/* Session Runner takes over full screen for "Focus Mode" */}
                    <SessionRunner session={session} onExit={() => setActiveSessionId(null)} />
                </SkillProvider>
             </AchievementContext.Provider>
          );
      }
  }

  // --- DASHBOARD (MAIN MENU) ---
  const valhallaPayload: ValhallaPayload | null = settings.heroName ? {
      heroName: settings.heroName,
      level: level,
      achievements: Array.from(unlockedIds),
      skills: [], 
      historyCount: historyLogs.length,
      lastSync: new Date().toISOString()
  } : null;

  return (
    <AchievementContext.Provider value={{ unlockAchievement, unlockedIds }}>
      <SkillProvider unlockedAchievementIds={unlockedIds} wellness={wellnessData}>
        
        <Layout 
            ttb={ttbIndices} 
            wellness={wellnessData} 
            heroName={settings.heroName} 
            level={level}
            onNavigate={handleNavigate}
        >
            <div className="p-6 max-w-5xl mx-auto w-full space-y-8 pb-20">
                
                <GeminiLiveCoach isOpen={showGeminiLive} onClose={() => setShowGeminiLive(false)} />
                {currentToast && <AchievementToast achievement={currentToast} onClose={clearToast} />}

                {!isOnline && (
                    <div className="bg-red-900/80 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 flex justify-center items-center gap-2 backdrop-blur-sm rounded-lg mb-4">
                        <WifiOff className="w-3 h-3" />
                        Offline Mode
                    </div>
                )}

                {/* Modals & Sub-views */}
                {showSkillTree && <SkillTree onExit={() => setShowSkillTree(false)} unlockedIds={unlockedIds} wellness={wellnessData} />}
                {showCharSheet && <Suspense fallback={<LoadingFallback/>}><CharacterSheet unlockedIds={unlockedIds} onClose={() => setShowCharSheet(false)} meditationLogs={meditationLogs} /></Suspense>}
                {showDungeonBuilder && <Suspense fallback={<LoadingFallback/>}><DungeonBuilder onSave={handleCustomSessionSave} onCancel={() => setShowDungeonBuilder(false)} /></Suspense>}
                {showGuildHall && <Suspense fallback={<LoadingFallback/>}><div className="absolute inset-0 z-50 bg-[#050505]"><button onClick={() => setShowGuildHall(false)} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded text-white hover:bg-red-900"><Users className="w-6 h-6"/></button><GuildHall /></div></Suspense>}
                {showAvatar && <Suspense fallback={<LoadingFallback/>}><div className="absolute inset-0 z-50 bg-[#050505] p-6"><button onClick={() => setShowAvatar(false)} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded text-white hover:bg-red-900"><Video className="w-6 h-6"/></button><AvatarViewer attributes={attributes} isElite={isElite} muscleHeatmap={muscleHeatmap} /></div></Suspense>}
                {showArmory && <Suspense fallback={<LoadingFallback/>}><EquipmentArmory onClose={() => setShowArmory(false)} /></Suspense>}
                {showSettings && <Suspense fallback={null}><SettingsModal onClose={() => setShowSettings(false)} onSave={saveSettings} initialSettings={settings} /></Suspense>}
                {showValhalla && <Suspense fallback={null}><ValhallaGate isOpen={showValhalla} onClose={() => setShowValhalla(false)} heroName={settings.heroName} onBind={handleValhallaBind} syncPayload={valhallaPayload} /></Suspense>}
                {showMindfulness && <Suspense fallback={null}><MindfulnessModal onClose={() => setShowMindfulness(false)} onSave={refreshMeditationLogs} /></Suspense>}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <button onClick={() => setShowDungeonBuilder(true)} className="bg-forge-900 p-4 rounded border border-zinc-800 hover:border-magma flex flex-col items-center gap-2 group transition-all">
                        <Hammer className="w-8 h-8 text-zinc-500 group-hover:text-magma" />
                        <span className="text-xs font-bold uppercase text-zinc-400">Builder</span>
                    </button>
                    <button onClick={() => setShowGuildHall(true)} className="bg-forge-900 p-4 rounded border border-zinc-800 hover:border-indigo-500 flex flex-col items-center gap-2 group transition-all">
                        <Users className="w-8 h-8 text-zinc-500 group-hover:text-indigo-500" />
                        <span className="text-xs font-bold uppercase text-zinc-400">Guild</span>
                    </button>
                    <button onClick={() => setShowArmory(true)} className="bg-forge-900 p-4 rounded border border-zinc-800 hover:border-zinc-400 flex flex-col items-center gap-2 group transition-all">
                        <Box className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300" />
                        <span className="text-xs font-bold uppercase text-zinc-400">Armory</span>
                    </button>
                    <button onClick={() => setShowAvatar(true)} className="bg-forge-900 p-4 rounded border border-zinc-800 hover:border-green-500 flex flex-col items-center gap-2 group transition-all">
                        <Video className="w-8 h-8 text-zinc-500 group-hover:text-green-500" />
                        <span className="text-xs font-bold uppercase text-zinc-400">Avatar</span>
                    </button>
                    <button onClick={() => setShowGeminiLive(true)} className="bg-forge-900 p-4 rounded border border-zinc-800 hover:border-purple-500 flex flex-col items-center gap-2 group transition-all">
                        <Bot className="w-8 h-8 text-zinc-500 group-hover:text-purple-500" />
                        <span className="text-xs font-bold uppercase text-zinc-400">AI Coach</span>
                    </button>
                </div>

                <div className="animate-slide-down">
                    <CampaignTracker wellness={wellnessData} ttb={ttbIndices} level={level} />
                </div>

                {oracleRec && (
                    <div className="animate-slide-up">
                        <OracleCard 
                            recommendation={oracleRec} 
                            onAccept={(rec) => {
                                if (rec.generatedSession) {
                                    setAvailableSessions(prev => [rec.generatedSession!, ...prev]);
                                    setActiveSessionId(rec.generatedSession!.id);
                                } else if (rec.sessionId) {
                                    setActiveSessionId(rec.sessionId);
                                }
                            }}
                        />
                    </div>
                )}

                {wellnessData && (
                    <div className="mb-6">
                        <button onClick={() => setShowAnalytics(!showAnalytics)} className="w-full flex items-center justify-between bg-zinc-900/80 p-3 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors mb-4">
                            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-widest">
                                <Brain className="w-4 h-4" /> Ultrathink Insights
                            </div>
                            <span className="text-zinc-500 text-xs">{showAnalytics ? 'Hide' : 'Show Analysis'}</span>
                        </button>
                        {showAnalytics && weaknessAudit && ttbIndices && (
                            <Suspense fallback={<LoadingFallback />}>
                                <UltrathinkDashboard wellness={wellnessData} audit={weaknessAudit} forecast={tsbForecast} ttb={ttbIndices} events={upcomingEvents} />
                            </Suspense>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-warrior-500 text-sm font-bold uppercase tracking-widest border-b border-warrior-900/30 pb-2 flex items-center gap-2">
                        <Map className="w-4 h-4" /> Campaign Map
                    </h2>
                    <QuestLog sessions={availableSessions} history={historyLogs} onSelectSession={setActiveSessionId} level={level} />
                </div>
            </div>
        </Layout>

      </SkillProvider>
    </AchievementContext.Provider>
  );
}

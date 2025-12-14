
import React, { useState, useEffect, Suspense } from 'react';
import { SESSIONS } from './data';
import SessionRunner from './components/SessionRunner';
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
import { LayoutGrid, Network, Skull, Scroll, Swords, User, Settings as SettingsIcon, Brain, WifiOff, Sparkles, Map, Cloud, Hammer, Users, Video, Box, Bot } from 'lucide-react';
import { AppSettings, IntervalsWellness, WeaknessAudit, TSBForecast, OracleRecommendation, TTBIndices, Session, MeditationLog, ValhallaPayload, ExerciseLog, TitanAttributes, IntervalsEvent } from './types';
import { AnalyticsService } from './services/analytics';
import { AnalyticsWorkerService } from './services/analyticsWorker'; // NEW
import { IntervalsService } from './services/intervals';
import { OracleService } from './services/oracle';
import { GeminiService } from './services/gemini'; 
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
                const rawW = await IntervalsService.getWellness(today, activeSettings.intervalsAthleteId, activeSettings.intervalsApiKey);
                wellness = IntervalsService.mapWellnessToTitanStats(rawW);
                const dateOffset = (days: number) => {
                    const d = new Date();
                    d.setDate(d.getDate() + days);
                    return d.toISOString().split('T')[0];
                };
                events = await IntervalsService.getEvents(activeSettings.intervalsAthleteId, activeSettings.intervalsApiKey, dateOffset(-7), dateOffset(14));
                setUpcomingEvents(events);
            } else {
                wellness = { id: 'simulated', bodyBattery: 85, sleepScore: 90, ctl: 60, atl: 40, tsb: 20, vo2max: 58 };
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

  if (isAppLoading || achievementsLoading) {
      return <LoadingFallback />;
  }

  // Active Session View
  if (activeSessionId) {
      const session = availableSessions.find(s => s.id === activeSessionId);
      if (session) {
          return (
             <AchievementContext.Provider value={{ unlockAchievement, unlockedIds }}>
                <SkillProvider unlockedAchievementIds={unlockedIds} wellness={wellnessData}>
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
        <div className="min-h-screen bg-[#050505] flex flex-col font-serif bg-paper bg-repeat text-zinc-900">
        
        <GeminiLiveCoach isOpen={showGeminiLive} onClose={() => setShowGeminiLive(false)} />

        {currentToast && <AchievementToast achievement={currentToast} onClose={clearToast} />}

        {!isOnline && (
            <div className="bg-red-900/80 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 flex justify-center items-center gap-2 backdrop-blur-sm sticky top-0 z-50">
                <WifiOff className="w-3 h-3" />
                Offline Mode
            </div>
        )}

        {/* Modals & Sub-views */}
        {showSkillTree && <SkillTree onExit={() => setShowSkillTree(false)} unlockedIds={unlockedIds} wellness={wellnessData} />}
        {showCharSheet && <Suspense fallback={<LoadingFallback/>}><CharacterSheet unlockedIds={unlockedIds} onClose={() => setShowCharSheet(false)} meditationLogs={meditationLogs} /></Suspense>}
        {showDungeonBuilder && <Suspense fallback={<LoadingFallback/>}><DungeonBuilder onSave={handleCustomSessionSave} onCancel={() => setShowDungeonBuilder(false)} /></Suspense>}
        {showGuildHall && <Suspense fallback={<LoadingFallback/>}><div className="h-screen flex flex-col bg-[#050505]"><button onClick={() => setShowGuildHall(false)} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded text-white hover:bg-red-900"><Swords className="w-6 h-6"/></button><GuildHall /></div></Suspense>}
        {/* Pass Heatmap to Avatar */}
        {showAvatar && <Suspense fallback={<LoadingFallback/>}><div className="h-screen flex flex-col bg-[#050505] p-6"><button onClick={() => setShowAvatar(false)} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded text-white hover:bg-red-900"><User className="w-6 h-6"/></button><AvatarViewer attributes={attributes} isElite={isElite} muscleHeatmap={muscleHeatmap} /></div></Suspense>}
        {showArmory && <Suspense fallback={<LoadingFallback/>}><EquipmentArmory onClose={() => setShowArmory(false)} /></Suspense>}
        {showSettings && <Suspense fallback={null}><SettingsModal onClose={() => setShowSettings(false)} onSave={saveSettings} initialSettings={settings} /></Suspense>}
        {showValhalla && <Suspense fallback={null}><ValhallaGate isOpen={showValhalla} onClose={() => setShowValhalla(false)} heroName={settings.heroName} onBind={handleValhallaBind} syncPayload={valhallaPayload} /></Suspense>}
        {showMindfulness && <Suspense fallback={null}><MindfulnessModal onClose={() => setShowMindfulness(false)} onSave={refreshMeditationLogs} /></Suspense>}

        {/* HEADER */}
        <header className="p-6 border-b-2 border-[#46321d] flex items-center justify-between bg-[#111] text-[#c79c6e]">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#46321d] rounded border-2 border-[#c79c6e] flex items-center justify-center shadow-lg">
                    <LayoutGrid className="text-[#c79c6e] w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase text-[#c79c6e] text-shadow-sm">IronForge</h1>
                    <p className="text-xs text-[#8a6b48] font-sans tracking-widest">Level {level} Titan</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={() => setShowGeminiLive(!showGeminiLive)} className={`p-2 transition-colors border rounded ${showGeminiLive ? 'text-purple-400 border-purple-500 bg-purple-900/20' : 'text-zinc-600 border-zinc-800 bg-zinc-900 hover:text-purple-400'}`} title="AI Coach (Live)">
                    <Bot className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-zinc-800 mx-2"></div>
                <button onClick={() => setShowValhalla(true)} className="p-2 text-zinc-600 hover:text-cyan-400 transition-colors bg-zinc-900 border border-zinc-800 rounded">
                    <Cloud className="w-5 h-5" />
                </button>
                <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-600 hover:text-[#c79c6e] transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setShowCharSheet(true)} className="w-10 h-10 rounded-full border-2 border-[#ffd700] bg-[#1a1a1a] flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    <User className="w-5 h-5 text-[#ffd700]" />
                </button>
            </div>
        </header>

        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8 animate-fade-in pb-20">
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button onClick={() => setShowDungeonBuilder(true)} className="bg-[#1a1a1a] p-4 rounded border border-zinc-800 hover:border-[#c79c6e] flex flex-col items-center gap-2 group transition-all">
                    <Hammer className="w-8 h-8 text-zinc-500 group-hover:text-[#c79c6e]" />
                    <span className="text-xs font-bold uppercase text-zinc-400">Builder</span>
                </button>
                <button onClick={() => setShowGuildHall(true)} className="bg-[#1a1a1a] p-4 rounded border border-zinc-800 hover:border-indigo-500 flex flex-col items-center gap-2 group transition-all">
                    <Users className="w-8 h-8 text-zinc-500 group-hover:text-indigo-500" />
                    <span className="text-xs font-bold uppercase text-zinc-400">Guild</span>
                </button>
                <button onClick={() => setShowArmory(true)} className="bg-[#1a1a1a] p-4 rounded border border-zinc-800 hover:border-zinc-400 flex flex-col items-center gap-2 group transition-all">
                    <Box className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300" />
                    <span className="text-xs font-bold uppercase text-zinc-400">Armory</span>
                </button>
                <button onClick={() => setShowAvatar(true)} className="bg-[#1a1a1a] p-4 rounded border border-zinc-800 hover:border-green-500 flex flex-col items-center gap-2 group transition-all">
                    <Video className="w-8 h-8 text-zinc-500 group-hover:text-green-500" />
                    <span className="text-xs font-bold uppercase text-zinc-400">Avatar</span>
                </button>
                <button onClick={() => setShowSkillTree(true)} className="bg-[#1a1a1a] p-4 rounded border border-zinc-800 hover:border-[#ffd700] flex flex-col items-center gap-2 group transition-all">
                    <Network className="w-8 h-8 text-zinc-500 group-hover:text-[#ffd700]" />
                    <span className="text-xs font-bold uppercase text-zinc-400">Talents</span>
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
                <h2 className="text-[#46321d] text-sm font-bold uppercase tracking-widest border-b border-[#46321d]/30 pb-2 flex items-center gap-2">
                    <Map className="w-4 h-4" /> Campaign Map
                </h2>
                <QuestLog sessions={availableSessions} history={historyLogs} onSelectSession={setActiveSessionId} level={level} />
            </div>
        </main>
        </div>
      </SkillProvider>
    </AchievementContext.Provider>
  );
}

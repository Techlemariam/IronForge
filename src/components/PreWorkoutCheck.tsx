
import React, { useState, useEffect } from 'react';
import { Activity, Battery, ShieldAlert, CheckCircle2, Moon, Lock, RefreshCw, Zap, Wifi, Wind, X } from 'lucide-react';
import { Session, AppSettings } from '../types';
import { autoRegulateSession, playSound } from '../utils';
import { intervalsClient } from '../services/intervals';
import { useSkills } from '../context/SkillContext';
import { StorageService } from '../services/storage';

interface PreWorkoutCheckProps {
    session: Session;
    onProceed: (finalSession: Session) => void;
    onCancel: () => void;
}

const PreWorkoutCheck: React.FC<PreWorkoutCheckProps> = ({ session, onProceed, onCancel }) => {
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'COMPLETE'>('IDLE');
    const [bodyBattery, setBodyBattery] = useState<number | null>(null);
    const [sleepScore, setSleepScore] = useState<number | null>(null);
    const [isCompromised, setIsCompromised] = useState(false);
    const [isRested, setIsRested] = useState(false);
    const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

    const [dataSource, setDataSource] = useState<'SIMULATION' | 'INTERVALS'>('SIMULATION');

    // --- RPG SKILLS ---
    const { purchasedSkillIds } = useSkills();
    const hasFatigueShroud = purchasedSkillIds.has('wind_1'); // 10% tolerance buff

    const runScan = async (forceLow = false) => {
        setStatus('SCANNING');
        playSound('quest_accept');

        let realData = null;

        try {
            // Use StorageService to get settings (Async)
            const settings = await StorageService.getState<AppSettings>('settings');

            if (navigator.onLine) {
                const today = new Date().toISOString().split('T')[0];
                const wellness = await intervalsClient.getWellness(today);
                realData = { bodyBattery: wellness.bodyBattery || 0, sleepScore: wellness.sleepScore || 0 };
                if (realData) setDataSource('INTERVALS');
            }
        } catch (e) {
            console.error("Scan failed or settings not found", e);
        }

        if (!realData) {
            setDataSource('SIMULATION');
            // Artificial delay for "Scanning" effect feel
            await new Promise(r => setTimeout(r, 1500));

            const bb = forceLow ? 24 : 85;
            const sleep = forceLow ? 45 : 92;
            realData = { bodyBattery: bb, sleepScore: sleep };
        }

        setBodyBattery(realData.bodyBattery);
        setSleepScore(realData.sleepScore);

        // RESTED LOGIC
        // BodyBattery > 80 AND Sleep > 85
        const rested = (realData.bodyBattery || 0) > 80 && (realData.sleepScore || 0) > 85;
        setIsRested(rested);
        if (rested) playSound('ding');

        // FATIGUED LOGIC WITH SKILL MODIFIER
        // Base Threshold: 30. With Shroud: 20.
        const fatigueThreshold = hasFatigueShroud ? 20 : 30;
        const compromised = (realData.bodyBattery || 0) < fatigueThreshold || (realData.sleepScore || 0) < 50;

        setIsCompromised(compromised);
        setStatus('COMPLETE');
    };

    const handleOverrideClick = () => {
        if (isCompromised) {
            setShowOverrideConfirm(true);
        } else {
            onProceed(session);
        }
    };

    const engageProtocol = () => {
        onProceed(autoRegulateSession(session));
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] text-white animate-fade-in relative font-serif">

            {showOverrideConfirm && (
                <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-[#111] border-2 border-red-900 rounded-lg p-6 max-w-sm w-full shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                        <div className="flex items-center gap-3 text-red-500 mb-4 border-b border-red-900/50 pb-4">
                            <ShieldAlert className="w-8 h-8" />
                            <h2 className="text-xl font-bold uppercase">Critical Warning</h2>
                        </div>
                        <p className="text-zinc-400 mb-6 leading-relaxed font-sans text-sm">
                            Your fatigue levels suggest high injury risk. Are you sure you want to proceed without volume regulation?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => onProceed(session)}
                                className="w-full py-4 bg-red-900/20 border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white font-bold uppercase tracking-widest rounded transition-all"
                            >
                                Confirm Override
                            </button>
                            <button
                                onClick={() => setShowOverrideConfirm(false)}
                                className="w-full py-3 text-zinc-500 hover:text-white font-mono text-xs uppercase"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-200">
                    <Activity className="w-5 h-5 text-zinc-500" />
                    Spirit Healer Link
                </h2>
                <button
                    onClick={onCancel}
                    className="text-zinc-500 hover:text-white transition-colors p-2"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">

                {status === 'IDLE' && (
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 rounded-full border-2 border-zinc-800 flex items-center justify-center mx-auto bg-zinc-900">
                            <Zap className="w-10 h-10 text-zinc-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold uppercase text-[#c79c6e]">Check Vitality</h1>
                            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2 font-sans">
                                Scan recovery metrics to determine XP bonus and fatigue state.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={() => runScan(false)} className="px-8 py-3 bg-[#c79c6e] text-[#46321d] border border-[#46321d] font-bold uppercase tracking-widest rounded hover:brightness-110 transition-all shadow-lg">
                                Cast Scan
                            </button>
                            <button onClick={() => runScan(true)} className="px-6 py-2 text-xs text-zinc-700 font-sans uppercase hover:text-zinc-500">
                                (Simulate Fatigue)
                            </button>
                        </div>
                    </div>
                )}

                {status === 'SCANNING' && (
                    <div className="text-center space-y-6">
                        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                            <RefreshCw className="w-10 h-10 text-blue-500 animate-pulse" />
                        </div>
                        <div className="space-y-1 font-serif text-xs uppercase text-blue-400">
                            <p>Communing with Spirits...</p>
                            <p className="text-[10px] text-zinc-600 font-sans">Connecting to Intervals.icu...</p>
                        </div>
                    </div>
                )}

                {status === 'COMPLETE' && bodyBattery !== null && sleepScore !== null && (
                    <div className="w-full max-w-md space-y-6 animate-fade-in">

                        <div className="flex justify-center">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${dataSource === 'INTERVALS' ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>
                                <Wifi className="w-3 h-3" />
                                Source: {dataSource}
                            </div>
                        </div>

                        {/* SKILL PROC VISUALIZATION */}
                        {hasFatigueShroud && (
                            <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                                <Wind className="w-4 h-4" />
                                Fatigue Shroud Active (+10% Tol.)
                            </div>
                        )}

                        {isRested && (
                            <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded text-center">
                                <h3 className="text-blue-400 font-bold uppercase text-lg tracking-widest animate-pulse">Rested State Active</h3>
                                <p className="text-blue-200/60 text-xs font-sans mt-1">XP Gain increased by 200% for this quest.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded border-2 bg-zinc-900 ${bodyBattery < 30 ? 'border-red-900 text-red-500' : 'border-zinc-800 text-[#1eff00]'}`}>
                                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                    <Battery className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Stamina</span>
                                </div>
                                <span className="text-3xl font-black">{bodyBattery}</span>
                            </div>
                            <div className={`p-4 rounded border-2 bg-zinc-900 ${sleepScore < 50 ? 'border-red-900 text-red-500' : 'border-zinc-800 text-[#1eff00]'}`}>
                                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                    <Moon className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Rest</span>
                                </div>
                                <span className="text-3xl font-black">{sleepScore}</span>
                            </div>
                        </div>

                        {isCompromised ? (
                            <div className="bg-[#111] p-4 rounded border border-red-900/50">
                                <h3 className="flex items-center gap-2 text-red-500 font-bold uppercase text-sm mb-3">
                                    <ShieldAlert className="w-4 h-4" />
                                    Debuff: Exhaustion
                                </h3>
                                <p className="text-zinc-400 text-sm mb-4 leading-relaxed font-sans">
                                    Vitality is critically low. Recommended action is to downgrade quest difficulty to &apos;Survival&apos;.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={engageProtocol}
                                        className="w-full py-4 bg-red-900 hover:bg-red-800 text-white font-bold uppercase tracking-widest rounded border border-red-950 shadow-lg"
                                    >
                                        Accept Debuff (Volume Cap)
                                    </button>
                                    <button
                                        onClick={handleOverrideClick}
                                        className="w-full py-3 text-red-700 hover:text-red-500 font-sans text-xs font-bold uppercase"
                                    >
                                        Ignore Warning
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-center text-zinc-500 font-sans text-sm">Your spirit is willing. Proceed to the quest.</p>
                                <button
                                    onClick={() => {
                                        playSound('quest_accept');
                                        onProceed(session);
                                    }}
                                    className="w-full py-4 bg-[#c79c6e] hover:bg-[#d4a87a] text-[#46321d] border-2 border-[#46321d] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                                >
                                    Accept Quest
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreWorkoutCheck;

'use client';

import React from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';

interface VoiceCommandPresenterProps {
    isListening: boolean;
    transcript: string;
    isProcessing: boolean;
    error: string | null;
    onToggleListening: () => void;
    onSubmit: () => Promise<void>;
}

export function VoiceCommandPresenter({
    isListening,
    transcript,
    isProcessing,
    error,
    onToggleListening,
    onSubmit
}: VoiceCommandPresenterProps) {
    return (
        <div className="flex flex-col space-y-4 p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {isListening && (
                            <span className="absolute -inset-1 rounded-full bg-red-500/50 animate-ping" />
                        )}
                        <button
                            onClick={onToggleListening}
                            disabled={isProcessing}
                            aria-label={isListening ? "Stop listening" : "Start listening"}
                            className={`relative p-3 rounded-full transition-all duration-300 ${isListening
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                                }`}
                        >
                            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                    </div>
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            Direct Voice Command
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                        </h3>
                        <p className="text-xs text-slate-400">
                            {isListening ? 'Lyssnar på dina instruktioner...' : 'Klicka på mikrofonen för att diktera order.'}
                        </p>
                    </div>
                </div>

                {transcript && !isListening && (
                    <button
                        onClick={onSubmit}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Skicka Order
                    </button>
                )}
            </div>

            {transcript && (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm italic text-slate-300">
                        &quot;{transcript}&quot;
                        {isListening && <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />}
                    </p>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400 font-medium">{error}</p>
            )}
        </div>
    );
}

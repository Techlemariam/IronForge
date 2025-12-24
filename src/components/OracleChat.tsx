'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Brain, X, MessageSquare, Terminal } from 'lucide-react';
import { ProgramGenerator } from './ProgramGenerator';

interface OracleChatProps {
    context?: any;
}

export const OracleChat: React.FC<OracleChatProps> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProgramGenerator, setShowProgramGenerator] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        body: {
            context,
            userId: context?.userId
        },
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: "Identity confirmed. I am the Oracle. Speak, Titan, and I shall guide your evolution. What metrics weigh upon your spirit today?"
            }
        ]
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl z-50 flex items-center gap-2 group border border-white/20"
            >
                <MessageSquare className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
                    Whisper Mode
                </span>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">THE IRON ORACLE</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Whisper Mode Active</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full text-zinc-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                        >
                            {messages.map((m: any) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800 border border-white/10'
                                            }`}>
                                            {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white/5 text-zinc-100 border border-white/5 rounded-tl-none font-medium'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-white/5 text-zinc-400 italic text-xs animate-pulse">
                                            Consulting the Metric Planes...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
                            <div className="relative group">
                                <input
                                    value={input}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '/program') {
                                            setShowProgramGenerator(true);
                                            handleInputChange({ ...e, target: { ...e.target, value: '' } });
                                            setIsOpen(false);
                                            return;
                                        }
                                        handleInputChange(e);
                                    }}
                                    placeholder="Ask the Oracle... (/program for generator)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!input || isLoading}
                                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:bg-zinc-700 transition-all hover:bg-indigo-500"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProgramGenerator isOpen={showProgramGenerator} onClose={() => setShowProgramGenerator(false)} />
        </>
    );
};

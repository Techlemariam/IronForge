'use client';

import { ProgramGenerator } from '@/features/training/components/ProgramGenerator';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, MessageSquare, Send, Sparkles, User, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface OracleChatProps {
  context?: Record<string, unknown> & { userId?: string };
}

export const OracleChat: React.FC<OracleChatProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProgramGenerator, setShowProgramGenerator] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Identity confirmed. I am the Oracle. Speak, Titan, and I shall guide your evolution. What metrics weigh upon your spirit today?',
    },
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      if (!response.ok) throw new Error('Oracle is unreachable');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      let accumulatedResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Ollama /api/chat stream:true returns a sequence of JSON objects
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              accumulatedResponse += json.message.content;
              setMessages((prev) => 
                prev.map(m => m.id === assistantMessageId ? { ...m, content: accumulatedResponse } : m)
              );
            }
          } catch (e) {
            // Handle cases where chunk might not be a full JSON line
            console.warn('Chunk parse error', e);
          }
        }
      }
    } catch (error) {
      console.error('Oracle Chat Error:', error);
      setMessages((prev) => [...prev, { 
        id: 'error-' + Date.now(), 
        role: 'assistant', 
        content: 'The connection to the Oracle is unstable. Ensure local services are active.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        data-testid="oracle-chat-trigger"
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
            data-testid="oracle-chat-panel"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[37.5rem] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
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
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                      Local Inference Active
                    </span>
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800 border border-white/10'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <div
                      data-testid="oracle-message"
                      className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white/5 text-zinc-100 border border-white/5 rounded-tl-none font-medium'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && !messages[messages.length-1].content && (
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
                      setInput('');
                      setIsOpen(false);
                      return;
                    }
                    setInput(val);
                  }}
                  disabled={isLoading}
                  placeholder="Ask the Oracle... (/program for generator)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600 disabled:opacity-50"
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

      <ProgramGenerator
        isOpen={showProgramGenerator}
        onClose={() => setShowProgramGenerator(false)}
      />
    </>
  );
};

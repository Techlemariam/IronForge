
import React, { useState, useEffect } from 'react';
import { X, Save, Database, Key, User, Dumbbell, Cloud, Lightbulb } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  initialSettings: AppSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, initialSettings }) => {
  const [apiKey, setApiKey] = useState(initialSettings.intervalsApiKey);
  const [athleteId, setAthleteId] = useState(initialSettings.intervalsAthleteId);
  const [hevyKey, setHevyKey] = useState(initialSettings.hevyApiKey || '');
  
  // Supabase Fields
  const [supabaseUrl, setSupabaseUrl] = useState(initialSettings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(initialSettings.supabaseKey || '');

  // IoT Fields
  const [hueIp, setHueIp] = useState(initialSettings.hueBridgeIp || '');
  const [hueUser, setHueUser] = useState(initialSettings.hueUsername || '');

  const handleSave = () => {
    onSave({
      intervalsApiKey: apiKey,
      intervalsAthleteId: athleteId,
      hevyApiKey: hevyKey,
      supabaseUrl,
      supabaseKey,
      hueBridgeIp: hueIp,
      hueUsername: hueUser
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[#111] border-2 border-[#46321d] w-full max-w-md rounded-lg shadow-[0_0_50px_rgba(184,134,11,0.2)] overflow-hidden font-serif">
        
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#333] flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#c79c6e]">
            <Database className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-widest text-sm">System Configuration</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* IoT Section */}
          <div className="space-y-4">
             <h3 className="text-[#ffd700] text-xs font-bold uppercase tracking-widest border-b border-yellow-900/50 pb-2">Smart Gym (IoT)</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> Bridge IP
                    </label>
                    <input 
                        type="text" 
                        value={hueIp}
                        onChange={(e) => setHueIp(e.target.value)}
                        placeholder="192.168.1.X"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-[#ffd700] focus:outline-none font-mono text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> Hue User
                    </label>
                    <input 
                        type="password" 
                        value={hueUser}
                        onChange={(e) => setHueUser(e.target.value)}
                        placeholder="API Username"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-[#ffd700] focus:outline-none font-mono text-sm"
                    />
                </div>
             </div>
          </div>

          {/* Supabase (Valhalla) Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
             <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest border-b border-cyan-900/50 pb-2">Valhalla (Supabase Cloud)</h3>
             <div className="space-y-2">
                <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Cloud className="w-3 h-3" /> Project URL
                </label>
                <input 
                    type="text" 
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                />
             </div>
             <div className="space-y-2">
                <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Key className="w-3 h-3" /> Anon Key
                </label>
                <input 
                    type="password" 
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="public-anon-key"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                />
             </div>
          </div>

          {/* Intervals Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
             <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest border-b border-blue-900/50 pb-2">Intervals.icu (Cardio)</h3>
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Athlete ID
              </label>
              <input 
                type="text" 
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                placeholder="e.g. i123456"
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Key className="w-3 h-3" /> API Key
              </label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="found in settings > developer"
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            </div>
          </div>
          
          {/* Hevy Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
             <h3 className="text-orange-400 text-xs font-bold uppercase tracking-widest border-b border-orange-900/50 pb-2">Hevy (Strength)</h3>
             <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Dumbbell className="w-3 h-3" /> Hevy API Token
              </label>
              <input 
                type="password" 
                value={hevyKey}
                onChange={(e) => setHevyKey(e.target.value)}
                placeholder="Personal Access Token"
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-orange-500 focus:outline-none font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1a1a1a] border-t border-[#333] flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#c79c6e] hover:bg-[#d4a87a] text-[#46321d] px-6 py-2 rounded font-bold uppercase tracking-wider text-xs transition-colors shadow-lg active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

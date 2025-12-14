
import React from 'react';
import { IntervalsWellness, TTBIndices } from '../types';
import { Lock, CheckCircle2, Scroll, Sword } from 'lucide-react';

interface CampaignTrackerProps {
  wellness: IntervalsWellness | null;
  ttb: TTBIndices | null;
  level: number;
}

export const CampaignTracker: React.FC<CampaignTrackerProps> = ({ wellness, ttb, level }) => {
    // Logic for Phase 1 progress (The Rites of Initiation)
    // Goal: Consistency (Level), Base Fitness (CTL), Stability (Wellness)
    const wellnessScore = ttb?.wellness || 0;
    const ctl = wellness?.ctl || 0;
    
    // Hardcoded requirements for Phase 1 -> Phase 2
    const phase1Progress = [
        { 
            label: "Establish Base Resilience (CTL > 15)", 
            completed: ctl >= 15, 
            current: `${ctl} / 15`,
            icon: "🛡️"
        },
        { 
            label: "Stabilize Recovery (Wellness > 80)", 
            completed: wellnessScore >= 80, 
            current: `${wellnessScore} / 80`,
            icon: "❤️"
        },
        { 
            label: "Prove Consistency (Reach Level 5)", 
            completed: level >= 5, 
            current: `Lvl ${level} / 5`,
            icon: "⚔️"
        }
    ];
    
    const isPhase1Complete = phase1Progress.every(p => p.completed);

    return (
        <div className="space-y-4 animate-slide-down">
             {/* Campaign Header */}
             <div className="flex items-center gap-2 text-[#c79c6e] border-b border-[#46321d]/50 pb-2 mb-2">
                <Scroll className="w-5 h-5" />
                <h2 className="text-sm font-bold uppercase tracking-widest">The Grand Campaign</h2>
             </div>

             {/* Phase 1 Card (Active) */}
             <div className={`relative bg-[#1a1a1a] border-2 rounded-lg p-5 overflow-hidden group transition-colors ${isPhase1Complete ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-[#c79c6e]'}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c79c6e] mb-1">Current Act</span>
                    <div className={`px-2 py-1 border rounded text-xs font-bold flex items-center gap-1 animate-pulse ${isPhase1Complete ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-[#c79c6e]/10 border-[#c79c6e] text-[#c79c6e]'}`}>
                        <Sword className="w-3 h-3" />
                        {isPhase1Complete ? 'Gate Unlocked' : 'Active'}
                    </div>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 relative z-10">Act I: The Rites of Initiation</h3>
                <p className="text-zinc-400 text-xs font-serif italic mb-4 max-w-md relative z-10">
                    "Before a Titan can carry the weight of the world, they must first master the weight of their own spirit. Build the foundation."
                </p>

                {/* Attunement Gate Requirements */}
                <div className="bg-black/40 rounded p-3 border border-zinc-800 relative z-10">
                    <div className="text-[10px] font-bold uppercase text-zinc-500 mb-2 flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        Attunement Gate (Requirements to Advance)
                    </div>
                    <div className="space-y-2">
                        {phase1Progress.map((req, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    {req.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[8px]">{req.icon}</div>}
                                    <span className={req.completed ? 'text-zinc-300 line-through decoration-zinc-600' : 'text-zinc-400'}>{req.label}</span>
                                </div>
                                <span className={`font-mono ${req.completed ? 'text-green-500' : 'text-zinc-600'}`}>{req.current}</span>
                            </div>
                        ))}
                    </div>
                </div>
             </div>

             {/* Future Phases (Locked) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60 grayscale select-none">
                 <div className="bg-[#111] border border-zinc-800 rounded p-4 flex items-center gap-3">
                    <div className="p-3 bg-zinc-900 rounded border border-zinc-700">
                        <Lock className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                        <h4 className="text-zinc-500 font-bold uppercase text-xs">Act II</h4>
                        <div className="text-zinc-300 font-serif font-bold text-sm">The Basalt Bastion</div>
                    </div>
                 </div>
                 <div className="bg-[#111] border border-zinc-800 rounded p-4 flex items-center gap-3">
                    <div className="p-3 bg-zinc-900 rounded border border-zinc-700">
                        <Lock className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                        <h4 className="text-zinc-500 font-bold uppercase text-xs">Act III</h4>
                        <div className="text-zinc-300 font-serif font-bold text-sm">The Elite Crucible</div>
                    </div>
                 </div>
             </div>
        </div>
    );
};

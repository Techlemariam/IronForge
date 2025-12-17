
import React from 'react';
import { IntervalsWellness, TTBIndices } from '../types';
import { Lock, CheckCircle2, Scroll } from 'lucide-react';

interface CampaignTrackerProps {
  wellness: IntervalsWellness | null;
  ttb: TTBIndices | null;
  level: number;
}

export const CampaignTracker: React.FC<CampaignTrackerProps> = ({ wellness, ttb, level }) => {
    const wellnessScore = ttb?.wellness || 0;
    const ctl = wellness?.ctl || 0;

    const phase1Progress = [
        { 
            label: "Establish Base Resilience (CTL > 15)", 
            completed: ctl >= 15, 
            current: `${ctl} / 15`,
        },
        { 
            label: "Stabilize Recovery (Wellness > 80)", 
            completed: wellnessScore >= 80, 
            current: `${wellnessScore} / 80`,
        },
        { 
            label: "Prove Consistency (Reach Level 5)", 
            completed: level >= 5, 
            current: `Lvl ${level} / 5`,
        }
    ];
    
    const isPhase1Complete = phase1Progress.every(p => p.completed);

    return (
        <div className="border-2 border-gray-600 rounded-lg p-4 h-full">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-600 pb-2 mb-3">
                <div className="flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-gray-400" />
                    <h2 className="font-bold uppercase tracking-widest text-gray-300 text-sm">The Grand Campaign</h2>
                </div>
                <span className="border border-yellow-400 text-yellow-400 font-bold text-xs uppercase rounded px-2 py-0.5">{isPhase1Complete ? 'Complete' : 'Active'}</span>
            </div>

            {/* Current Act Details */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">Act I: The Rites of Initiation</h3>
                <p className="text-gray-400 text-xs italic max-w-xl">
                    "Before a Titan can carry the weight of the world, they must first master the weight of their own spirit. Build the foundation."
                </p>
            </div>

            {/* Attunement Gate */}
            <div className="border border-gray-600 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <h4 className="font-bold uppercase text-xs text-gray-300">Attunement Gate (Requirements to Advance)</h4>
                </div>
                <div className="space-y-1.5">
                    {phase1Progress.map((req, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {req.completed ? 
                                 <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                                 <div className="w-4 h-4 rounded-full border-2 border-gray-500" />}
                                <span className="text-gray-300 text-xs">{req.label}</span>
                            </div>
                            <span className="font-mono text-xs text-gray-500">{req.current}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Future Acts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="border border-gray-600 rounded p-3 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <div>
                        <h4 className="text-gray-500 font-bold uppercase text-xs">Act II</h4>
                        <p className="font-bold text-sm text-gray-300">The Basalt Bastion</p>
                    </div>
                </div>
                <div className="border border-gray-600 rounded p-3 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <div>
                        <h4 className="text-gray-500 font-bold uppercase text-xs">Act III</h4>
                        <p className="font-bold text-sm text-gray-300">The Elite Crucible</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

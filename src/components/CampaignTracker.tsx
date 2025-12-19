
import React from 'react';
import { IntervalsWellness, TTBIndices } from '../types';
import { Lock, CheckCircle2, Scroll } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';
import { cn } from '../lib/utils';

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

    const cardStyle = cn(
        "bg-forge-900 border-2 rounded-lg p-4 h-full transition-all duration-300",
        {
            "border-rarity-legendary shadow-legendary-glow animate-pulse-glow": !isPhase1Complete,
            "border-forge-border": isPhase1Complete
        }
    )

    return (
        <div className={cardStyle}>
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-forge-border pb-2 mb-3">
                <div className="flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-rarity-legendary" />
                    <h2 className="font-bold uppercase tracking-widest text-warrior-light text-sm">The Grand Campaign</h2>
                </div>
                <span className={`border ${isPhase1Complete ? 'border-rarity-legendary text-rarity-legendary' : 'border-warrior text-warrior'} font-bold text-xs uppercase rounded px-2 py-0.5`}>
                    {isPhase1Complete ? 'Complete' : 'Active'}
                </span>
            </div>

            {/* Current Act Details */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">Act I: The Rites of Initiation</h3>
                <p className="text-rarity-common text-xs italic max-w-xl">
                    "Before a Titan can carry the weight of the world, they must first master the weight of their own spirit. Build the foundation."
                </p>
            </div>

            {/* Attunement Gate */}
            <Alert className="bg-forge-800 border-forge-border">
                <Lock className="w-4 h-4 text-warrior" />
                <AlertTitle className="font-bold uppercase text-xs text-warrior">Attunement Gate (Requirements to Advance)</AlertTitle>
                <AlertDescription>
                    <div className="space-y-1.5 mt-2">
                        {phase1Progress.map((req, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {req.completed ?
                                        <CheckCircle2 className="w-4 h-4 text-rarity-legendary" /> :
                                        <div className="w-4 h-4 rounded-full border-2 border-rarity-common" />}
                                    <span className="text-rarity-common text-xs">{req.label}</span>
                                </div>
                                <span className="font-mono text-xs text-rarity-common">{req.current}</span>
                            </div>
                        ))}
                    </div>
                </AlertDescription>
            </Alert>

            {/* Future Acts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                <div className="bg-forge-800 border border-forge-border rounded p-3 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-rarity-common" />
                    <div>
                        <h4 className="text-rarity-common font-bold uppercase text-xs">Act II</h4>
                        <p className="font-bold text-sm text-white">The Basalt Bastion</p>
                    </div>
                </div>
                <div className="bg-forge-800 border border-forge-border rounded p-3 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-rarity-common" />
                    <div>
                        <h4 className="text-rarity-common font-bold uppercase text-xs">Act III</h4>
                        <p className="font-bold text-sm text-white">The Elite Crucible</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

'use client';

import React, { useState } from 'react';
import { Challenge, UserChallenge, ChallengeType } from '@prisma/client';
import { ChallengeRewards, claimChallengeAction } from '@/actions/challenges';
import { Scroll, Trophy, Zap, Coins, CheckCircle, Lock } from 'lucide-react';
import { playSound } from '@/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export type ChallengeWithStatus = Omit<Challenge, 'criteria' | 'rewards'> & {
    userStatus: UserChallenge | { progress: number; completed: boolean; claimed: boolean };
    criteria: any; // Typed in Action, but Prisma returns Json
    rewards: any;
};

interface QuestBoardProps {
    challenges: ChallengeWithStatus[];
    onClaimSuccess: (gold: number) => void;
}

const RewardBadge: React.FC<{ type: 'xp' | 'gold' | 'kinetic'; value: number }> = ({ type, value }) => {
    const icons = {
        xp: <Trophy className="w-3 h-3 text-purple-400" />,
        gold: <Coins className="w-3 h-3 text-yellow-400" />,
        kinetic: <Zap className="w-3 h-3 text-blue-400" />
    };
    const colors = {
        xp: 'text-purple-300 bg-purple-900/40 border-purple-800',
        gold: 'text-yellow-300 bg-yellow-900/40 border-yellow-800',
        kinetic: 'text-blue-300 bg-blue-900/40 border-blue-800'
    };

    return (
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-xs font-mono ${colors[type]}`}>
            {icons[type]}
            <span>{value}</span>
        </div>
    );
};

const ChallengeCard: React.FC<{ challenge: ChallengeWithStatus; onClaim: (id: string) => void; isClaiming: boolean }> = ({ challenge, onClaim, isClaiming }) => {
    const { title, description, userStatus, rewards, criteria } = challenge;
    const progress = userStatus.progress || 0;
    const target = criteria.target || 1;
    const percent = Math.min(100, (progress / target) * 100);
    const isCompleted = userStatus.completed || percent >= 100;
    const isClaimed = userStatus.claimed;

    const r = rewards as ChallengeRewards;

    return (
        <div className={`relative p-4 rounded-lg border transition-all duration-300 ${isCompleted ? 'bg-gradient-to-br from-slate-900 to-green-950/20 border-green-800/50' : 'bg-black/40 border-slate-800'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className={`font-bold uppercase tracking-wide ${isCompleted ? 'text-green-400' : 'text-slate-200'}`}>{title}</h4>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
                {isClaimed && <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />}
            </div>

            {/* Progress Bar */}
            <div className="mt-3 mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-mono">
                    <span>PROGRESS</span>
                    <span>{progress} / {target} {criteria.unit}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-600'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {/* Rewards & Action */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-2">
                    {r.xp > 0 && <RewardBadge type="xp" value={r.xp} />}
                    {r.gold > 0 && <RewardBadge type="gold" value={r.gold} />}
                    {r.kinetic > 0 && <RewardBadge type="kinetic" value={r.kinetic} />}
                </div>

                {isCompleted && !isClaimed && (
                    <button
                        onClick={() => onClaim(challenge.id)}
                        disabled={isClaiming}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold uppercase rounded shadow-lg animate-pulse hover:animate-none transition-colors flex items-center space-x-1"
                    >
                        {isClaiming ? <LoadingSpinner size="sm" /> : <span>Claim Bounty</span>}
                    </button>
                )}
                {isClaimed && <span className="text-xs text-green-600 font-mono uppercase">Claimed</span>}
                {!isCompleted && <Lock className="w-4 h-4 text-slate-700" />}
            </div>
        </div>
    );
};

export const QuestBoard: React.FC<QuestBoardProps> = ({ challenges, onClaimSuccess }) => {
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const handleClaim = async (id: string) => {
        setClaimingId(id);
        playSound('ui_click'); // Or specific claim sound
        try {
            const result = await claimChallengeAction(id);
            if (result.success) {
                playSound('achievement'); // Reward sound
                onClaimSuccess(result.newGold);
            }
        } catch (e) {
            console.error("Claim Failed", e);
            playSound('ui_error');
        } finally {
            setClaimingId(null);
        }
    };

    const daily = challenges.filter(c => c.type === 'DAILY');
    const weekly = challenges.filter(c => c.type === 'WEEKLY');

    if (challenges.length === 0) return null;

    return (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-800 pb-2">
                <Scroll className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold uppercase tracking-widest text-amber-100">Active Bounties</h3>
                <span className="text-xs text-amber-700 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/50 ml-auto">
                    Weekly Reset: Sunday
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Daily Priorities</h4>
                    {daily.length > 0 ? daily.map(c => (
                        <ChallengeCard key={c.id} challenge={c} onClaim={handleClaim} isClaiming={claimingId === c.id} />
                    )) : (
                        <p className="text-xs text-slate-600 italic p-2">No daily bounties available.</p>
                    )}
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Weekly Objectives</h4>
                    {weekly.length > 0 ? weekly.map(c => (
                        <ChallengeCard key={c.id} challenge={c} onClaim={handleClaim} isClaiming={claimingId === c.id} />
                    )) : (
                        <p className="text-xs text-slate-600 italic p-2">No weekly objectives available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

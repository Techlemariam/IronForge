'use client';

import React from 'react';
import { useSkills } from '../context/SkillContext';
import { Shield, Wind, TrendingUp, Zap, Sparkles, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PATH_ICONS: Record<string, React.ReactNode> = {
    juggernaut: <Shield size={16} />,
    engine: <Wind size={16} />,
    warden: <Zap size={16} />,
    titan: <TrendingUp size={16} />,
    sage: <Sparkles size={16} />
};

const PATH_COLORS: Record<string, string> = {
    juggernaut: 'bg-red-600',
    engine: 'bg-cyan-500',
    warden: 'bg-green-500',
    titan: 'bg-orange-500',
    sage: 'bg-purple-500'
};

export const PathProgressWidget: React.FC = () => {
    const { pathProgress, activeKeystoneId, calculatedEffects } = useSkills();

    // Sort paths by progress (highest first)
    const sortedPaths = Object.entries(pathProgress)
        .sort(([, a], [, b]) => b - a)
        .filter(([, p]) => p > 0); // Only show active paths

    if (sortedPaths.length === 0) {
        return (
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-xs text-center">No active path progress</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Path Mastery
            </h3>

            <div className="space-y-3">
                {sortedPaths.map(([path, progress]) => (
                    <div key={path} className="group cursor-default">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 text-zinc-300">
                                <span className={`p-1 rounded bg-zinc-900 ${activeKeystoneId?.includes(path) ? 'text-yellow-500' : ''}`}>
                                    {PATH_ICONS[path]}
                                </span>
                                <span className="text-xs font-bold uppercase">{path}</span>
                            </div>
                            <span className="text-xs font-mono text-zinc-500">{Math.round(progress)}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={`h-full ${PATH_COLORS[path]} shadow-[0_0_10px_currentColor]`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Keystone Indicator */}
            {activeKeystoneId && (
                <div className="mt-4 pt-4 border-t border-zinc-900">
                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-950/20 p-2 rounded border border-yellow-900/30">
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping bg-yellow-500 rounded-full opacity-20"></div>
                            <Check size={16} />
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] font-bold uppercase text-yellow-700">Active Keystone</div>
                            <div className="text-xs font-bold">
                                {activeKeystoneId.replace('keystone_', '').replace('_', ' ').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

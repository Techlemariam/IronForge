import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, HeartCrack, Flame } from 'lucide-react';
import { TitanState } from '@/actions/titan';

interface TitanAvatarProps {
    titan: TitanState | null | undefined;
}

export const TitanAvatar: React.FC<TitanAvatarProps> = ({ titan }) => {
    if (!titan) {
        return (
            <div className="w-full text-center p-4 animate-pulse text-forge-muted">
                Summoning Titan...
            </div>
        );
    }

    const { mood, energy, isResting, name, level } = titan;

    // Visual Logic
    let statusIcon = <Flame className="w-6 h-6 text-magma" />;
    let statusText = "Ready for Battle";
    let glowColor = "shadow-magma/50";
    let avatarEmoji = "🛡️"; // Default Placeholder

    if (isResting) {
        statusIcon = <Moon className="w-6 h-6 text-indigo-400" />;
        statusText = "Resting (Recovering Energy)";
        glowColor = "shadow-indigo-500/50";
        avatarEmoji = "😴";
    } else if (mood === 'WEAKENED') {
        statusIcon = <HeartCrack className="w-6 h-6 text-red-500" />;
        statusText = "Weakened (Needs Maintenance)";
        glowColor = "shadow-red-500/50";
        avatarEmoji = "❤️‍🩹";
    } else if (mood === 'FOCUSED') {
        statusIcon = <Zap className="w-6 h-6 text-yellow-400" />;
        statusText = "FOCUSED (XP Bonus Active)";
        glowColor = "shadow-yellow-500/50";
        avatarEmoji = "⚡";
    }

    return (
        <div className={`col-span-full bg-linear-to-b from-zinc-900 to-black border border-white/10 rounded-xl p-6 relative overflow-hidden shadow-lg ${glowColor} transition-all duration-500`}>
            {/* Background Ambience */}
            <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">

                {/* Avatar Visual */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
                >
                    {/* Placeholder for 3D Model / Image later */}
                    <span className="filter drop-shadow-lg">{avatarEmoji}</span>
                </motion.div>

                {/* Stats & Info */}
                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h2 className="text-2xl font-bold text-white tracking-wider uppercase">{name}</h2>
                        <span className="px-2 py-0.5 bg-magma/20 text-magma text-xs rounded border border-magma/30">LVL {level}</span>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 text-forge-300">
                        {statusIcon}
                        <span className="font-mono text-sm uppercase">{statusText}</span>
                    </div>

                    {/* Energy Bar */}
                    <div className="w-full max-w-sm h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 mt-2">
                        <motion.div
                            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, energy))}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 max-w-sm uppercase font-mono tracking-widest">
                        <span>Energy</span>
                        <span>{energy.toFixed(0)} / 100</span>
                    </div>
                </div>

                {/* Quick Actions (Future) */}
                {/* <div className="hidden md:flex flex-col gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-white uppercase tracking-widest border border-white/5 transition-colors">
                        Inspect
                    </button>
                </div> */}
            </div>
        </div>
    );
};

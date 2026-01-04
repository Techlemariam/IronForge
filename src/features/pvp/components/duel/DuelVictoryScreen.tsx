import { motion } from 'framer-motion';
import { Trophy, Swords, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Imports removed to avoid unused dependencies
// Actually, let's avoid extra deps if possible. I'll implementation a simple width/height hook or just use CSS for confetti safely or skip confetti if it's too much bloat.
// Let's stick to CSS animations and Framer Motion for "Wow" factor.

import { ExtendedDuel } from "@/app/iron-arena/ArenaClient"; // Reusing type


interface DuelVictoryScreenProps {
    duel: ExtendedDuel;
    currentUserId: string;
    onClose: () => void;
}

export function DuelVictoryScreen({ duel, currentUserId, onClose }: DuelVictoryScreenProps) {
    const isWinner = duel.winnerId === currentUserId;
    const opponent = duel.challengerId === currentUserId ? duel.defender : duel.challenger;
    const myStats = duel.challengerId === currentUserId ? (duel.challengerDistance || duel.challengerScore) : (duel.defenderDistance || duel.defenderScore);
    const opponentStats = duel.challengerId === currentUserId ? (duel.defenderDistance || duel.defenderScore) : (duel.challengerDistance || duel.challengerScore);

    // Determine stats based on duel type
    const metricLabel = duel.duelType === 'TITAN_VS_TITAN' ? 'Points' : 'Distance';
    const metricUnit = duel.duelType === 'TITAN_VS_TITAN' ? 'pts' : 'km';

    // Helper to format value
    const formatValue = (val: number) => duel.duelType !== 'TITAN_VS_TITAN' ? (val / 1000).toFixed(2) : val;

    return (
        <div className="relative w-full max-w-4xl mx-auto min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
            {/* Ambient Background */}
            <div className={`absolute inset-0 opacity-20 ${isWinner ? 'bg-amber-600' : 'bg-slate-800'}`}
                style={{ filter: 'blur(100px)' }}
            />

            <div className="relative z-10 flex flex-col items-center w-full p-8 text-center space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-2"
                >
                    <div className="flex justify-center mb-4">
                        {isWinner ? (
                            <div className="p-4 bg-amber-500/20 rounded-full ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                                <Trophy className="w-12 h-12 text-amber-500" />
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-800 rounded-full ring-2 ring-slate-700">
                                <Swords className="w-12 h-12 text-slate-400" />
                            </div>
                        )}
                    </div>

                    <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${isWinner ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600' : 'text-slate-400'
                        }`}>
                        {isWinner ? 'Victory!' : 'Defeat'}
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">
                        {isWinner ? 'You crushed your rival.' : 'You fell short this time.'}
                    </p>
                </motion.div>

                {/* Stat Comparison */}
                <div className="flex items-center justify-center gap-8 w-full max-w-lg">
                    {/* Player */}
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className={`w-20 h-20 border-4 ${isWinner ? 'border-amber-500' : 'border-slate-700'}`}>
                            <AvatarImage src={`/avatars/${currentUserId}.png`} /> {/* Placeholder */}
                            <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <span className="text-2xl font-bold font-mono">
                            {formatValue(myStats)} <span className="text-xs text-slate-500">{metricUnit}</span>
                        </span>
                    </div>

                    <div className="text-slate-600 font-black text-2xl">VS</div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-2 opacity-80">
                        <Avatar className="w-16 h-16 border-2 border-slate-700">
                            <AvatarImage src={undefined} />
                            <AvatarFallback>{opponent?.heroName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xl font-bold font-mono text-slate-400">
                            {formatValue(opponentStats)} <span className="text-xs text-slate-500">{metricUnit}</span>
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-4 pt-8">
                    <Button
                        size="lg"
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    {isWinner && (
                        <Button
                            size="lg"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shadow-lg shadow-amber-900/20"
                        >
                            <Share2 className="w-4 h-4" /> Share Victory
                        </Button>
                    )}
                    {!isWinner && (
                        <Button
                            size="lg"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2"
                        >
                            <Swords className="w-4 h-4" /> Rematch
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { getDuelArenaStateAction } from "@/actions/pvp/duel";
import { executeTitanCombatTurnAction } from "@/actions/titan-combat";
import { Swords, Trophy, Timer, Bike, Footprints, AlertTriangle, Zap, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { EmotePicker } from "@/features/pvp/components/EmotePicker";
import { EmoteOverlay, useBroadcastEmote } from "@/features/pvp/components/EmoteOverlay";

interface DuelArenaProps {
    duelId: string;
    currentUserId: string;
    onClose: () => void;
}

export function DuelArena({ duelId, currentUserId, onClose }: DuelArenaProps) {
    const [duelState, setDuelState] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [isAttacking, setIsAttacking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const { broadcastEmote } = useBroadcastEmote(duelId, duelState?.challenger?.id === currentUserId ? duelState?.challenger?.heroName : duelState?.defender?.heroName);

    // Polling logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchState = async () => {
            const result = await getDuelArenaStateAction(duelId);
            if (result.success) {
                setDuelState(result.duel);
            } else {
                toast.error("Lost connection to arena...");
            }
            setLoading(false);
        };

        // Initial fetch
        fetchState();

        // Poll every 3 seconds
        intervalId = setInterval(fetchState, 3000);

        return () => clearInterval(intervalId);
    }, [duelId]);

    const handleAttack = async () => {
        setIsAttacking(true);
        try {
            const result = await executeTitanCombatTurnAction(duelId);
            if (result.success && result.combatLog) {
                // Add combat messages to log
                setCombatLog(prev => [...result.combatLog, ...prev].slice(0, 10)); // Keep last 10
                toast.success(`You dealt ${result.damageDealt?.challenger || result.damageDealt?.defender} damage!`);

                // Refresh state
                const stateResult = await getDuelArenaStateAction(duelId);
                if (stateResult.success) {
                    setDuelState(stateResult.duel);
                }
            } else {
                toast.error(result.error || "Attack failed");
            }
        } catch (error) {
            toast.error("Combat error");
        } finally {
            setIsAttacking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4" />
                <p>Connecting to Iron Arena...</p>
            </div>
        );
    }

    if (!duelState) return null;

    const isChallenger = currentUserId === duelState.challengerId;
    const user = isChallenger ? duelState.challenger : duelState.defender;
    const opponent = isChallenger ? duelState.defender : duelState.challenger;

    const userScore = isChallenger ? duelState.challengerScore : duelState.defenderScore;
    const opponentScore = isChallenger ? duelState.defenderScore : duelState.challengerScore;

    // For Titan vs Titan, scores represent damage dealt
    const maxScore = Math.max(userScore, opponentScore, 1000);
    const userProgress = Math.min((userScore / maxScore) * 100, 100);
    const opponentProgress = Math.min((opponentScore / maxScore) * 100, 100);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={isMuted ? "text-red-500" : "text-slate-400"}
                        onClick={() => setIsMuted(!isMuted)}
                        title={isMuted ? "Unmute Emotes" : "Mute Emotes"}
                    >
                        <MessageSquare className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        onClick={onClose}
                    >
                        Exit Arena
                    </Button>
                </div>

                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 opacity-90" />
                <div className={`absolute inset-0 bg-[url('/assets/arena_bg.jpg')] bg-cover bg-center opacity-20`} />

                <div className="relative z-0 p-8 space-y-8">
                    {/* Emote Display */}
                    <EmoteOverlay
                        matchId={duelId}
                        currentUserId={currentUserId}
                        isMuted={isMuted}
                    />

                    {/* Battle Scene */}
                    <div className="relative h-80 bg-slate-950/80 rounded-2xl border border-amber-500/20 shadow-[inset_0_0_50px_rgba(0,0,0,1)] overflow-hidden">
                        {/* Background Scene */}
                        <div className="absolute inset-0 bg-[url('/assets/arena_bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                        <div className="flex justify-between items-center h-full px-12 relative">
                            {/* Left Titan (User) */}
                            <motion.div
                                initial={{ x: -200, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                className="relative w-64 h-64"
                            >
                                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                                <Image
                                    src={`/assets/game/titans/${(user?.activePath || 'WARDEN').toLowerCase()}/base.png`}
                                    alt="User Titan"
                                    fill
                                    className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    priority
                                    unoptimized
                                />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-500/20 border border-blue-500/50 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-blue-400 backdrop-blur-sm">
                                    {user.heroName || 'YOU'}
                                </div>
                            </motion.div>

                            {/* VS Effect */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-8xl font-black italic text-amber-500/20"
                                >
                                    VS
                                </motion.div>
                            </div>

                            {/* Right Titan (Opponent) */}
                            <motion.div
                                initial={{ x: 200, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                className="relative w-64 h-64 scale-x-[-1]"
                            >
                                <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
                                <Image
                                    src={`/assets/game/titans/${(opponent?.activePath || 'WARDEN').toLowerCase()}/base.png`}
                                    alt="Opponent Titan"
                                    fill
                                    className="object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                    priority
                                    unoptimized
                                />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-red-400 backdrop-blur-sm scale-x-[-1]">
                                    {opponent.heroName || 'OPPONENT'}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50 px-4 py-1 text-sm tracking-widest uppercase">
                            <Swords className="w-4 h-4 inline mr-2" />
                            Titan vs Titan
                        </Badge>
                        <h2 className="text-3xl font-black italic">COMBAT ARENA</h2>
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <Timer className="w-4 h-4" />
                            <span>Status: {duelState.status}</span>
                        </div>
                    </div>

                    {/* Score Bars */}
                    <div className="space-y-8 py-8 bg-black/40 rounded-xl p-6 border border-white/5">
                        {/* User Score */}
                        <div className="relative">
                            <div className="flex justify-between items-end mb-2 text-blue-400 font-bold uppercase tracking-wider text-sm">
                                <span>{user.heroName || "You"}</span>
                                <span>{userScore} DMG</span>
                            </div>
                            <div className="h-12 bg-slate-800 rounded-full relative overflow-hidden ring-2 ring-blue-500/20">
                                <motion.div
                                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-800 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${userProgress}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                            </div>
                        </div>

                        {/* Opponent Score */}
                        <div className="relative">
                            <div className="flex justify-between items-end mb-2 text-red-400 font-bold uppercase tracking-wider text-sm">
                                <span>{opponent.heroName || "Opponent"}</span>
                                <span>{opponentScore} DMG</span>
                            </div>
                            <div className="h-12 bg-slate-800 rounded-full relative overflow-hidden ring-2 ring-red-500/20">
                                <motion.div
                                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-800 to-red-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${opponentProgress}%` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Combat Log */}
                    <div className="bg-slate-950/50 rounded-lg p-4 h-32 overflow-y-auto border border-slate-800">
                        <div className="text-xs font-mono text-slate-400 space-y-1">
                            {combatLog.length === 0 ? (
                                <p className="text-center italic">No combat yet. Strike first!</p>
                            ) : (
                                combatLog.map((msg, i) => (
                                    <p key={i} className="animate-in fade-in slide-in-from-bottom-2">
                                        {msg}
                                    </p>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Attack & Emotes */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleAttack}
                            disabled={isAttacking || duelState.status !== "ACTIVE"}
                            className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-lg py-6 rounded-lg shadow-lg shadow-red-900/50 disabled:opacity-50"
                        >
                            {isAttacking ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                    Attacking...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 mr-2" />
                                    ATTACK
                                </>
                            )}
                        </Button>

                        <EmotePicker
                            matchId={duelId}
                            disabled={duelState.status !== "ACTIVE"}
                            onSend={(emote) => broadcastEmote(emote, currentUserId)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

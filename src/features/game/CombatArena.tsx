'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Monster } from '@/types';
import { CombatState } from '@/services/game/CombatEngine';
import { startBossFight, performCombatAction } from '@/actions/combat';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Heart, Zap, Skull, Trophy } from 'lucide-react';
import { playSound } from '@/utils'; // Assuming sound utils exist or using previously defined ones
import { LootReveal } from '@/components/game/LootReveal';
// Local type matching LootReveal's expectations
type LootItem = {
    id: string;
    name: string;
    rarity: string;
    image: string | null;
};
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CombatArenaProps {
    bossId: string;
    onClose: () => void;
}

const CombatArena: React.FC<CombatArenaProps> = ({ bossId, onClose }) => {
    const [gameState, setGameState] = useState<CombatState | null>(null);
    const [boss, setBoss] = useState<Monster | null>(null); // Use appropriate type
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    const [droppedItem, setDroppedItem] = useState<LootItem | null>(null);
    const [rewards, setRewards] = useState<{ xp: number; gold: number } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            playSound('dungeon_ambient' as any); // Setup ambient sound if available
            try {
                const res = await startBossFight(bossId);
                if (res.success && res.state && res.boss) {
                    setGameState(res.state);
                    setBoss(res.boss as any); // Type cast if needed depending on Prisma vs Frontend type
                } else {
                    console.error("Failed to start fight:", res.message);
                    alert("Failed to enter arena: " + res.message);
                    onClose();
                }
            } catch (error) {
                console.error("Combat Init Error", error);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [bossId, onClose]);

    // Auto-scroll logs
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [gameState?.logs]);

    const handleAction = async (type: 'ATTACK' | 'DEFEND' | 'HEAL' | 'ULTIMATE') => {
        if (isProcessingTurn || !gameState) return;
        setIsProcessingTurn(true);

        try {
            // Optimistic UI updates could happen here, but for turn-based, waiting is fine
            const res = await performCombatAction({ type });

            if (res.success && res.newState) {
                setGameState(res.newState);

                // Sounds
                if (type === 'ATTACK') playSound('sword_hit' as any);
                if (type === 'HEAL') playSound('heal' as any);
                if (type === 'DEFEND') playSound('shield_block' as any);

                // Check Victory
                if (res.newState.isVictory) {
                    playSound('victory_fanfare' as any);
                    if (res.loot) setDroppedItem(res.loot);
                    if (res.reward) setRewards(res.reward);
                } else if (res.newState.isDefeat) {
                    playSound('game_over' as any);
                }

            } else {
                console.error("Combat Action Failed", res.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessingTurn(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen bg-black text-white"><LoadingSpinner /></div>;
    if (!gameState || !boss) return null;

    return (
        <div className="relative w-full h-screen bg-zinc-900 text-white overflow-hidden flex flex-col">

            {/* Background / Arena Immersive Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-stone.png')] opacity-30"></div>
                {/* Could add dynamic background based on boss zone later */}
            </div>

            {/* --- HEADER: BOSS STATUS --- */}
            <div className="relative z-10 p-4 pt-8 md:p-8 flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    {/* Boss Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-red-900 bg-black overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                            {/* Placeholder or Image */}
                            <div className="flex items-center justify-center h-full text-4xl">{boss.image || '👹'}</div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-red-900 text-xs px-2 py-1 rounded border border-red-500 font-bold">Lvl {boss.level}</div>
                    </div>

                    {/* Boss Health Bar */}
                    <div className="w-full max-w-2xl text-center">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-red-500 drop-shadow-md mb-2">{boss.name}</h2>
                        <div className="relative h-6 bg-zinc-950 rounded-full border border-zinc-700 overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-900"
                                initial={{ width: '100%' }}
                                animate={{ width: `${(gameState.bossHp / gameState.bossMaxHp) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold z-10 text-white drop-shadow-md">
                                {gameState.bossHp} / {gameState.bossMaxHp} HP
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- MAIN CONTENT: BATTLEFIELD & LOGS --- */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-8">

                {/* Combat Text / FX Area (Could be expanded) */}
                <div className="h-32 w-full max-w-lg bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 overflow-y-auto font-mono text-sm space-y-1 custom-scrollbar shadow-inner">
                    {gameState.logs.map((log, i) => (
                        <div key={i} className={`opacity-80 ${log.includes('You') ? (log.includes('defeated') ? 'text-yellow-400 font-bold' : 'text-cyan-300') : 'text-red-400'}`}>
                            {i === gameState.logs.length - 1 ? '> ' : ''}{log}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

            </div>

            {/* --- FOOTER: PLAYER ACTIONS --- */}
            <div className="relative z-20 bg-zinc-950 border-t border-zinc-800 p-6 md:p-8">

                {/* Player Stats HUD */}
                <div className="max-w-4xl mx-auto mb-6 flex items-end justify-between">
                    <div className="flex flex-col gap-1 w-full max-w-sm">
                        <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                            <span>My Health</span>
                            <span>{gameState.playerHp} / {gameState.playerMaxHp}</span>
                        </div>
                        <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-green-700"
                                animate={{ width: `${(gameState.playerHp / gameState.playerMaxHp) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
                    <ActionButton
                        icon={<Swords className="w-6 h-6" />}
                        label="Attack"
                        color="bg-red-600 hover:bg-red-500"
                        onClick={() => handleAction('ATTACK')}
                        disabled={isProcessingTurn || gameState.isVictory || gameState.isDefeat}
                    />
                    <ActionButton
                        icon={<Shield className="w-6 h-6" />}
                        label="Defend"
                        color="bg-blue-600 hover:bg-blue-500"
                        onClick={() => handleAction('DEFEND')}
                        disabled={isProcessingTurn || gameState.isVictory || gameState.isDefeat}
                    />
                    <ActionButton
                        icon={<Heart className="w-6 h-6" />}
                        label="Heal"
                        color="bg-green-600 hover:bg-green-500"
                        onClick={() => handleAction('HEAL')}
                        disabled={isProcessingTurn || gameState.isVictory || gameState.isDefeat}
                    />
                    <ActionButton
                        icon={<Zap className="w-6 h-6" />}
                        label="Ultimate"
                        color="bg-purple-600 hover:bg-purple-500"
                        isSpecial
                        onClick={() => handleAction('ULTIMATE')}
                        disabled={isProcessingTurn || gameState.isVictory || gameState.isDefeat}
                    />
                </div>
            </div>

            {/* --- VICTORY / DEFEAT OVERLAYS --- */}
            <AnimatePresence>
                {gameState.isVictory && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8"
                    >
                        <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-bounce" />
                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 uppercase tracking-widest mb-4">Victory!</h1>
                        <p className="text-zinc-400 mb-8 max-w-md text-center">
                            You have slain the {boss.name}. Glory and riches are yours.
                        </p>

                        {droppedItem ? (
                            <div className="bg-zinc-900 border border-yellow-500/30 p-6 rounded-lg mb-8 text-center animate-pulse">
                                <p className="text-yellow-500 font-bold uppercase text-sm mb-2">Rewards</p>
                                <p className="text-white font-mono text-lg">+ {rewards?.xp} XP</p>
                                <p className="text-yellow-400 font-mono text-lg">+ {rewards?.gold} Gold</p>
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm mb-8">No loot found this time...</p>
                        )}

                        <button onClick={onClose} className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-widest rounded shadow-lg hover:scale-105 transition-all">
                            Return to World Map
                        </button>

                        {/* Loot Reveal Modal Integration */}
                        {droppedItem && (
                            <LootReveal
                                item={droppedItem}
                                onClose={() => { /* LootReveal closes when item is claimed */ }}
                            />
                        )}
                    </motion.div>
                )}
                {gameState.isDefeat && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
                    >
                        <Skull className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
                        <h1 className="text-6xl font-black text-red-500 uppercase tracking-widest mb-4 text-shadow-lg">Defeat</h1>
                        <p className="text-red-300 mb-8 max-w-md text-center">
                            The {boss.name} was too strong. Train harder and return when you are worthy.
                        </p>
                        <button onClick={onClose} className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded shadow-lg hover:scale-105 transition-all">
                            Retreat
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, color: string, onClick: () => void, disabled?: boolean, isSpecial?: boolean }> = ({ icon, label, color, onClick, disabled, isSpecial }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200
            ${disabled ? 'bg-zinc-900 opacity-50 cursor-not-allowed grayscale' : `${color} shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95`}
            ${isSpecial ? 'border-2 border-yellow-400' : ''}
        `}
    >
        <div className="mb-2">{icon}</div>
        <span className="font-bold uppercase tracking-wide text-xs md:text-sm">{label}</span>
    </button>
);

export default CombatArena;

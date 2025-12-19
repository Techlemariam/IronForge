import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Skull, Shield, Zap, User } from 'lucide-react';
import { ProgressionService } from '../../services/progression';
import { StorageService } from '../../services/storage';
import { playSound } from '../../utils';

interface Fighter {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    avatar?: string;
    isPlayer: boolean;
    damageBonus?: number;
    defenseBonus?: number;
}

interface ArenaProps {
    onClose: () => void;
}

const GLADIATOR_NAMES = ["Crixus", "Spartacus", "Gannicus", "Oenomaus", "Varro", "Barca"];

const Arena: React.FC<ArenaProps> = ({ onClose }) => {
    const [player, setPlayer] = useState<Fighter | null>(null);
    const [opponent, setOpponent] = useState<Fighter | null>(null);
    const [combatState, setCombatState] = useState<'LOBBY' | 'FIGHTING' | 'VICTORY' | 'DEFEAT'>('LOBBY');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const loadPlayer = async () => {
            const progression = await ProgressionService.getProgressionState();
            const startHp = 100 + (progression.level * 10);

            // Load Inventory for Stats
            const inventory = await StorageService.getState<string[]>('inventory') || [];

            let damageBonus = 0;
            let defenseBonus = 0;

            // Simple Stat Engine
            if (inventory.includes('scroll_strength')) damageBonus += 5; // +5 Damage
            if (inventory.includes('shield_iron')) defenseBonus += 0.10; // 10% Reduction

            setPlayer({
                name: 'Titan',
                level: progression.level,
                hp: startHp,
                maxHp: startHp,
                isPlayer: true,
                damageBonus,
                defenseBonus
            });
        };
        loadPlayer();
    }, []);

    const findMatch = () => {
        if (!player) return;

        const randomLevel = Math.max(1, player.level + (Math.floor(Math.random() * 5) - 2)); // +/- 2 levels
        const randomName = GLADIATOR_NAMES[Math.floor(Math.random() * GLADIATOR_NAMES.length)];

        setOpponent({
            name: randomName,
            level: randomLevel,
            hp: 100 + (randomLevel * 10),
            maxHp: 100 + (randomLevel * 10),
            isPlayer: false
        });
        setCombatState('FIGHTING');
        setLogs(prev => [...prev, `Matched against ${randomName} (Lvl ${randomLevel})!`]);
        playSound('quest_accept'); // Or similar
    };

    useEffect(() => {
        if (combatState === 'FIGHTING' && player && opponent) {
            const interval = setInterval(() => {
                // Combat Loop
                const playerSpeed = Math.random();
                const enemySpeed = Math.random();

                let attacker = playerSpeed > enemySpeed ? player : opponent;
                let defender = playerSpeed > enemySpeed ? opponent : player;

                // Attack
                let damage = Math.floor(Math.random() * 20) + (attacker.level * 2);

                // Apply Player Bonuses
                if (attacker.isPlayer && attacker.damageBonus) {
                    damage += attacker.damageBonus;
                }

                const isCrit = Math.random() < 0.1;
                const finalDamage = isCrit ? damage * 2 : damage;

                // Apply Defense
                let mitigation = 0;
                if (defender.isPlayer && defender.defenseBonus) {
                    mitigation = Math.floor(finalDamage * defender.defenseBonus);
                }
                const actualDamage = Math.max(1, finalDamage - mitigation);

                defender.hp = Math.max(0, defender.hp - actualDamage);

                setLogs(prev => {
                    const newLogs = [...prev, `${attacker.name} hits for ${finalDamage} ${isCrit ? '(CRIT!)' : ''}`];
                    if (newLogs.length > 5) newLogs.shift();
                    return newLogs;
                });

                if (defender.isPlayer) {
                    setPlayer({ ...defender });
                } else {
                    setOpponent({ ...defender });
                }

                // Check End
                if (defender.hp <= 0) {
                    clearInterval(interval);
                    if (defender.isPlayer) {
                        setCombatState('DEFEAT');
                        playSound('fail');
                    } else {
                        setCombatState('VICTORY');
                        playSound('achievement'); // Ensure this sound exists or use generic
                        handleVictory();
                    }
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [combatState, player, opponent]);

    const handleVictory = async () => {
        const rewardGold = 25;
        const rewardXp = 50; // We might want to add XP too?
        await ProgressionService.awardGold(rewardGold);
        setLogs(prev => [...prev, `Victory! Earned ${rewardGold} Gold.`]);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-zinc-900 border-2 border-orange-700 rounded-lg overflow-hidden flex flex-col h-[600px] relative">

                {/* Header */}
                <div className="p-4 bg-orange-950 border-b border-orange-800 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                        <Swords className="w-8 h-8" /> The Arena
                    </h1>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white px-2">EXIT</button>
                </div>

                {/* Battle Area */}
                <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">

                    {combatState === 'LOBBY' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <h2 className="text-4xl text-white font-black mb-8 animate-pulse">PROVE YOUR WORTH</h2>
                            <button
                                onClick={findMatch}
                                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-xl border-b-4 border-orange-800 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                            >
                                FIND MATCH
                            </button>
                        </div>
                    )}

                    {(combatState === 'FIGHTING' || combatState === 'VICTORY' || combatState === 'DEFEAT') && player && opponent && (
                        <div className="flex justify-between items-end h-full p-12">
                            {/* Player */}
                            <div className="flex flex-col items-center gap-4 w-1/3">
                                <div className={`relative ${combatState === 'DEFEAT' ? 'grayscale opacity-50' : ''}`}>
                                    <div className="w-32 h-32 bg-blue-900 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                        <User className="w-16 h-16 text-blue-200" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold border border-white">
                                        {player.level}
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="text-xl font-bold text-white uppercase">{player.name}</h3>
                                    <div className="w-full h-4 bg-zinc-800 rounded-full mt-2 overflow-hidden border border-zinc-700">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-300"
                                            style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-zinc-400">{player.hp} / {player.maxHp} HP</span>
                                </div>
                            </div>

                            {/* VS */}
                            <div className="flex flex-col items-center justify-center pb-20">
                                <Swords className="w-16 h-16 text-white animate-pulse" />
                                <div className="mt-8 w-64 h-32 bg-black/50 border border-zinc-700 rounded p-2 overflow-hidden flex flex-col justify-end">
                                    {logs.map((log, i) => (
                                        <p key={i} className="text-xs text-zinc-300 font-mono">{log}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Opponent */}
                            <div className="flex flex-col items-center gap-4 w-1/3">
                                <div className={`relative ${combatState === 'VICTORY' ? 'grayscale opacity-50' : ''}`}>
                                    <div className="w-32 h-32 bg-red-900 rounded-full border-4 border-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                        <Skull className="w-16 h-16 text-red-200" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold border border-white">
                                        {opponent.level}
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="text-xl font-bold text-white uppercase">{opponent.name}</h3>
                                    <div className="w-full h-4 bg-zinc-800 rounded-full mt-2 overflow-hidden border border-zinc-700">
                                        <div
                                            className="h-full bg-red-500 transition-all duration-300"
                                            style={{ width: `${(opponent.hp / opponent.maxHp) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-zinc-400">{opponent.hp} / {opponent.maxHp} HP</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {combatState === 'VICTORY' && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 animate-fade-in">
                            <h2 className="text-6xl font-black text-yellow-500 uppercase tracking-tighter drop-shadow-lg mb-4">Victory!</h2>
                            <p className="text-xl text-white mb-8">You have defeated the gladiator!</p>
                            <div className="flex gap-4">
                                <div className="p-4 bg-zinc-800 rounded border border-yellow-500 flex flex-col items-center w-32">
                                    <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                                    <span className="font-bold text-yellow-400 text-xl">+25</span>
                                    <span className="text-xs text-zinc-400 uppercase">Gold</span>
                                </div>
                            </div>
                            <button onClick={() => setCombatState('LOBBY')} className="mt-8 px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200">
                                RETURN TO LOBBY
                            </button>
                        </div>
                    )}
                    {combatState === 'DEFEAT' && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 animate-fade-in">
                            <h2 className="text-6xl font-black text-red-500 uppercase tracking-tighter drop-shadow-lg mb-4">DEFEAT</h2>
                            <p className="text-xl text-white mb-8">You have been bested...</p>
                            <button onClick={() => setCombatState('LOBBY')} className="mt-8 px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">
                                RETURN TO LOBBY
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Arena;

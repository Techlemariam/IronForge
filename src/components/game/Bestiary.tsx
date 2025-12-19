
import React from 'react';
import { Monster, MonsterType } from '../../types';
import { MONSTERS } from '../../data/gameData';
import { Skull, Zap, TrendingUp, Shield, Lock, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BestiaryProps {
    userLevel: number;
    onClose: () => void;
}

export const Bestiary: React.FC<BestiaryProps> = ({ userLevel, onClose }) => {

    const getTypeColor = (type: MonsterType) => {
        switch (type) {
            case 'Giant': return 'text-orange-400 border-orange-400 bg-orange-950/20';
            case 'Beast': return 'text-red-400 border-red-400 bg-red-950/20';
            case 'Undead': return 'text-purple-400 border-purple-400 bg-purple-950/20';
            case 'Elemental': return 'text-blue-400 border-blue-400 bg-blue-950/20';
            case 'Construct': return 'text-zinc-400 border-zinc-400 bg-zinc-950/20';
            case 'Dragon': return 'text-yellow-400 border-yellow-400 bg-yellow-950/20';
            default: return 'text-zinc-400 border-zinc-400 bg-zinc-950/20';
        }
    };

    const [unlockedIds, setUnlockedIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        const loadUnlocks = async () => {
            const ids = await import('../../services/storage').then(m => m.StorageService.getUnlockedMonsters());
            setUnlockedIds(ids);
        };
        loadUnlocks();
    }, []);

    const isUnlocked = (monster: Monster) => userLevel >= monster.level || unlockedIds.includes(monster.id);

    return (
        <div className="h-full bg-[#050505] p-6 overflow-y-auto font-serif text-zinc-200">
            <div className="flex justify-between items-center mb-8 border-b border-forge-border pb-4">
                <div>
                    <h1 className="text-3xl font-black text-warrior-light uppercase tracking-tighter flex items-center gap-3">
                        <Skull className="w-8 h-8 text-rarity-legendary" />
                        The Bestiary
                    </h1>
                    <p className="text-rarity-common text-xs italic mt-1">"Target identification and threat assessment for the aspiring Titan."</p>
                </div>
                <button
                    onClick={onClose}
                    className="bg-forge-800 border-2 border-forge-border px-4 py-2 rounded font-bold uppercase text-xs hover:bg-forge-700 transition-colors"
                >
                    Back to Citadel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MONSTERS.map((monster) => {
                    const unlocked = isUnlocked(monster);
                    const typeStyle = getTypeColor(monster.type);

                    return (
                        <div
                            key={monster.id}
                            className={cn(
                                "group bg-[#111] border-2 rounded-lg overflow-hidden transition-all duration-300 relative",
                                unlocked ? "border-forge-border hover:border-rarity-common shadow-lg" : "border-zinc-900 opacity-60 grayscale"
                            )}
                        >
                            {/* Monster Image Header */}
                            <div className={cn(
                                "h-40 flex items-center justify-center relative bg-gradient-to-b",
                                unlocked ? "from-zinc-900 to-black" : "from-black to-black"
                            )}>
                                {unlocked ? (
                                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{monster.image}</span>
                                ) : (
                                    <Lock className="w-12 h-12 text-zinc-800" />
                                )}

                                {/* Level Badge */}
                                <div className="absolute top-2 right-2 bg-black/80 border border-forge-border px-2 py-1 rounded text-[10px] font-bold uppercase">
                                    lvl {monster.level}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{unlocked ? monster.name : 'Unknown Threat'}</h3>
                                        {unlocked && (
                                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded border-2", typeStyle)}>
                                                {monster.type}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-rarity-common italic mt-1 h-8 line-clamp-2">
                                        {unlocked ? monster.description : 'Surpass Level ' + monster.level + ' to identify this entity.'}
                                    </p>
                                </div>

                                {unlocked && (
                                    <>
                                        {/* HP Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                                <span>Vitality</span>
                                                <span>{monster.hp} / {monster.maxHp}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                                                    style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Weaknesses */}
                                        <div className="flex flex-wrap gap-2">
                                            {monster.weakness.map(cat => (
                                                <div key={cat} className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[9px] font-bold uppercase text-rarity-common">
                                                    {cat === 'push' && <Zap className="w-3 h-3 text-yellow-500" />}
                                                    {cat === 'legs' && <TrendingUp className="w-3 h-3 text-green-500" />}
                                                    {cat === 'pull' && <Lock className="w-3 h-3 text-purple-500" />}
                                                    {cat === 'core' && <Shield className="w-3 h-3 text-blue-500" />}
                                                    {cat} weakness
                                                </div>
                                            ))}
                                        </div>

                                        {/* Requirement Info */}
                                        <div className="bg-black/40 border border-white/5 rounded p-2 flex items-start gap-2">
                                            <Info className="w-3 h-3 text-zinc-600 mt-0.5" />
                                            <p className="text-[9px] text-zinc-500 leading-tight">
                                                Requires execution of <span className="text-zinc-300 font-bold">{monster.associatedExerciseIds.length}</span> specific movement patterns to bypass defenses.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Status Overlay for Locked */}
                            {!unlocked && (
                                <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center">
                                    <div className="rotate-[-12deg] bg-forge-900 border-2 border-zinc-800 px-4 py-2 font-black text-zinc-700 uppercase tracking-widest text-xl">
                                        Restricted
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Bestiary;

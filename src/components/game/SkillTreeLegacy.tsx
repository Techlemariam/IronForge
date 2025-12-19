
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { SKILL_TREE, SESSIONS } from '../../data/static';
import { SkillNode, SkillStatus, ExerciseLogic, IntervalsWellness } from '../../types';
import { Lock, Zap, ArrowLeft, X, TrendingUp, Scroll, Wind, Sparkles, TrendingDown } from 'lucide-react';

interface SkillTreeProps {
    onExit: () => void;
    unlockedIds: Set<string>;
    wellness: IntervalsWellness | null;
}

const SkillTree: React.FC<SkillTreeProps> = ({ onExit, unlockedIds, wellness }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // --- ADAPTIVE COST LOGIC ---
    const getAdaptiveCost = (node: SkillNode) => {
        if (!wellness) return { cost: node.cost, modifier: 0 };

        let modifier = 0;
        const isStressHigh = (wellness.sleepScore || 100) < 60 || (wellness.hrv && wellness.hrv < 40);
        const isRested = (wellness.bodyBattery || 0) > 80;

        // Logic: 
        // If High Stress: Endurance costs MORE (discourage volume), Utility/Engineering costs LESS (encourage QoL)
        // If Rested: Strength costs LESS (encourage intensity)

        if (isStressHigh) {
            if (node.category === 'endurance') modifier = 0.20; // +20%
            if (node.category === 'core' || node.category === 'pull') modifier = -0.10; // -10% (Easier work)
        } else if (isRested) {
            if (node.category === 'push' || node.category === 'legs') modifier = -0.10; // -10% (Go heavy)
        }

        const newCost = Math.round(node.cost * (1 + modifier));
        return { cost: Math.max(1, newCost), modifier };
    };

    // --- DATA LOGIC ---
    const checkRequirement = (req: SkillNode['requirements'][0]): boolean => {
        // 1. Check Achievements
        if (req.type === 'achievement_count') {
            return unlockedIds.size >= req.value;
        }

        // 2. Check Physical Stats (1RM) from Static Session Data
        if (req.type === '1rm_weight') {
            let maxTM = 0;
            SESSIONS.forEach(session => {
                session.blocks.forEach(block => {
                    block.exercises?.forEach(ex => {
                        if (ex.id === req.exercise_id && ex.logic === ExerciseLogic.TM_PERCENT && ex.trainingMax) {
                            maxTM = Math.max(maxTM, ex.trainingMax);
                        }
                    });
                });
            });
            return req.comparison === 'gte' ? maxTM >= req.value : maxTM <= req.value;
        }

        if (req.exercise_id === 'any') return true;
        return false;
    };

    const nodesWithStatus = useMemo(() => {
        const statusMap = new Map<string, SkillStatus>();

        // 1. Check Requirements
        SKILL_TREE.forEach(node => {
            const allReqsMet = node.requirements.every(req => checkRequirement(req));
            statusMap.set(node.id, allReqsMet ? SkillStatus.MASTERED : SkillStatus.LOCKED);
        });

        // 2. Check Topology (Parent Check)
        return SKILL_TREE.map(node => {
            const reqsMet = node.requirements.every(req => checkRequirement(req));

            if (node.parents.length === 0) {
                return { ...node, status: reqsMet ? SkillStatus.MASTERED : SkillStatus.UNLOCKED };
            }

            const parents = SKILL_TREE.filter(n => node.parents.includes(n.id));
            const anyParentMastered = parents.some(p => {
                return p.requirements.every(r => checkRequirement(r));
            });

            if (reqsMet && anyParentMastered) return { ...node, status: SkillStatus.MASTERED };
            if (anyParentMastered) return { ...node, status: SkillStatus.UNLOCKED };
            return { ...node, status: SkillStatus.LOCKED };
        });

    }, [unlockedIds]);

    const totalMastery = nodesWithStatus.filter(n => n.status === SkillStatus.MASTERED).length;

    // --- INTERACTION ---
    const handleWheel = (e: React.WheelEvent) => {
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.4, view.scale + scaleAmount), 2.0);
        setView(prev => ({ ...prev, scale: newScale }));
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - view.x, y: e.clientY - view.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setView(prev => ({
            ...prev,
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        }));
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    // Initial Center
    useEffect(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setView({
                x: clientWidth / 2,
                y: clientHeight / 2,
                scale: 1
            });
        }
    }, []);

    const selectedNode = useMemo(() =>
        nodesWithStatus.find(n => n.id === selectedNodeId),
        [selectedNodeId, nodesWithStatus]);

    return (
        <div className="h-screen bg-[#050505] flex flex-col overflow-hidden font-sans relative select-none bg-paper bg-repeat text-zinc-900">

            {/* --- HUD --- */}
            <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-start pointer-events-none">
                <button
                    onClick={onExit}
                    className="pointer-events-auto flex items-center gap-2 text-[#46321d] hover:text-black transition-colors uppercase font-serif font-bold text-xs tracking-widest bg-[#c79c6e] border-2 border-[#46321d] px-4 py-2 rounded shadow-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Close Talent Tree</span>
                </button>

                <div className="flex flex-col items-end pointer-events-auto">
                    <div className="bg-zinc-900 border-2 border-[#c79c6e] px-4 py-2 rounded shadow-xl text-white">
                        <h1 className="text-sm font-serif font-bold text-[#c79c6e] uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Talent Rank: {totalMastery}
                        </h1>
                    </div>
                </div>
            </div>

            {/* --- CANVAS --- */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing touch-none relative bg-[#111]"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
            >
                {/* Grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundPosition: `${view.x}px ${view.y}px`,
                        backgroundSize: `${40 * view.scale}px ${40 * view.scale}`,
                        backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`
                    }}
                />

                <div
                    className="absolute top-0 left-0 w-full h-full transform-gpu transition-transform duration-75 ease-out origin-top-left"
                    style={{
                        transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`
                    }}
                >
                    {/* CONNECTIONS (Bezier Curves) - simplified for brevity, assume visual layer */}
                    <svg className="overflow-visible pointer-events-none absolute top-0 left-0" style={{ width: 1, height: 1 }}>
                        {nodesWithStatus.map(node => {
                            return node.parents.map(parentId => {
                                const parent = nodesWithStatus.find(n => n.id === parentId);
                                if (!parent) return null;

                                const isActive = parent.status === SkillStatus.MASTERED;
                                const isEndurance = node.currency === 'kinetic_shard';

                                const startX = parent.x + 32;
                                const startY = parent.y + 32;
                                const endX = node.x + 32;
                                const endY = node.y + 32;

                                // Bezier logic (copied from previous)
                                const distY = Math.abs(endY - startY);
                                const distX = Math.abs(endX - startX);
                                let d = '';
                                if (distY > distX) {
                                    const cpY = startY + (endY - startY) * 0.5;
                                    d = `M ${startX} ${startY} C ${startX} ${cpY}, ${endX} ${cpY}, ${endX} ${endY}`;
                                } else {
                                    const cpX = startX + (endX - startX) * 0.5;
                                    d = `M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}`;
                                }

                                const activeColor = isEndurance ? "#06b6d4" : "#ffd700";
                                const lockedColor = "#333";

                                return (
                                    <path
                                        key={`${parentId}-${node.id}`}
                                        d={d}
                                        stroke={isActive ? activeColor : lockedColor}
                                        strokeWidth={isActive ? 3 : 2}
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                );
                            });
                        })}
                    </svg>

                    {/* NODES */}
                    {nodesWithStatus.map(node => (
                        <div
                            key={node.id}
                            className="absolute w-16 h-16"
                            style={{
                                transform: `translate(${node.x}px, ${node.y}px)`
                            }}
                            onPointerUp={(e) => {
                                if (!isDragging) {
                                    e.stopPropagation();
                                    setSelectedNodeId(node.id);
                                }
                            }}
                        >
                            <TalentNode node={node} isSelected={selectedNodeId === node.id} />
                        </div>
                    ))}
                </div>
            </div>

            {/* --- TOOLTIP DRAWER --- */}
            {selectedNode && (
                <div className="absolute bottom-6 right-6 z-50 animate-slide-up w-80 bg-black/95 border-2 border-[#444] text-zinc-300 rounded-lg shadow-2xl p-6 font-sans text-sm backdrop-blur-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded border flex items-center justify-center ${selectedNode.status === SkillStatus.MASTERED
                                    ? (selectedNode.currency === 'kinetic_shard' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-500' : 'bg-yellow-900/20 border-yellow-500 text-yellow-500')
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                                }`}>
                                {selectedNode.category === 'push' && <Zap className="w-5 h-5" />}
                                {selectedNode.category === 'legs' && <TrendingUp className="w-5 h-5" />}
                                {selectedNode.category === 'pull' && <Lock className="w-5 h-5" />}
                                {selectedNode.category === 'core' && <Scroll className="w-5 h-5" />}
                                {selectedNode.category === 'endurance' && <Wind className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className={`font-serif font-bold text-lg leading-none ${selectedNode.status === SkillStatus.MASTERED
                                        ? 'text-white'
                                        : selectedNode.status === SkillStatus.UNLOCKED ? 'text-zinc-300' : 'text-zinc-600'
                                    }`}>
                                    {selectedNode.title}
                                </h3>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                                    {selectedNode.category} Tree
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedNodeId(null)}><X className="w-5 h-5 hover:text-white transition-colors" /></button>
                    </div>

                    <div className="bg-zinc-900/50 p-3 rounded border border-white/5 mb-4">
                        <p className="text-zinc-300 italic leading-relaxed">"{selectedNode.description}"</p>
                    </div>

                    {/* Adaptive Cost Calculation */}
                    {(() => {
                        const { cost, modifier } = getAdaptiveCost(selectedNode);
                        const hasModifier = modifier !== 0;

                        return (
                            <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Unlock Cost</span>
                                    {hasModifier && (
                                        <span className={`text-[10px] font-bold ${modifier > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {modifier > 0 ? 'Stress Penalty' : 'Optimal State'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasModifier && (
                                        <span className="text-zinc-600 line-through text-xs">{selectedNode.cost}</span>
                                    )}
                                    <div className={`text-sm font-bold flex items-center gap-1 ${selectedNode.currency === 'kinetic_shard' ? 'text-cyan-400' : 'text-[#ffd700]'}`}>
                                        {cost} {selectedNode.currency === 'kinetic_shard' ? 'Shards' : 'TP'}
                                        {hasModifier && (
                                            modifier > 0 ? <TrendingUp className="w-3 h-3 text-red-400" /> : <TrendingDown className="w-3 h-3 text-green-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

// ... TalentNode component (remains mostly same, omitted for brevity) ...
const TalentNode: React.FC<{ node: SkillNode & { status: SkillStatus }, isSelected: boolean }> = ({ node, isSelected }) => {

    const isEndurance = node.currency === 'kinetic_shard';
    // Borders based on status & type
    let borderColor = "border-[#333] bg-[#000]";
    let shadow = "";
    let iconColor = "text-zinc-700";

    if (node.status === SkillStatus.MASTERED) {
        borderColor = isEndurance ? "border-cyan-400 bg-cyan-950/30" : "border-[#ffd700] bg-yellow-950/30";
        shadow = isEndurance ? "shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "shadow-[0_0_20px_rgba(255,215,0,0.4)]";
        iconColor = isEndurance ? "text-cyan-400" : "text-[#ffd700]";
    } else if (node.status === SkillStatus.UNLOCKED) {
        borderColor = "border-zinc-500 bg-zinc-900";
        shadow = "shadow-[0_0_10px_rgba(255,255,255,0.1)]";
        iconColor = "text-zinc-300";
    }

    return (
        <div className={`w-16 h-16 border-2 rounded-full ${borderColor} ${shadow} ${isSelected ? 'scale-125 z-20 ring-2 ring-white' : 'z-10'} transition-all duration-300 cursor-pointer flex items-center justify-center relative group`}>

            <div className={`${iconColor} transition-colors duration-300`}>
                {node.category === 'push' && <Zap className="w-8 h-8" />}
                {node.category === 'legs' && <TrendingUp className="w-8 h-8" />}
                {node.category === 'pull' && <Lock className="w-8 h-8" />}
                {node.category === 'core' && <Scroll className="w-8 h-8" />}
                {node.category === 'endurance' && <Wind className="w-8 h-8" />}
            </div>
        </div>
    );
};

export default SkillTree;

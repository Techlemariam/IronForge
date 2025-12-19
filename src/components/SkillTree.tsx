
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    NodeProps,
    Edge
} from 'reactflow';
import { SKILL_TREE, SESSIONS } from '../data/static';
import { SkillNode, SkillStatus, ExerciseLogic, IntervalsWellness } from '../types';
import { Lock, Zap, ArrowLeft, X, TrendingUp, Scroll, Wind, Sparkles, TrendingDown, Shield, Check, ArrowUpCircle } from 'lucide-react';
import { useSkills } from '../context/SkillContext';
import { calculateAdaptiveCost, getMaxTM } from '../utils';

interface SkillTreeProps {
    onExit: () => void;
    unlockedIds: Set<string>;
    wellness: IntervalsWellness | null;
}

// --- LOGIC HELPERS ---
const checkRequirement = (req: SkillNode['requirements'][0], unlockedIds: Set<string>, wellness: IntervalsWellness | null): boolean => {
    if (req.type === 'achievement_count') return unlockedIds.size >= req.value;
    if (req.type === 'vo2max_value') {
        if (!wellness || !wellness.vo2max) return false;
        return req.comparison === 'gte' ? wellness.vo2max >= req.value : wellness.vo2max <= req.value;
    }
    if (req.type === '1rm_weight') {
        const maxTM = getMaxTM(req.exercise_id);
        return req.comparison === 'gte' ? maxTM >= req.value : maxTM <= req.value;
    }
    if (req.exercise_id === 'any') return true;
    return false;
};

// --- CUSTOM NODE COMPONENT ---
interface CustomNodeData {
    node: SkillNode;
    status: SkillStatus;
    isAffordable: boolean;
}

const CustomSkillNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
    const { node, status, isAffordable } = data;
    const isMastered = status === SkillStatus.MASTERED;
    const isUnlocked = status === SkillStatus.UNLOCKED;
    const isLocked = status === SkillStatus.LOCKED;
    const isEndurance = node.currency === 'kinetic_shard';

    // Style Logic
    let borderClass = "border-zinc-800";
    let bgClass = "bg-[#0a0a0a]";
    let iconColor = "text-zinc-600";
    let glow = "";

    if (isMastered) {
        borderClass = isEndurance ? "border-cyan-500" : "border-[#ffd700]";
        bgClass = isEndurance ? "bg-cyan-950" : "bg-yellow-950";
        iconColor = isEndurance ? "text-cyan-400" : "text-[#ffd700]";
        glow = isEndurance ? "shadow-[0_0_20px_rgba(6,182,212,0.5)]" : "shadow-[0_0_20px_rgba(255,215,0,0.5)]";
    } else if (isUnlocked) {
        if (isAffordable) {
            borderClass = "border-green-500";
            bgClass = "bg-zinc-900";
            iconColor = "text-green-400";
            glow = "animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.4)]";
        } else {
            borderClass = "border-zinc-400";
            bgClass = "bg-zinc-900";
            iconColor = "text-zinc-200";
            glow = "shadow-[0_0_10px_rgba(255,255,255,0.1)]";
        }
    }

    if (selected) {
        borderClass = "border-white ring-2 ring-white";
    }

    return (
        <div className={`relative w-16 h-16 rounded-full border-2 ${borderClass} ${bgClass} ${glow} flex items-center justify-center transition-all duration-300`}>
            {/* Handles for connections (Hidden visually but needed for React Flow logic) */}
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />

            {/* Icon */}
            <div className={`${iconColor}`}>
                {node.category === 'push' && <Zap className="w-8 h-8" />}
                {node.category === 'legs' && <TrendingUp className="w-8 h-8" />}
                {node.category === 'pull' && <Lock className="w-8 h-8" />}
                {node.category === 'core' && <Shield className="w-8 h-8" />}
                {node.category === 'endurance' && <Wind className="w-8 h-8" />}
            </div>

            {/* Affordability Badge */}
            {isUnlocked && isAffordable && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg border border-black z-10 animate-bounce">
                    <ArrowUpCircle className="w-3 h-3 text-black" />
                </div>
            )}

            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-zinc-600" />
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    skillNode: CustomSkillNode,
};

const SkillTree: React.FC<SkillTreeProps> = ({ onExit, unlockedIds, wellness }) => {
    const { purchasedSkillIds, unlockSkill, canAfford, availableTalentPoints, availableKineticShards } = useSkills();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // --- DATA PREPARATION ---
    const { nodes, edges, masteryStats } = useMemo(() => {
        // 1. Calculate Status
        const nodesWithStatus = SKILL_TREE.map(node => {
            if (purchasedSkillIds.has(node.id)) return { ...node, status: SkillStatus.MASTERED };

            const reqsMet = node.requirements.every(req => checkRequirement(req, unlockedIds, wellness));
            const parentsMastered = node.parents.length === 0 || node.parents.every(pid => purchasedSkillIds.has(pid));

            if (reqsMet && parentsMastered) return { ...node, status: SkillStatus.UNLOCKED };
            return { ...node, status: SkillStatus.LOCKED };
        });

        // 2. Map to React Flow Nodes
        const flowNodes = nodesWithStatus.map(node => ({
            id: node.id,
            type: 'skillNode',
            position: { x: node.x, y: node.y },
            data: {
                node,
                status: node.status,
                isAffordable: node.status === SkillStatus.UNLOCKED && canAfford(node.id)
            },
        }));

        // 3. Map to React Flow Edges
        const flowEdges: Edge[] = [];
        nodesWithStatus.forEach(node => {
            node.parents.forEach(parentId => {
                const parent = nodesWithStatus.find(n => n.id === parentId);
                const isActive = parent?.status === SkillStatus.MASTERED;
                const isEndurance = node.currency === 'kinetic_shard';

                flowEdges.push({
                    id: `e-${parentId}-${node.id}`,
                    source: parentId,
                    target: node.id,
                    animated: isActive,
                    style: {
                        stroke: isActive ? (isEndurance ? '#06b6d4' : '#ffd700') : '#333',
                        strokeWidth: isActive ? 2 : 2
                    },
                });
            });
        });

        // 4. Calculate Stats
        const totalNodes = SKILL_TREE.length;
        const masteredCount = purchasedSkillIds.size;
        const affordableCount = nodesWithStatus.filter(n => n.status === SkillStatus.UNLOCKED && canAfford(n.id)).length;

        return {
            nodes: flowNodes,
            edges: flowEdges,
            masteryStats: {
                total: totalNodes,
                mastered: masteredCount,
                affordable: affordableCount
            }
        };
    }, [unlockedIds, wellness, purchasedSkillIds, availableTalentPoints, availableKineticShards, canAfford]);

    const [rfNodes, setNodes, onNodesChange] = useNodesState(nodes);
    const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges);

    // Sync state when data changes
    useEffect(() => {
        setNodes(nodes);
        setEdges(edges);
    }, [nodes, edges, setNodes, setEdges]);

    const onNodeClick = useCallback((event: any, node: any) => {
        setSelectedNodeId(node.id);
    }, []);

    const selectedNodeData = useMemo(() => {
        if (!selectedNodeId) return null;
        const n = nodes.find(n => n.id === selectedNodeId);
        return n ? n.data : null;
    }, [selectedNodeId, nodes]);

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col font-sans text-zinc-200">

            {/* --- HUD --- */}
            <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-start pointer-events-none">
                <button
                    onClick={onExit}
                    className="pointer-events-auto flex items-center gap-2 text-[#46321d] hover:text-black transition-colors uppercase font-serif font-bold text-xs tracking-widest bg-[#c79c6e] border-2 border-[#46321d] px-4 py-2 rounded shadow-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Hub</span>
                </button>

                <div className="flex flex-col items-end pointer-events-auto gap-3">
                    {/* Progress Card */}
                    <div className="bg-zinc-900 border-2 border-[#c79c6e] px-4 py-3 rounded shadow-xl text-white min-w-[220px]">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-sm font-serif font-bold text-[#c79c6e] uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Talent Tree
                            </h1>
                            <span className="text-xs font-mono text-zinc-400">{masteryStats.mastered}/{masteryStats.total}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3 border border-zinc-800">
                            <div
                                className="h-full bg-[#c79c6e] shadow-[0_0_10px_#c79c6e] transition-all duration-700"
                                style={{ width: `${(masteryStats.mastered / masteryStats.total) * 100}%` }}
                            ></div>
                        </div>

                        {/* Available Notification */}
                        {masteryStats.affordable > 0 ? (
                            <div className="text-[10px] text-green-400 font-bold uppercase tracking-wide flex items-center gap-1 animate-pulse">
                                <ArrowUpCircle className="w-3 h-3" />
                                {masteryStats.affordable} Upgrade{masteryStats.affordable > 1 ? 's' : ''} Available
                            </div>
                        ) : (
                            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                More XP Required
                            </div>
                        )}
                    </div>

                    {/* Resources */}
                    <div className="flex gap-2">
                        <div className="bg-zinc-900 border border-[#ffd700] px-3 py-1.5 rounded shadow-lg text-[#ffd700] flex items-center gap-2 min-w-[80px] justify-center">
                            <span className="text-xs font-bold uppercase tracking-wider">TP</span>
                            <span className="font-mono font-bold text-lg">{availableTalentPoints}</span>
                        </div>
                        <div className="bg-zinc-900 border border-cyan-400 px-3 py-1.5 rounded shadow-lg text-cyan-400 flex items-center gap-2 min-w-[80px] justify-center">
                            <span className="text-xs font-bold uppercase tracking-wider">KS</span>
                            <span className="font-mono font-bold text-lg">{availableKineticShards}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- REACT FLOW CANVAS --- */}
            <div className="flex-1 border-t border-zinc-900 relative">
                <ReactFlow
                    nodes={rfNodes}
                    edges={rfEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.5}
                    maxZoom={2}
                    className="bg-[#050505]"
                >
                    <Background color="#222" gap={20} size={1} />
                    <Controls className="bg-zinc-800 border-zinc-700 text-white" />
                </ReactFlow>

                {/* Atmosphere Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#050505_100%)]"></div>
            </div>

            {/* --- DETAILS DRAWER --- */}
            {selectedNodeData && (
                <div className="absolute bottom-6 right-6 z-50 animate-slide-up w-80 bg-[#111] border-2 border-[#444] text-zinc-300 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 font-sans text-sm backdrop-blur-md">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded border-2 flex items-center justify-center ${selectedNodeData.status === SkillStatus.MASTERED
                                    ? (selectedNodeData.node.currency === 'kinetic_shard' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' : 'bg-yellow-950/50 border-yellow-500 text-yellow-400')
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                                }`}>
                                {selectedNodeData.node.category === 'push' && <Zap className="w-6 h-6" />}
                                {selectedNodeData.node.category === 'legs' && <TrendingUp className="w-6 h-6" />}
                                {selectedNodeData.node.category === 'pull' && <Lock className="w-6 h-6" />}
                                {selectedNodeData.node.category === 'core' && <Shield className="w-6 h-6" />}
                                {selectedNodeData.node.category === 'endurance' && <Wind className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={`font-serif font-bold text-lg leading-none ${selectedNodeData.status === SkillStatus.MASTERED ? 'text-white' : 'text-zinc-400'
                                    }`}>
                                    {selectedNodeData.node.title}
                                </h3>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">
                                    {selectedNodeData.node.category} Mastery
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedNodeId(null)}><X className="w-5 h-5 hover:text-white transition-colors" /></button>
                    </div>

                    {/* Description */}
                    <div className="bg-zinc-900/50 p-3 rounded border border-white/5 mb-4">
                        <p className="text-zinc-300 italic leading-relaxed">"{selectedNodeData.node.description}"</p>
                    </div>

                    {/* Requirements */}
                    {selectedNodeData.status !== SkillStatus.MASTERED && selectedNodeData.node.requirements.length > 0 && (
                        <div className="mb-3 text-xs">
                            <span className="uppercase font-bold text-red-400">Prerequisites:</span>
                            <ul className="mt-1 space-y-1">
                                {selectedNodeData.node.requirements.map((req: any, i: number) => {
                                    const met = checkRequirement(req, unlockedIds, wellness);
                                    return (
                                        <li key={i} className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-zinc-500'}`}>
                                            {met ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                            <span>
                                                {req.type === 'vo2max_value' && `VO2 Max ≥ ${req.value}`}
                                                {req.type === 'achievement_count' && `Unlock ${req.value} Achievements`}
                                                {req.type === '1rm_weight' && `Lift ${req.value}kg+ (1RM)`}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}

                    {/* Action Bar */}
                    {(() => {
                        const { cost, modifier } = calculateAdaptiveCost(selectedNodeData.node, wellness);
                        const hasModifier = modifier !== 0;
                        const canBuy = canAfford(selectedNodeData.node.id);

                        return (
                            <div className="border-t border-white/10 pt-3 mt-2">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Cost</span>
                                    <div className="flex items-center gap-2">
                                        {hasModifier && (
                                            <span className={`text-[10px] font-bold ${modifier > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {modifier > 0 ? '+Stress Tax' : '-Rested Discount'}
                                            </span>
                                        )}
                                        <div className={`text-sm font-bold flex items-center gap-1 ${selectedNodeData.node.currency === 'kinetic_shard' ? 'text-cyan-400' : 'text-[#ffd700]'}`}>
                                            {cost} {selectedNodeData.node.currency === 'kinetic_shard' ? 'KS' : 'TP'}
                                        </div>
                                    </div>
                                </div>

                                {selectedNodeData.status === SkillStatus.UNLOCKED ? (
                                    <button
                                        onClick={() => unlockSkill(selectedNodeData.node.id)}
                                        disabled={!canBuy}
                                        className={`w-full py-3 font-bold uppercase tracking-widest text-xs rounded transition-all flex items-center justify-center gap-2
                                    ${canBuy
                                                ? 'bg-[#c79c6e] hover:bg-[#d4a87a] text-[#46321d] shadow-[0_0_15px_rgba(199,156,110,0.4)]'
                                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
                                `}
                                    >
                                        <Lock className="w-3 h-3" />
                                        {canBuy ? 'Unlock Talent' : 'Insufficient Funds'}
                                    </button>
                                ) : selectedNodeData.status === SkillStatus.MASTERED ? (
                                    <div className="w-full py-3 bg-green-900/30 border border-green-800 text-green-500 font-bold uppercase tracking-widest text-xs rounded flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Talent Acquired
                                    </div>
                                ) : (
                                    <div className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-600 font-bold uppercase tracking-widest text-xs rounded text-center flex items-center justify-center gap-2">
                                        <Lock className="w-3 h-3" />
                                        Locked
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default SkillTree;

"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { SkillCategory } from "@/types";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css"; // Ensure base styles are imported

import { SKILL_TREE_V2, getNodeById } from "@/data/skill-tree-v2";
import { SkillNodeV2, SkillStatus, NodeTier } from "@/types/skills";
import { IntervalsWellness } from "@/types";
import {
  Lock,
  Zap,
  ArrowLeft,
  X,
  TrendingUp,
  Scroll,
  Wind,
  Sparkles,
  TrendingDown,
  Shield,
  Check,
  ArrowUpCircle,
  Octagon,
  Crown,
  Star,
} from "lucide-react";
import { useSkills } from "@/context/SkillContext";
import { calculateAdaptiveCost } from "@/utils/root_utils";
import { motion, AnimatePresence } from "framer-motion";

interface SkillTreeProps {
  onExit: () => void;
  wellness: IntervalsWellness | null;
}

// --- TIER VISUAL CONSTANTS ---
const TIER_SIZE: Record<NodeTier, number> = {
  minor: 50,
  notable: 70,
  keystone: 100,
};

// --- CUSTOM NODE COMPONENT ---
interface CustomNodeData {
  node: SkillNodeV2;
  status: SkillStatus;
  isAffordable: boolean;
  tier: NodeTier;
  isActiveKeystone: boolean;
}

const CustomSkillNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const { node, status, isAffordable, tier, isActiveKeystone } = data;
  const isMastered = status === SkillStatus.MASTERED;
  const isUnlocked = status === SkillStatus.UNLOCKED;
  const isLocked = status === SkillStatus.LOCKED;
  const isEndurance = node.currency === "kinetic_shard";

  // Base Sizes
  const size = TIER_SIZE[tier];
  const iconSize = tier === "keystone" ? 48 : tier === "notable" ? 32 : 24;

  // Style Logic
  let borderClass = "border-zinc-800";
  let bgClass = "bg-[#0a0a0a]";
  let iconColor = "text-zinc-600";
  let glow = "";
  let borderStyle = "border-2";

  if (tier === "keystone") borderStyle = "border-4";
  if (tier === "notable") borderStyle = "border-3";

  if (isMastered) {
    borderClass = isEndurance ? "border-cyan-500" : "border-[#ffd700]";
    bgClass = isEndurance ? "bg-cyan-950" : "bg-yellow-950/50";
    iconColor = isEndurance ? "text-cyan-400" : "text-[#ffd700]";
    glow = isEndurance
      ? "shadow-[0_0_30px_rgba(6,182,212,0.6)]"
      : "shadow-[0_0_30px_rgba(255,215,0,0.6)]";
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

  // Feature: Active Keystone Animation
  if (isActiveKeystone) {
    glow += " ring-4 ring-yellow-500 ring-opacity-50 animate-pulse";
  }

  // Shape for Keystone (Octagon-ish via CSS clip-path or just rounded-xl)
  // Using rounded-full for all for consistency with ReactFlow handles, can customize later.
  const shapeClass = tier === "keystone" ? "rounded-full" : "rounded-full";

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative ${shapeClass} ${borderStyle} ${borderClass} ${bgClass} ${glow} flex items-center justify-center transition-all duration-300 group`}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0 w-full h-full"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0 w-full h-full"
        isConnectable={false}
      />

      {/* Icon */}
      <div className={`${iconColor} flex items-center justify-center`}>
        {tier === "keystone" && <Crown size={iconSize} />}
        {tier === "notable" && <Star size={iconSize} />}
        {tier === "minor" && (
          <>
            {node.path === "juggernaut" && <Shield size={iconSize} />}
            {node.path === "pathfinder" && <Wind size={iconSize} />}
            {node.path === "warden" && <Zap size={iconSize} />}
            {node.path === "titan" && <TrendingUp size={iconSize} />}
            {node.path === "sage" && <Sparkles size={iconSize} />}
          </>
        )}
      </div>

      {/* Affordability Badge */}
      {isUnlocked && isAffordable && !isMastered && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg border border-black z-10 animate-bounce">
          <ArrowUpCircle className="w-3 h-3 text-black" />
        </div>
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div
          className={`absolute inset-0 bg-black/60 ${shapeClass} flex items-center justify-center`}
        >
          <Lock className="w-1/2 h-1/2 text-zinc-600" />
        </div>
      )}

      {/* Hover Tooltip (Simple) */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 border border-zinc-700">
        {node.title}
      </div>
    </div>
  );
};

const nodeTypes = {
  skillNode: CustomSkillNode,
};

const SkillTree: React.FC<SkillTreeProps> = ({ onExit, wellness }) => {
  const {
    purchasedSkillIds,
    unlockSkill,
    canAfford,
    availableTalentPoints,
    availableKineticShards,
    getNodeStatus,
    refundSkill,
    activeKeystoneId,
  } = useSkills();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // --- DATA PREPARATION ---
  const { nodes, edges } = useMemo(() => {
    // 1. Map to React Flow Nodes
    const flowNodes: Node[] = SKILL_TREE_V2.map((node: SkillNodeV2) => {
      const status = getNodeStatus(node.id);
      const affordable = status === SkillStatus.UNLOCKED && canAfford(node.id);

      return {
        id: node.id,
        type: "skillNode",
        position: { x: node.position.x, y: node.position.y },
        data: {
          node,
          status,
          isAffordable: affordable,
          tier: node.tier,
          isActiveKeystone: activeKeystoneId === node.id,
        },
        // Z-Index: Keystones on top, then Notables, then Minors
        zIndex: node.tier === "keystone" ? 3 : node.tier === "notable" ? 2 : 1,
      };
    });

    // 2. Map to React Flow Edges
    const flowEdges: Edge[] = [];
    SKILL_TREE_V2.forEach((node: SkillNodeV2) => {
      node.parents.forEach((parentId: string) => {
        const parentNode = SKILL_TREE_V2.find((n: SkillNodeV2) => n.id === parentId);
        const parentStatus = getNodeStatus(parentId);
        const nodeStatus = getNodeStatus(node.id);

        // Edge is "active" if both nodes are mastered (path connected)
        // OR if parent is mastered and this node is unlocked/mastered (path reachable)
        const isPathActive =
          parentStatus === SkillStatus.MASTERED &&
          nodeStatus !== SkillStatus.LOCKED;
        const isFullyMastered =
          parentStatus === SkillStatus.MASTERED &&
          nodeStatus === SkillStatus.MASTERED;

        const isEndurance = node.currency === "kinetic_shard";

        flowEdges.push({
          id: `e-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          animated: isPathActive && !isFullyMastered,
          style: {
            stroke: isFullyMastered
              ? isEndurance
                ? "#06b6d4"
                : "#ffd700"
              : isPathActive
                ? "#555"
                : "#333",
            strokeWidth: isFullyMastered ? 3 : 1,
            opacity: isPathActive ? 1 : 0.3,
          },
        });
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [getNodeStatus, canAfford, activeKeystoneId]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Sync state when data changes
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNodeData = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = SKILL_TREE_V2.find((n: SkillNodeV2) => n.id === selectedNodeId);
    if (!n) return null;
    const status = getNodeStatus(n.id);
    const affordable = canAfford(n.id);
    return { ...n, status, affordable };
  }, [selectedNodeId, getNodeStatus, canAfford]);

  const handleUnlock = () => {
    if (selectedNodeId) {
      const res = unlockSkill(selectedNodeId);
      if (!res.success) {
        // Could verify toast here
      }
    }
  };

  const handleRefund = () => {
    if (selectedNodeId) {
      refundSkill(selectedNodeId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col text-white animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-[#0a0a0a] z-10 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">
              Neural Lattice
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              V2.0 // NEURAL LINK ESTABLISHED
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-950/30 border border-yellow-900/50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            <span className="font-mono font-bold text-yellow-500">
              {availableTalentPoints} TP
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-950/30 border border-cyan-900/50 rounded-lg">
            <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
            <span className="font-mono font-bold text-cyan-400">
              {availableKineticShards} KS
            </span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: "default", animated: false }}
          className="bg-[#050505]"
        >
          <Background color="#222" gap={20} size={1} />
          <Controls
            position="bottom-right"
            className="bg-zinc-900 border-zinc-800 fill-zinc-400"
          />
        </ReactFlow>

        {/* Info Drawer */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full md:w-96 bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl p-6 overflow-y-auto z-20"
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedNodeData.tier === "keystone" && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-yellow-900/50 text-yellow-500 rounded border border-yellow-700">
                        Keystone
                      </span>
                    )}
                    {selectedNodeData.tier === "notable" && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded border border-purple-700">
                        Notable
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                      {selectedNodeData.path}
                    </span>
                  </div>
                  <h2
                    className={`text-3xl font-black uppercase italic leading-none ${selectedNodeData.tier === "keystone" ? "text-yellow-500" : "text-white"}`}
                  >
                    {selectedNodeData.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {selectedNodeData.description}
                </p>

                {/* Effects */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                    Effects
                  </div>
                  {selectedNodeData.effects && (
                    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 space-y-2">
                      {Object.entries(selectedNodeData.effects).map(
                        ([key, value]) => {
                          if (typeof value === "boolean" && value)
                            return (
                              <div
                                key={key}
                                className="text-green-400 flex items-center gap-2"
                              >
                                <Check size={14} />{" "}
                                <span>
                                  Unlocks: {key.replace("unlocks", "")}
                                </span>
                              </div>
                            );
                          if (typeof value === "number")
                            return (
                              <div
                                key={key}
                                className="text-zinc-300 flex items-center gap-2"
                              >
                                <ArrowUpCircle
                                  size={14}
                                  className="text-green-500"
                                />{" "}
                                <span>
                                  {key}: +{value}
                                </span>
                              </div>
                            );
                          return null;
                        },
                      )}
                      {/* Fallback for now if object rendering is simple. Phase 5 will pretty print effects */}
                    </div>
                  )}

                  {/* Drawbacks (Keystone) */}
                  {selectedNodeData.drawbacks && (
                    <div className="bg-red-950/10 p-4 rounded border border-red-900/30 space-y-2">
                      <div className="text-xs font-bold uppercase text-red-500 tracking-wider mb-1">
                        Opportunity Cost
                      </div>
                      <p className="text-red-400 text-xs italic">
                        By accepting this power, you accept its burden.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cost & Action */}
                <div className="mt-auto pt-8 border-t border-zinc-800 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Cost:</span>
                    <span
                      className={`font-mono font-bold ${selectedNodeData.currency === "talent_point" ? "text-yellow-500" : "text-cyan-400"}`}
                    >
                      {selectedNodeData.cost}{" "}
                      {selectedNodeData.currency === "talent_point"
                        ? "TP"
                        : "KS"}
                    </span>
                  </div>

                  {selectedNodeData.status === SkillStatus.LOCKED && (
                    <button
                      disabled
                      className="w-full py-4 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-widest rounded cursor-not-allowed border border-zinc-800 flex items-center justify-center gap-2"
                    >
                      <Lock size={16} /> Locked
                    </button>
                  )}

                  {selectedNodeData.status === SkillStatus.UNLOCKED && (
                    <button
                      onClick={handleUnlock}
                      disabled={!selectedNodeData.affordable}
                      className={`w-full py-4 font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2
                                                ${selectedNodeData.affordable
                          ? "bg-green-600 hover:bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105"
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        }
                                            `}
                    >
                      {selectedNodeData.affordable
                        ? "Unlock Node"
                        : "Insufficient Resources"}
                    </button>
                  )}

                  {selectedNodeData.status === SkillStatus.MASTERED && (
                    <>
                      <div className="w-full py-4 bg-yellow-950/20 text-yellow-500 font-bold uppercase tracking-widest rounded border border-yellow-500/20 flex items-center justify-center gap-2">
                        <Check size={16} /> Mastered
                      </div>
                      {selectedNodeData.tier !== "keystone" && (
                        <button
                          onClick={handleRefund}
                          className="text-xs text-zinc-600 hover:text-red-400 underline decoration-zinc-800 underline-offset-4 transition-colors"
                        >
                          Refund Point
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkillTree;

"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { SkillNode } from "../types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import "./NeuralLattice.css";

interface NeuralLatticeVisualProps {
    nodes: SkillNode[];
    unlockedIds: Set<string>;
    onNodeClick: (id: string) => void;
    pendingNodeId: string | null;
}

export const NeuralLatticeVisual = ({
    nodes,
    unlockedIds,
    onNodeClick,
    pendingNodeId
}: NeuralLatticeVisualProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    // Build connection lines
    const lines: { x1: number; y1: number; x2: number; y2: number; isActive: boolean }[] = [];
    nodes.forEach(node => {
        node.connections.forEach(targetId => {
            const target = nodes.find(n => n.id === targetId);
            if (target) {
                const isActive = unlockedIds.has(node.id) && unlockedIds.has(target.id);
                lines.push({
                    x1: node.position.x,
                    y1: node.position.y,
                    x2: target.position.x,
                    y2: target.position.y,
                    isActive
                });
            }
        });
    });

    useLayoutEffect(() => {
        if (svgRef.current) {
            svgRef.current.style.setProperty("--lattice-offset-x", `${offset.x}px`);
            svgRef.current.style.setProperty("--lattice-offset-y", `${offset.y}px`);
            svgRef.current.style.setProperty("--lattice-scale", scale.toString());
            svgRef.current.style.setProperty("--lattice-transition", isDragging ? "none" : "transform 0.1s ease-out");
        }
    }, [offset.x, offset.y, scale, isDragging]);

    return (
        <div
            className="neural-lattice-container"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <svg
                ref={svgRef}
                className="lattice-svg"
            >
                {/* Draw connections */}
                {lines.map((line, i) => (
                    <line
                        key={i}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.isActive ? "var(--color-teal-glow)" : "var(--color-steel)"}
                        strokeWidth={line.isActive ? 4 : 2}
                        strokeOpacity={line.isActive ? 0.8 : 0.3}
                    />
                ))}

                {/* Draw nodes */}
                {nodes.map(node => {
                    const isUnlocked = unlockedIds.has(node.id);
                    const isPending = pendingNodeId === node.id;

                    // Can unlock if root, or if connected to an unlocked node
                    const canUnlock = !isUnlocked && (
                        node.connections.length === 0 ||
                        node.connections.some(c => unlockedIds.has(c)) ||
                        nodes.filter(n => n.connections.includes(node.id) && unlockedIds.has(n.id)).length > 0
                    );

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${node.position.x}, ${node.position.y})`}
                            className={cn(
                                "lattice-node",
                                canUnlock ? "can-unlock" : "is-not-allowed",
                                isUnlocked && "is-unlocked"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (canUnlock && !isPending) {
                                    onNodeClick(node.id);
                                }
                            }}
                        >
                            <circle
                                r={node.type === "KEYSTONE" ? 30 : node.type === "NOTABLE" ? 20 : 12}
                                fill={isUnlocked ? "var(--color-teal-glow)" : "var(--color-armor)"}
                                stroke={canUnlock && !isUnlocked ? "var(--color-plasma)" : "var(--color-steel)"}
                                strokeWidth={3}
                                className="lattice-circle"
                            />

                            {isPending && (
                                <foreignObject x="-12" y="-12" width="24" height="24">
                                    <Loader2 className="w-6 h-6 animate-spin text-void" />
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <button
                    onClick={() => setScale(s => Math.min(s + 0.2, 2.5))}
                    className="w-10 h-10 bg-armor border border-steel rounded text-white font-bold hover:bg-steel/50"
                >
                    +
                </button>
                <button
                    onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
                    className="w-10 h-10 bg-armor border border-steel rounded text-white font-bold hover:bg-steel/50"
                >
                    -
                </button>
            </div>
        </div>
    );
};

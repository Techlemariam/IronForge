"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    PerspectiveCamera,
    Environment,
} from "@react-three/drei";
import { TitanAttributes } from "@/types";
import * as THREE from "three";

interface AvatarViewerVisualProps {
    attributes: TitanAttributes;
    isElite: boolean;
    muscleHeatmap: Record<string, number>;
}

// --- HOLOGRAPHIC SHADER MATERIAL ---
const HologramMaterial = ({
    color,
    fatigue,
}: {
    color: string;
    fatigue: number;
}) => {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            const t = state.clock.getElapsedTime();
            const pulse = (Math.sin(t * 2) + 1) / 2;

            const baseEmissive = new THREE.Color(color);
            if (fatigue > 0.5) {
                if (Math.random() > 0.95) materialRef.current.emissiveIntensity = 2;
                else materialRef.current.emissiveIntensity = 0.5 + pulse;
            } else {
                materialRef.current.emissiveIntensity = 0.2 + pulse * 0.3;
            }
            materialRef.current.emissive = baseEmissive;
        }
    });

    return (
        <meshStandardMaterial
            ref={materialRef}
            color={color}
            roughness={0.2}
            metalness={0.8}
            transparent={true}
            opacity={0.9}
            wireframe={false}
        />
    );
};

const TitanMesh: React.FC<{
    attributes: TitanAttributes;
    isElite: boolean;
    heatmap: Record<string, number>;
}> = ({ attributes, isElite, heatmap }) => {
    const meshRef = useRef<any>(null);

    const chestScale = 1 + attributes.strength / 40;
    const legScale = 1 + attributes.strength / 40;

    useFrame((_state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    const baseColor = isElite ? "#ffd700" : "#c79c6e";

    const getColor = (muscleName: string) => {
        const fatigue = heatmap[muscleName] || 0;
        if (fatigue > 0.8) return "#ef4444";
        if (fatigue > 0.4) return "#eab308";
        return baseColor;
    };

    const getFatigue = (muscleName: string) => heatmap[muscleName] || 0;

    return (
        <group ref={meshRef}>
            {/* Torso */}
            <mesh position={[0, 1.5, 0]} scale={[chestScale, 1, 0.8]}>
                <boxGeometry args={[1, 1.5, 0.5]} />
                <HologramMaterial
                    color={getColor("chest")}
                    fatigue={getFatigue("chest")}
                />
            </mesh>

            {/* Head */}
            <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <HologramMaterial color={baseColor} fatigue={0} />
            </mesh>

            {/* Shoulders */}
            <mesh position={[-0.9 * chestScale, 2.1, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <HologramMaterial
                    color={getColor("shoulders")}
                    fatigue={getFatigue("shoulders")}
                />
            </mesh>
            <mesh position={[0.9 * chestScale, 2.1, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <HologramMaterial
                    color={getColor("shoulders")}
                    fatigue={getFatigue("shoulders")}
                />
            </mesh>

            {/* Arms */}
            <mesh
                position={[-0.8 * chestScale, 1.5, 0]}
                scale={[
                    0.3 + attributes.hypertrophy / 50,
                    1.2,
                    0.3 + attributes.hypertrophy / 50,
                ]}
            >
                <capsuleGeometry args={[0.3, 1, 4, 8]} />
                <HologramMaterial
                    color={getColor("triceps")}
                    fatigue={getFatigue("triceps")}
                />
            </mesh>
            <mesh
                position={[0.8 * chestScale, 1.5, 0]}
                scale={[
                    0.3 + attributes.hypertrophy / 50,
                    1.2,
                    0.3 + attributes.hypertrophy / 50,
                ]}
            >
                <capsuleGeometry args={[0.3, 1, 4, 8]} />
                <HologramMaterial
                    color={getColor("triceps")}
                    fatigue={getFatigue("triceps")}
                />
            </mesh>

            {/* Legs */}
            <mesh position={[-0.3, 0, 0]} scale={[legScale, 1.5, legScale]}>
                <cylinderGeometry args={[0.25, 0.2, 1.5]} />
                <HologramMaterial
                    color={getColor("quads")}
                    fatigue={getFatigue("quads")}
                />
            </mesh>
            <mesh position={[0.3, 0, 0]} scale={[legScale, 1.5, legScale]}>
                <cylinderGeometry args={[0.25, 0.2, 1.5]} />
                <HologramMaterial
                    color={getColor("quads")}
                    fatigue={getFatigue("quads")}
                />
            </mesh>
        </group>
    );
};

const AvatarViewerVisual: React.FC<AvatarViewerVisualProps> = ({
    attributes,
    isElite,
    muscleHeatmap,
}) => {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 2, 5]} />
            <OrbitControls
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
            />

            <ambientLight intensity={0.2} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={2}
                castShadow
                color={isElite ? "#ffd700" : "#c79c6e"}
            />
            <pointLight position={[-10, 5, -10]} intensity={1} color="#00e5ff" />

            <TitanMesh
                attributes={attributes}
                isElite={isElite}
                heatmap={muscleHeatmap}
            />

            {/* Sci-Fi Grid Floor */}
            <gridHelper
                args={[20, 20, 0x444444, 0x111111]}
                position={[0, -0.79, 0]}
            />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
                <circleGeometry args={[2, 32]} />
                <meshStandardMaterial color="#000" opacity={0.8} transparent />
            </mesh>

            {/* Environmental Dust/Stars */}
            <Environment preset="night" />
        </Canvas>
    );
};

export default AvatarViewerVisual;

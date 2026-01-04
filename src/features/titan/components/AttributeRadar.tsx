import React from "react";
import { TitanAttributes } from "@/types";

interface AttributeRadarProps {
  attributes: TitanAttributes;
}

const AttributeRadar: React.FC<AttributeRadarProps> = ({ attributes }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const maxStat = 20;

  // Order of attributes on the hexagon (Clockwise from top)
  const keys: (keyof TitanAttributes)[] = [
    "strength", // Top
    "hypertrophy", // Top Right
    "endurance", // Bottom Right
    "recovery", // Bottom
    "technique", // Bottom Left
    "mental", // Top Left
  ];

  const labels = {
    strength: "Strength",
    hypertrophy: "Hypertrophy",
    endurance: "Endurance",
    recovery: "Recovery",
    technique: "Technique",
    mental: "Mental",
  };

  const getPoint = (value: number, index: number, max: number = maxStat) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2; // Start at -90deg (Top)
    const r = (value / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  // Create the path for the player's stats
  const points = keys.map((key, i) => getPoint(attributes[key], i)).join(" ");

  // Create grid lines (concentric hexagons)
  const gridLevels = [5, 10, 15, 20];

  return (
    <div className="relative w-full max-w-[300px] aspect-square mx-auto flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full overflow-visible"
      >
        {/* Background Grid */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={keys.map((_, i) => getPoint(level, i, 20)).join(" ")}
            fill="none"
            stroke="#333"
            strokeWidth="1"
            className="opacity-50"
          />
        ))}

        {/* Axis Lines */}
        {keys.map((_, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={getPoint(20, i, 20).split(",")[0]}
            y2={getPoint(20, i, 20).split(",")[1]}
            stroke="#333"
            strokeWidth="1"
            className="opacity-30"
          />
        ))}

        {/* The Stat Polygon */}
        <polygon
          points={points}
          fill="rgba(34, 211, 238, 0.2)" // Cyan tint
          stroke="#22d3ee"
          strokeWidth="2"
          className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000 ease-out"
        />

        {/* Dots at vertices */}
        {keys.map((key, i) => {
          const [x, y] = getPoint(attributes[key], i).split(",");
          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r="3"
              fill="#fff"
              className="drop-shadow-md"
            />
          );
        })}

        {/* Labels */}
        {keys.map((key, i) => {
          // Push labels out slightly further than radius
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const labelR = radius + 20;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);

          // Anchor adjustment based on position
          let anchor: "start" | "middle" | "end" = "middle";
          if (i === 1 || i === 2) anchor = "start";
          if (i === 4 || i === 5) anchor = "end";

          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#9ca3af" // Zinc-400
              fontSize="8"
              fontWeight="bold"
              className="uppercase tracking-widest font-sans"
            >
              {labels[key]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default AttributeRadar;

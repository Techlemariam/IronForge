import React from "react";
import { TTBIndices } from "../types";

interface TTBCompassProps {
  indices: TTBIndices;
}

const TTBCompass: React.FC<TTBCompassProps> = ({ indices }) => {
  const size = 120;
  const center = size / 2;
  const radius = 45;

  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  const getCoords = (angle: number, score: number, maxScore: number = 100) => {
    const r = (score / maxScore) * radius;
    const x = center + r * Math.cos(degToRad(angle));
    const y = center + r * Math.sin(degToRad(angle));
    return { x, y };
  };

  const pWellness = getCoords(-90, indices.wellness);
  const pStrength = getCoords(30, indices.strength);
  const pEndurance = getCoords(150, indices.endurance);

  const maxWellness = getCoords(-90, 100);
  const maxStrength = getCoords(30, 100);
  const maxEndurance = getCoords(150, 100);

  const healthPercentage = indices.wellness;
  const healthStatus =
    healthPercentage > 85
      ? "FRESH"
      : healthPercentage > 60
        ? "STABLE"
        : healthPercentage > 30
          ? "FATIGUED"
          : "DEPLETED";
  const healthColor =
    healthPercentage > 70
      ? "bg-rarity-rare"
      : healthPercentage > 40
        ? "bg-warrior-light"
        : "bg-magma";

  return (
    <div className="bg-[#111] border-2 border-[#46321d] rounded-lg shadow-2xl relative overflow-hidden group p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-serif text-sm uppercase tracking-widest text-warrior-light">
            Sys. Vitality
          </h3>
          <span className="text-xs font-mono bg-forge-900 text-rarity-rare px-2 py-1 rounded text-shadow-neon-cyan">
            TSB-S
          </span>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full drop-shadow-2xl overflow-visible"
            >
              <defs>
                <radialGradient
                  id="radarGradient"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="rgba(255, 215, 0, 0.1)" />
                  <stop offset="100%" stopColor="rgba(255, 215, 0, 0.3)" />
                </radialGradient>
              </defs>

              {/* Background Grid */}
              <line
                x1={center}
                y1={center}
                x2={maxWellness.x}
                y2={maxWellness.y}
                stroke="#4f422e"
                strokeWidth="1"
              />
              <line
                x1={center}
                y1={center}
                x2={maxStrength.x}
                y2={maxStrength.y}
                stroke="#4f422e"
                strokeWidth="1"
              />
              <line
                x1={center}
                y1={center}
                x2={maxEndurance.x}
                y2={maxEndurance.y}
                stroke="#4f422e"
                strokeWidth="1"
              />

              {[25, 50, 75, 100].map((pct) => {
                const w = getCoords(-90, pct);
                const s = getCoords(30, pct);
                const e = getCoords(150, pct);
                return (
                  <polygon
                    key={pct}
                    points={`${w.x},${w.y} ${s.x},${s.y} ${e.x},${e.y}`}
                    fill="none"
                    stroke="#4f422e"
                    strokeWidth={pct === 100 ? 1.5 : 0.5}
                  />
                );
              })}

              {/* Data Shape */}
              <polygon
                points={`${pWellness.x},${pWellness.y} ${pStrength.x},${pStrength.y} ${pEndurance.x},${pEndurance.y}`}
                fill="url(#radarGradient)"
                stroke="#ffd700"
                strokeWidth="2"
                className="drop-shadow-[0_0_8px_rgba(255,215,0,0.7)] transition-all duration-1000 ease-out"
              />

              {/* Vertices */}
              <circle cx={pWellness.x} cy={pWellness.y} r="3" fill="#ffd700" />
              <circle cx={pStrength.x} cy={pStrength.y} r="3" fill="#ffd700" />
              <circle
                cx={pEndurance.x}
                cy={pEndurance.y}
                r="3"
                fill="#ffd700"
              />

              {/* Labels */}
              <text
                x={maxWellness.x - 10}
                y={maxWellness.y + 5}
                textAnchor="end"
                fill="#c79c6e"
                fontSize="8"
                fontWeight="bold"
                className="uppercase font-serif"
              >
                HEL
              </text>
              <text
                x={maxStrength.x + 10}
                y={maxStrength.y + 5}
                textAnchor="start"
                fill="#c79c6e"
                fontSize="8"
                fontWeight="bold"
                className="uppercase font-serif"
              >
                STR
              </text>
              <text
                x={maxEndurance.x - 10}
                y={maxEndurance.y + 5}
                textAnchor="end"
                fill="#c79c6e"
                fontSize="8"
                fontWeight="bold"
                className="uppercase font-serif"
              >
                END
              </text>
            </svg>
          </div>

          <div className="w-full px-2 mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-serif text-warrior">
                HEALTH (TSB)
              </span>
              <span className={`text-xs font-bold text-warrior-light`}>
                {healthStatus}
              </span>
            </div>
            <div className="w-full bg-forge-800 rounded-full h-2.5">
              <div
                className={`${healthColor} h-2.5 rounded-full`}
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTBCompass;

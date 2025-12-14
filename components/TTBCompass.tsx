
import React from 'react';
import { TTBIndices } from '../types';

interface TTBCompassProps {
  indices: TTBIndices;
}

const TTBCompass: React.FC<TTBCompassProps> = ({ indices }) => {
  // SVG Config
  const size = 120;
  const center = size / 2;
  const radius = 45;

  // Angles: Top (-90), Bottom Right (30), Bottom Left (150)
  const degToRad = (deg: number) => (deg * Math.PI) / 180;
  
  const getCoords = (angle: number, score: number, maxScore: number = 100) => {
    const r = (score / maxScore) * radius;
    const x = center + r * Math.cos(degToRad(angle));
    const y = center + r * Math.sin(degToRad(angle));
    return { x, y };
  };

  // Coordinates for Data Points
  const pWellness = getCoords(-90, indices.wellness);
  const pStrength = getCoords(30, indices.strength);
  const pEndurance = getCoords(150, indices.endurance);

  // Coordinates for Max (100%)
  const maxWellness = getCoords(-90, 100);
  const maxStrength = getCoords(30, 100);
  const maxEndurance = getCoords(150, 100);

  // Identify Lowest for highlighting
  let lowestCoords = pWellness;
  if (indices.lowest === 'strength') lowestCoords = pStrength;
  if (indices.lowest === 'endurance') lowestCoords = pEndurance;

  return (
    <div className="relative flex flex-col items-center">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
        TTB Compass
      </h3>
      <div className="relative w-40 h-40">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-2xl overflow-visible">
           {/* Defs for gradients */}
           <defs>
             <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
               <stop offset="0%" stopColor="rgba(255, 215, 0, 0.05)" />
               <stop offset="100%" stopColor="rgba(255, 215, 0, 0.2)" />
             </radialGradient>
           </defs>

           {/* --- BACKGROUND GRID --- */}
           {/* Axis Lines */}
           <line x1={center} y1={center} x2={maxWellness.x} y2={maxWellness.y} stroke="#333" strokeWidth="1" />
           <line x1={center} y1={center} x2={maxStrength.x} y2={maxStrength.y} stroke="#333" strokeWidth="1" />
           <line x1={center} y1={center} x2={maxEndurance.x} y2={maxEndurance.y} stroke="#333" strokeWidth="1" />

           {/* Concentric Triangles (25%, 50%, 75%, 100%) */}
           {[25, 50, 75, 100].map((pct) => {
               const w = getCoords(-90, pct);
               const s = getCoords(30, pct);
               const e = getCoords(150, pct);
               return (
                   <polygon 
                     key={pct}
                     points={`${w.x},${w.y} ${s.x},${s.y} ${e.x},${e.y}`} 
                     fill="none" 
                     stroke="#222" 
                     strokeWidth="1"
                     strokeDasharray={pct === 100 ? "0" : "2 2"}
                   />
               );
           })}
           
           {/* --- DATA SHAPE --- */}
           <polygon 
             points={`${pWellness.x},${pWellness.y} ${pStrength.x},${pStrength.y} ${pEndurance.x},${pEndurance.y}`} 
             fill="url(#radarGradient)" 
             stroke="#ffd700" 
             strokeWidth="2"
             className="drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] transition-all duration-1000 ease-out"
           />

           {/* --- VERTICES --- */}
           {/* Wellness Node */}
           <circle cx={pWellness.x} cy={pWellness.y} r="3" fill={indices.lowest === 'wellness' ? '#ef4444' : '#60a5fa'} className="transition-all duration-1000" />
           
           {/* Strength Node */}
           <circle cx={pStrength.x} cy={pStrength.y} r="3" fill={indices.lowest === 'strength' ? '#ef4444' : '#c79c6e'} className="transition-all duration-1000" />
           
           {/* Endurance Node */}
           <circle cx={pEndurance.x} cy={pEndurance.y} r="3" fill={indices.lowest === 'endurance' ? '#ef4444' : '#22d3ee'} className="transition-all duration-1000" />

           {/* --- ALERT RING (Lowest) --- */}
           <circle 
                cx={lowestCoords.x} 
                cy={lowestCoords.y} 
                r="6" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="1" 
                className="animate-ping opacity-75" 
           />

           {/* --- LABELS --- */}
           {/* Top */}
           <text x={maxWellness.x} y={maxWellness.y - 10} textAnchor="middle" fill={indices.lowest === 'wellness' ? '#ef4444' : '#60a5fa'} fontSize="8" fontWeight="bold" className="uppercase">Wellness</text>
           {/* Bottom Right */}
           <text x={maxStrength.x + 10} y={maxStrength.y + 5} textAnchor="start" fill={indices.lowest === 'strength' ? '#ef4444' : '#c79c6e'} fontSize="8" fontWeight="bold" className="uppercase">Str</text>
           {/* Bottom Left */}
           <text x={maxEndurance.x - 10} y={maxEndurance.y + 5} textAnchor="end" fill={indices.lowest === 'endurance' ? '#ef4444' : '#22d3ee'} fontSize="8" fontWeight="bold" className="uppercase">End</text>

        </svg>
      </div>
      
      {/* Score Readout Table */}
      <div className="flex gap-6 mt-[-15px] z-10">
          <div className="text-center">
              <div className="text-[9px] text-zinc-600 uppercase mb-0.5">W (Rec)</div>
              <div className={`text-sm font-mono font-bold ${indices.lowest === 'wellness' ? 'text-red-500' : 'text-blue-400'}`}>{indices.wellness}</div>
          </div>
          <div className="text-center">
              <div className="text-[9px] text-zinc-600 uppercase mb-0.5">S (Pwr)</div>
              <div className={`text-sm font-mono font-bold ${indices.lowest === 'strength' ? 'text-red-500' : 'text-[#c79c6e]'}`}>{indices.strength}</div>
          </div>
          <div className="text-center">
              <div className="text-[9px] text-zinc-600 uppercase mb-0.5">E (Cap)</div>
              <div className={`text-sm font-mono font-bold ${indices.lowest === 'endurance' ? 'text-red-500' : 'text-cyan-400'}`}>{indices.endurance}</div>
          </div>
      </div>
    </div>
  );
};

export default TTBCompass;

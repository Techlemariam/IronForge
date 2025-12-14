
import React from 'react';
import { TTBIndices } from '../types';
import { Activity, HeartPulse, Zap } from 'lucide-react';

interface TTB_RadarProps {
  indices: TTBIndices | null;
  tsb: number; // Training Stress Balance
}

const TTB_Radar: React.FC<TTB_RadarProps> = ({ indices, tsb }) => {
  // Default values if null (e.g. initial load)
  const stats = indices || { strength: 50, endurance: 50, wellness: 50, lowest: 'strength' };

  // --- RADAR CONFIG ---
  const size = 160;
  const center = size / 2;
  const radius = 60;
  
  // Vertices
  const getCoords = (angle: number, score: number) => {
    const r = (score / 100) * radius;
    const rad = (angle * Math.PI) / 180;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  // Angles: Strength (Top-Left), Endurance (Top-Right), Wellness (Bottom)
  // Rotating slightly to make it look cool
  const angleS = 210;
  const angleE = 330;
  const angleW = 90;

  const pS = getCoords(angleS, stats.strength);
  const pE = getCoords(angleE, stats.endurance);
  const pW = getCoords(angleW, stats.wellness);

  // Background Triangle (100%)
  const maxS = getCoords(angleS, 100);
  const maxE = getCoords(angleE, 100);
  const maxW = getCoords(angleW, 100);

  // --- TSB (HP) LOGIC ---
  // TSB Range: -40 (Dead) to +20 (Fresh)
  // Normalized 0-100 for bar: -30 = 0%, +10 = 100%
  const hpPercent = Math.max(0, Math.min(100, ((tsb + 30) / 40) * 100));
  
  let hpColor = "bg-emerald-500";
  let hpText = "FRESH";
  let barGlow = "shadow-[0_0_10px_#10b981]";

  if (tsb < -20) {
      hpColor = "bg-magma";
      hpText = "CRITICAL";
      barGlow = "shadow-[0_0_10px_#ff3300] animate-pulse";
  } else if (tsb < -5) {
      hpColor = "bg-yellow-500";
      hpText = "FATIGUED";
      barGlow = "shadow-[0_0_5px_#eab308]";
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-forge-900 border border-forge-border rounded-lg shadow-2xl relative overflow-hidden group">
      
      {/* Header */}
      <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-magma" />
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-400">Sys.Vitality</span>
          </div>
          <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-zinc-700 bg-black/50 ${tsb < -10 ? 'text-magma' : 'text-emerald-400'}`}>
              TSB {tsb > 0 ? '+' : ''}{tsb}
          </div>
      </div>

      {/* Radar Chart */}
      <div className="relative h-40 flex items-center justify-center z-10">
          {/* Background Grid */}
          <svg width={size} height={size} className="overflow-visible">
              <defs>
                  <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff3300" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#ff3300" stopOpacity="0.1"/>
                  </linearGradient>
              </defs>
              
              {/* Outer Frame */}
              <polygon 
                  points={`${maxS.x},${maxS.y} ${maxE.x},${maxE.y} ${maxW.x},${maxW.y}`} 
                  fill="none" 
                  stroke="#3f4148" 
                  strokeWidth="1"
                  strokeDasharray="4 2"
              />
              {/* Inner Frame (50%) */}
              <polygon 
                  points={`${getCoords(angleS, 50).x},${getCoords(angleS, 50).y} ${getCoords(angleE, 50).x},${getCoords(angleE, 50).y} ${getCoords(angleW, 50).x},${getCoords(angleW, 50).y}`} 
                  fill="none" 
                  stroke="#3f4148" 
                  strokeWidth="1" 
                  opacity="0.5"
              />
              
              {/* Axis Lines */}
              <line x1={center} y1={center} x2={maxS.x} y2={maxS.y} stroke="#2a2b2e" strokeWidth="1" />
              <line x1={center} y1={center} x2={maxE.x} y2={maxE.y} stroke="#2a2b2e" strokeWidth="1" />
              <line x1={center} y1={center} x2={maxW.x} y2={maxW.y} stroke="#2a2b2e" strokeWidth="1" />

              {/* Data Polygon */}
              <polygon 
                  points={`${pS.x},${pS.y} ${pE.x},${pE.y} ${pW.x},${pW.y}`} 
                  fill="url(#radarFill)" 
                  stroke="#ff3300" 
                  strokeWidth="2"
                  className="drop-shadow-[0_0_8px_rgba(255,51,0,0.5)] transition-all duration-700 ease-out"
              />

              {/* Vertices */}
              <circle cx={pS.x} cy={pS.y} r="2" fill={stats.lowest === 'strength' ? '#fff' : '#ff3300'} />
              <circle cx={pE.x} cy={pE.y} r="2" fill={stats.lowest === 'endurance' ? '#fff' : '#ff3300'} />
              <circle cx={pW.x} cy={pW.y} r="2" fill={stats.lowest === 'wellness' ? '#fff' : '#ff3300'} />

              {/* Labels */}
              <text x={maxS.x - 15} y={maxS.y} fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">STR</text>
              <text x={maxE.x + 5} y={maxE.y} fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">END</text>
              <text x={maxW.x} y={maxW.y + 12} textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">WEL</text>
          </svg>
      </div>

      {/* HP Bar (TSB) */}
      <div className="space-y-1 z-10">
          <div className="flex justify-between items-end">
              <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Health (TSB)</span>
              <span className={`text-[9px] font-black uppercase ${hpColor.replace('bg-', 'text-')}`}>{hpText}</span>
          </div>
          <div className="h-2 bg-black border border-zinc-800 rounded-sm overflow-hidden relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex justify-between px-1 z-20">
                  <div className="w-px h-full bg-black/50"></div>
                  <div className="w-px h-full bg-black/50"></div>
                  <div className="w-px h-full bg-black/50"></div>
                  <div className="w-px h-full bg-black/50"></div>
              </div>
              <div 
                  className={`h-full ${hpColor} ${barGlow} transition-all duration-700 ease-in-out`}
                  style={{ width: `${hpPercent}%` }}
              ></div>
          </div>
      </div>

      {/* Industrial Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-magma/10 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default TTB_Radar;

import React from 'react';
import { calculatePlates } from '../utils';

interface PlateVisualizerProps {
  weight: number;
  isSingleLoaded?: boolean;
}

const PlateVisualizer: React.FC<PlateVisualizerProps> = ({ weight, isSingleLoaded = false }) => {
  const plates = calculatePlates(weight, 20, isSingleLoaded);

  const getPlateColor = (p: number) => {
    switch (p) {
      case 25: return 'bg-red-600 h-24 border-red-800';
      case 20: return 'bg-blue-600 h-24 border-blue-800';
      case 15: return 'bg-yellow-500 h-20 border-yellow-700';
      case 10: return 'bg-green-600 h-16 border-green-800';
      case 5: return 'bg-white h-12 border-zinc-400';
      case 2.5: return 'bg-zinc-800 h-10 border-zinc-600';
      default: return 'bg-zinc-500 h-8 border-zinc-700';
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mt-2">
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
        {isSingleLoaded ? 'Landmine Load' : 'Plate Math'} ({weight}kg)
      </span>
      <div className="flex items-center gap-1">
        {/* Barbell End */}
        <div className="w-4 h-6 bg-zinc-400 rounded-sm"></div>
        {/* Sleeve */}
        <div className="flex items-center gap-px bg-zinc-800 px-1 py-4 rounded shadow-inner">
          {plates.length === 0 && <span className="text-zinc-600 text-xs px-2">Empty Bar</span>}
          {plates.map((plate, idx) => (
            <div
              key={idx}
              className={`w-3 md:w-4 rounded-sm border-r-2 shadow-lg ${getPlateColor(plate)}`}
              title={`${plate}kg`}
            />
          ))}
        </div>
        {/* Collar */}
        <div className="w-2 h-8 bg-orange-600 rounded"></div>
      </div>
      <div className="mt-2 flex gap-2 text-xs font-mono text-zinc-400">
        {plates.map((p, i) => (
          <span key={i}>{p}</span>
        ))}
      </div>
    </div>
  );
};

export default PlateVisualizer;
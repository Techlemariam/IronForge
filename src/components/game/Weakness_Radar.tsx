// src/components/game/Weakness_Radar.tsx
import React from 'react';
import { MuscleVolume } from '../../utils/weaknessAuditor';

interface WeaknessRadarProps {
    muscleData: MuscleVolume[];
    isLoading: boolean;
}

/**
 * Determines the color code based on volume.
 * Green: High volume
 * Orange: Medium volume
 * Red: Low volume
 */
const getVolumeColor = (volume: number, maxVolume: number): string => {
    if (maxVolume === 0) return 'bg-gray-700'; // Default if no volume
    const ratio = volume / maxVolume;

    if (ratio > 0.66) return 'bg-green-600';
    if (ratio > 0.33) return 'bg-orange-500';
    return 'bg-red-600';
};

const WeaknessRadar: React.FC<WeaknessRadarProps> = ({ muscleData, isLoading }) => {
    if (isLoading) {
        return <div className="text-center p-4">Analyzing Battle Logs...</div>;
    }

    if (!muscleData || muscleData.length === 0) {
        return <div className="text-center p-4">No training data available to analyze.</div>;
    }

    const maxVolume = Math.max(...muscleData.map(d => d.volume), 0);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-center mb-4">Weakness Radar</h3>
            <div className="space-y-2">
                {muscleData.map(({ muscleGroup, volume }) => (
                    <div key={muscleGroup} className="grid grid-cols-3 items-center gap-2">
                        <div className="text-sm font-medium text-gray-300">{muscleGroup}</div>
                        <div className="col-span-2 bg-gray-700 rounded-full h-4">
                             <div 
                                className={`h-4 rounded-full ${getVolumeColor(volume, maxVolume)}`}
                                style={{ width: `${maxVolume > 0 ? (volume / maxVolume) * 100 : 0}%` }}
                             ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeaknessRadar;

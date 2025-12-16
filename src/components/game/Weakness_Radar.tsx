
import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface WeaknessRadarProps {
    weeklyVolume: { [key: string]: number };
}

const WeaknessRadar: React.FC<WeaknessRadarProps> = ({ weeklyVolume }) => {
    const totalVolume = Object.values(weeklyVolume).reduce((acc, val) => acc + val, 0);

    const getTierColor = (volume: number) => {
        if (totalVolume === 0) return '#6b7280';
        const percentage = (volume / totalVolume) * 100;
        if (percentage < 20) return '#ef4444'; // Red
        if (percentage < 35) return '#f97316'; // Orange
        return '#22c55e'; // Green
    };

    const hasData = Object.keys(weeklyVolume).length > 0;

    return (
        <div>
            <h3 className="text-center font-mono text-rune uppercase tracking-widest mb-6">Weakness Radar</h3>
            {hasData ? (
                <div className="flex justify-around items-end">
                    {Object.entries(weeklyVolume).map(([muscle, volume]) => (
                        <div key={muscle} className="text-center w-20">
                            <div
                                className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-2 transition-all"
                                style={{ backgroundColor: getTierColor(volume) }}
                            />
                            <p className="text-sm font-bold capitalize">{muscle.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-forge-muted">{volume} sets</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 flex flex-col items-center justify-center text-forge-muted">
                    <ShieldAlert className="w-12 h-12 text-yellow-600/80 mb-4" />
                    <p className="text-yellow-400/90 font-semibold">Insufficient Data for Analysis</p>
                    <p className="text-xs mt-2">Complete more workouts to activate the radar.</p>
                </div>
            )}
        </div>
    );
};

export default WeaknessRadar;

'use client';

import dynamic from 'next/dynamic';

const ExerciseProgressChartVisual = dynamic(() => import('./ExerciseProgressChartVisual'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-black/20 rounded-lg animate-pulse border border-white/5" />
    ),
});

interface HistoryPoint {
    date: string;
    e1rm: number;
    volume: number;
}

interface ExerciseProgressChartProps {
    data: HistoryPoint[];
    isLoading?: boolean;
}

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full h-48 bg-black/20 rounded-lg p-2 border border-white/5 animate-pulse">
                <div className="h-4 w-32 bg-zinc-800 rounded mb-4 ml-1" />
                <div className="h-32 bg-zinc-800/50 rounded" />
            </div>
        );
    }

    if (!data || data.length < 2) {
        return (
            <div className="h-32 flex items-center justify-center text-zinc-600 text-xs">
                Not enough data for chart
            </div>
        );
    }

    return (
        <div className="w-full h-48 bg-black/20 rounded-lg p-2 border border-white/5">
            <div className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider ml-1">Estimated 1RM Trend</div>
            <ExerciseProgressChartVisual data={data} />
        </div>
    );
};

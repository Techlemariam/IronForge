import { useState, useEffect } from 'react';
import { getLastSetForExercise } from '../actions/history';

export const useSetHistory = (exerciseId: string, exerciseName?: string) => {
    const [history, setHistory] = useState<{ weight: number; reps: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchHistory = async () => {
            try {
                const data = await getLastSetForExercise(exerciseId, exerciseName);
                if (mounted && data) {
                    setHistory(data);
                }
            } catch (err) {
                console.error("History fetch error", err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        if (exerciseId) {
            fetchHistory();
        } else {
            setIsLoading(false);
        }

        return () => { mounted = false; };
    }, [exerciseId]);

    return { history, isLoading };
};

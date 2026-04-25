// src/hooks/useMaxReps.ts
'use client';

import { checkPRAction, getMaxRepsAction } from '@/actions/training/max-reps';
import { StorageService as Storage } from '@/services/storage';
import { useCallback, useEffect, useState } from 'react';

interface UseMaxRepsResult {
  maxReps: number | null;
  isLoading: boolean;
  isNewPR: boolean;
  checkPR: (reps: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const PR_CACHE_PREFIX = 'ironforge_pr_';

/**
 * Client hook for fetching and caching rep PRs.
 * Uses StorageService (IndexedDB) for offline support.
 */
export const useMaxReps = (exerciseId: string, weight?: number): UseMaxRepsResult => {
  const [maxReps, setMaxReps] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPR, setIsNewPR] = useState(false);

  const cacheKey = `${PR_CACHE_PREFIX}${exerciseId}_${weight ?? 'bw'}`;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try cache first (offline support)
      const cached = await Storage.getItem<{ maxReps: number }>(cacheKey);
      if (cached && cached.maxReps !== undefined) {
        setMaxReps(cached.maxReps);
      }

      // Fetch fresh from server
      const result = await getMaxRepsAction(exerciseId, weight);
      if (result.success && result.maxReps !== undefined) {
        setMaxReps(result.maxReps);
        Storage.setItem(cacheKey, { maxReps: result.maxReps });
      }
    } catch (error) {
      console.error('Failed to fetch max reps:', error);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, weight, cacheKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkPR = useCallback(
    async (reps: number): Promise<boolean> => {
      try {
        const result = await checkPRAction(exerciseId, reps, weight);
        if (result.success && result.isPR) {
          setIsNewPR(true);
          setMaxReps(reps);
          // Update cache
          Storage.setItem(cacheKey, { maxReps: reps });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to check PR:', error);
        // Fallback: local check
        const isPR = maxReps === null || reps > maxReps;
        if (isPR) {
          setIsNewPR(true);
          setMaxReps(reps);
        }
        return isPR;
      }
    },
    [exerciseId, weight, maxReps, cacheKey]
  );

  return { maxReps, isLoading, isNewPR, checkPR, refresh };
};

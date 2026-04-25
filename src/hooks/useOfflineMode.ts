'use client';

import { StorageService as Storage } from '@/services/storage';
import { useCallback, useEffect, useState } from 'react';

interface OfflineAction {
  id: string;
  type: 'LOG_SET' | 'LOG_CARDIO' | 'COMPLETE_WORKOUT' | 'UPDATE_NOTE';
  payload: unknown;
  timestamp: Date;
  synced: boolean;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: number;
  lastSyncTime: Date | null;
}

const OFFLINE_STORAGE_KEY = 'ironforge_offline_queue';

/**
 * Hook for offline mode support.
 */
export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from storage
    const loadPending = async () => {
      const stored = await Storage.getItem<OfflineAction[]>(OFFLINE_STORAGE_KEY);
      if (stored) {
        setPendingActions(stored.filter((a) => !a.synced));
      }
    };
    loadPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = useCallback((type: OfflineAction['type'], payload: unknown) => {
    const action: OfflineAction = {
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      payload,
      timestamp: new Date(),
      synced: false,
    };

    setPendingActions((prev) => {
      const updated = [...prev, action];
      Storage.setItem(OFFLINE_STORAGE_KEY, updated);
      return updated;
    });

    return action.id;
  }, []);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    console.log(`Syncing ${pendingActions.length} offline actions...`);

    for (const action of pendingActions) {
      try {
        // In production, send to server
        console.log(`Syncing action ${action.id}: ${action.type}`);
        action.synced = true;
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }

    const synced = pendingActions.filter((a) => a.synced);
    const remaining = pendingActions.filter((a) => !a.synced);

    setPendingActions(remaining);
    Storage.setItem(OFFLINE_STORAGE_KEY, remaining);
    setLastSyncTime(new Date());

    console.log(`Synced ${synced.length} actions, ${remaining.length} remaining`);
  }, [isOnline, pendingActions]);

  const clearQueue = useCallback(() => {
    setPendingActions([]);
    Storage.removeItem(OFFLINE_STORAGE_KEY);
  }, []);

  const getOfflineState = useCallback(
    (): OfflineState => ({
      isOnline,
      pendingActions: pendingActions.length,
      lastSyncTime,
    }),
    [isOnline, pendingActions.length, lastSyncTime]
  );

  // Sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline, syncPendingActions]);

  return {
    isOnline,
    pendingActions: pendingActions.length,
    lastSyncTime,
    queueAction,
    syncPendingActions,
    clearQueue,
    getOfflineState,
  };
}

/**
 * Offline-aware set logger.
 */
export function logSetOffline(
  queueAction: (type: OfflineAction['type'], payload: unknown) => string,
  exerciseId: string,
  weight: number,
  reps: number,
  setNumber: number
): string {
  return queueAction('LOG_SET', {
    exerciseId,
    weight,
    reps,
    setNumber,
    date: new Date().toISOString(),
  });
}

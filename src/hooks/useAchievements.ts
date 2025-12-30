import { useState, useCallback, useEffect } from "react";
import { ACHIEVEMENTS } from "../data/static";
import { Achievement } from "../types";
import { playSound } from "../utils";
import { StorageService } from "../services/storage";

export const useAchievements = () => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from DB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await StorageService.init();
        const saved = await StorageService.getState<string[]>("achievements");
        if (saved) {
          setUnlockedIds(new Set(saved));
        } else {
          // Fallback migration check
          await StorageService.migrateFromLocalStorage();
          const migrated =
            await StorageService.getState<string[]>("achievements");
          if (migrated) setUnlockedIds(new Set(migrated));
        }
      } catch (e) {
        console.error("Failed to load achievements", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setUnlockedIds((prev) => {
      if (prev.has(id)) return prev; // Already unlocked

      const next = new Set(prev);
      next.add(id);

      // Persist Async
      const arrayData = Array.from(next);
      StorageService.saveState("achievements", arrayData).catch(console.error);

      // Trigger Sound & Toast
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        playSound("achievement");
        setToastQueue((q) => [...q, achievement]);
      }

      return next;
    });
  }, []);

  const clearToast = useCallback(() => {
    setToastQueue((q) => q.slice(1));
  }, []);

  return {
    unlockedIds,
    unlockAchievement,
    currentToast: toastQueue[0] || null,
    clearToast,
    loading,
  };
};

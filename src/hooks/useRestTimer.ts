// src/hooks/useRestTimer.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface RestTimerState {
  isActive: boolean;
  endTime: number | null; // Unix timestamp
  initialSeconds: number;
  totalSeconds: number; // For progress bar calculation
  start: (seconds: number) => void;
  stop: () => void;
  addTime: (seconds: number) => void;
  reset: () => void;
  check: () => void; // call in component loop
  timeLeft: number;
  hasFinished: boolean;
}

export const useRestTimer = create<RestTimerState>()(
  persist(
    (set, get) => ({
      isActive: false,
      endTime: null,
      initialSeconds: 90,
      totalSeconds: 90,
      timeLeft: 90,
      hasFinished: false,

      start: (seconds: number) => {
        const now = Date.now();
        set({
          isActive: true,
          initialSeconds: seconds,
          totalSeconds: seconds,
          endTime: now + seconds * 1000,
          timeLeft: seconds,
          hasFinished: false,
        });
      },

      stop: () => {
        set({ isActive: false, endTime: null, hasFinished: false });
      },

      addTime: (seconds: number) => {
        const { endTime, isActive } = get();
        if (!isActive || !endTime) return;
        const newEndTime = endTime + seconds * 1000;
        set({ endTime: newEndTime });
        // Update immediately
        const now = Date.now();
        const diff = Math.ceil((newEndTime - now) / 1000);
        set({ timeLeft: Math.max(0, diff) });
      },

      reset: () => {
        set({ isActive: false, endTime: null, timeLeft: 90, hasFinished: false });
      },

      check: () => {
        const { endTime, isActive } = get();
        if (isActive && endTime) {
          const now = Date.now();
          const diff = Math.ceil((endTime - now) / 1000);

          if (diff <= 0) {
            set({ isActive: false, endTime: null, timeLeft: 0, hasFinished: true });
          } else {
            set({ timeLeft: diff });
          }
        }
      }
    }),
    {
      name: "ironforge-rest-timer",
      storage: createJSONStorage(() => localStorage),
      // Only persist essential state to restore
      partialize: (state) => ({
        isActive: state.isActive,
        endTime: state.endTime,
        initialSeconds: state.initialSeconds,
        totalSeconds: state.totalSeconds,
        hasFinished: state.hasFinished
      }),
    }
  )
);

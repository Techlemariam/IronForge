"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface RestTimerConfig {
  defaultSeconds: number;
  autoStart: boolean;
  alertAt: number[]; // seconds remaining to alert (e.g., [10, 5, 0])
  vibrate: boolean;
  sound: boolean;
  soundUrl?: string;
}

interface RestTimerState {
  seconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

const DEFAULT_CONFIG: RestTimerConfig = {
  defaultSeconds: 90,
  autoStart: false,
  alertAt: [10, 5, 0],
  vibrate: true,
  sound: true,
};

export function useRestTimer(config: Partial<RestTimerConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<RestTimerState>({
    seconds: mergedConfig.defaultSeconds,
    isRunning: false,
    isComplete: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize audio
    if (typeof window !== "undefined" && mergedConfig.sound) {
      audioRef.current = new Audio(
        mergedConfig.soundUrl || "/sounds/timer-beep.mp3",
      );
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mergedConfig.sound, mergedConfig.soundUrl]);

  const playAlert = useCallback(() => {
    if (mergedConfig.vibrate && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    if (mergedConfig.sound && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [mergedConfig.vibrate, mergedConfig.sound]);

  const start = useCallback(
    (seconds?: number) => {
      const duration = seconds ?? mergedConfig.defaultSeconds;
      setState({ seconds: duration, isRunning: true, isComplete: false });

      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newSeconds = prev.seconds - 1;

          // Check for alerts
          if (mergedConfig.alertAt.includes(newSeconds)) {
            playAlert();
          }

          if (newSeconds <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return { seconds: 0, isRunning: false, isComplete: true };
          }

          return { ...prev, seconds: newSeconds };
        });
      }, 1000);
    },
    [mergedConfig.defaultSeconds, mergedConfig.alertAt, playAlert],
  );

  const pause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    if (state.seconds > 0 && !state.isRunning) {
      setState((prev) => ({ ...prev, isRunning: true }));
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newSeconds = prev.seconds - 1;
          if (mergedConfig.alertAt.includes(newSeconds)) playAlert();
          if (newSeconds <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return { seconds: 0, isRunning: false, isComplete: true };
          }
          return { ...prev, seconds: newSeconds };
        });
      }, 1000);
    }
  }, [state.seconds, state.isRunning, mergedConfig.alertAt, playAlert]);

  const reset = useCallback(
    (seconds?: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState({
        seconds: seconds ?? mergedConfig.defaultSeconds,
        isRunning: false,
        isComplete: false,
      });
    },
    [mergedConfig.defaultSeconds],
  );

  const addTime = useCallback((seconds: number) => {
    setState((prev) => ({ ...prev, seconds: prev.seconds + seconds }));
  }, []);

  const formatTime = useCallback((secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}:${remainSecs.toString().padStart(2, "0")}`;
  }, []);

  return {
    ...state,
    formatted: formatTime(state.seconds),
    start,
    pause,
    resume,
    reset,
    addTime,
  };
}

// Quick presets for common rest periods
export const REST_PRESETS = {
  short: 60,
  medium: 90,
  long: 120,
  strength: 180,
  powerlifting: 300,
};

'use client';

import { StorageService as Storage } from '@/services/storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'ironforge_reduced_motion';

interface MotionPreference {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}

const MotionContext = createContext<MotionPreference>({
  reducedMotion: false,
  setReducedMotion: () => {},
});

export function MotionPreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reducedMotion, setReducedMotionState] = useState(false);

  useEffect(() => {
    // Check Storage first
    const loadPreference = async () => {
      const stored = await Storage.getItem<string>(STORAGE_KEY);
      if (stored !== null) {
        setReducedMotionState(stored === 'true');
        return;
      }

      // Fall back to system preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotionState(mediaQuery.matches);

      const handler = async (e: MediaQueryListEvent) => {
        const currentStored = await Storage.getItem(STORAGE_KEY);
        if (currentStored === null) {
          setReducedMotionState(e.matches);
        }
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    };
    loadPreference();
  }, []);

  const setReducedMotion = (value: boolean) => {
    Storage.setItem(STORAGE_KEY, String(value));
    setReducedMotionState(value);
  };

  return (
    <MotionContext.Provider value={{ reducedMotion, setReducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(MotionContext);
}

/**
 * Returns animation variants based on reduced motion preference.
 * Use this for conditional animations.
 */
export function useMotionVariants() {
  const { reducedMotion } = useReducedMotion();

  return {
    fadeIn: reducedMotion
      ? { initial: {}, animate: {}, exit: {} }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        },
    slideUp: reducedMotion
      ? { initial: {}, animate: {}, exit: {} }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        },
    scale: reducedMotion
      ? { initial: {}, animate: {}, exit: {} }
      : {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        },
    shake: reducedMotion
      ? {}
      : {
          x: [-5, 5, -5, 5, 0],
          transition: { duration: 0.3 },
        },
  };
}

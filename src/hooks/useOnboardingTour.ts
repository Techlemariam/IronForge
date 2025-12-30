"use client";

import { useState, useCallback, useEffect } from "react";

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
  action?: () => void;
  requiredAction?: string;
}

interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  onComplete?: () => void;
}

const MAIN_TOUR: TourConfig = {
  id: "main-onboarding",
  name: "Welcome to IronForge!",
  steps: [
    {
      id: "welcome",
      target: '[data-tour="dashboard"]',
      title: "Welcome, Titan!",
      content:
        "This is your command center. Here you can see your progress, quests, and Titan status.",
      placement: "bottom",
    },
    {
      id: "titan-status",
      target: '[data-tour="titan-card"]',
      title: "Your Titan",
      content:
        "This is your Titan avatar. It grows stronger as you train in the real world!",
      placement: "right",
    },
    {
      id: "workout",
      target: '[data-tour="start-workout"]',
      title: "Start Training",
      content:
        "Tap here to begin logging your workout. Every set earns XP for your Titan.",
      placement: "bottom",
    },
    {
      id: "combat",
      target: '[data-tour="combat"]',
      title: "Enter Combat",
      content:
        "Fight monsters and bosses in the Iron Mines. Your fitness data powers your attacks!",
      placement: "left",
    },
    {
      id: "quests",
      target: '[data-tour="quests"]',
      title: "Daily Quests",
      content:
        "Complete daily quests for bonus XP and rewards. New quests appear every day!",
      placement: "top",
    },
    {
      id: "guild",
      target: '[data-tour="guild"]',
      title: "Join a Guild",
      content:
        "Team up with other Titans for group challenges and shared rewards.",
      placement: "right",
    },
  ],
};

const STORAGE_KEY = "ironforge_completed_tours";

/**
 * Hook for managing onboarding tours.
 */
export function useOnboardingTour(tourConfig: TourConfig = MAIN_TOUR) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);

  useEffect(() => {
    // Load completed tours from storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompletedTours(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading tour state:", e);
      }
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);

    const updated = [...completedTours, tourConfig.id];
    setCompletedTours(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    tourConfig.onComplete?.();
  }, [completedTours, tourConfig]);

  const nextStep = useCallback(() => {
    if (currentStep < tourConfig.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, tourConfig.steps.length, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);


  const isTourCompleted = useCallback(
    (tourId: string) => {
      return completedTours.includes(tourId);
    },
    [completedTours],
  );

  const resetTours = useCallback(() => {
    setCompletedTours([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const shouldShowTour = !completedTours.includes(tourConfig.id);
  const currentStepData = tourConfig.steps[currentStep];
  const totalSteps = tourConfig.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    progress,
    shouldShowTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    isTourCompleted,
    resetTours,
  };
}

/**
 * Get available tours.
 */
export function getAvailableTours(): TourConfig[] {
  return [MAIN_TOUR];
}

"use client";

type HapticPattern =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "warning"
  | "selection";

interface HapticConfig {
  enabled: boolean;
  intensity: "low" | "medium" | "high";
}

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [25],
  heavy: [50],
  success: [10, 50, 10],
  error: [100, 50, 100],
  warning: [50, 30, 50],
  selection: [5],
};

let hapticConfig: HapticConfig = {
  enabled: true,
  intensity: "medium",
};

/**
 * Check if haptic feedback is available.
 */
export function isHapticAvailable(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Configure haptic feedback settings.
 */
export function configureHaptics(config: Partial<HapticConfig>): void {
  hapticConfig = { ...hapticConfig, ...config };
}

/**
 * Get intensity multiplier.
 */
function getIntensityMultiplier(): number {
  switch (hapticConfig.intensity) {
    case "low":
      return 0.5;
    case "high":
      return 1.5;
    default:
      return 1;
  }
}

/**
 * Trigger haptic feedback.
 */
export function triggerHaptic(pattern: HapticPattern = "medium"): boolean {
  if (!hapticConfig.enabled || !isHapticAvailable()) return false;

  try {
    const basePattern = HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.medium;
    const multiplier = getIntensityMultiplier();
    const adjustedPattern = basePattern.map((v) => Math.round(v * multiplier));

    return navigator.vibrate(adjustedPattern);
  } catch (error) {
    console.warn("Haptic feedback failed:", error);
    return false;
  }
}

/**
 * Haptic for button press.
 */
export function hapticPress(): boolean {
  return triggerHaptic("light");
}

/**
 * Haptic for successful action.
 */
export function hapticSuccess(): boolean {
  return triggerHaptic("success");
}

/**
 * Haptic for error/invalid action.
 */
export function hapticError(): boolean {
  return triggerHaptic("error");
}

/**
 * Haptic for warning.
 */
export function hapticWarning(): boolean {
  return triggerHaptic("warning");
}

/**
 * Haptic for selection change.
 */
export function hapticSelection(): boolean {
  return triggerHaptic("selection");
}

/**
 * Cancel any ongoing haptic feedback.
 */
export function cancelHaptic(): void {
  if (isHapticAvailable()) {
    navigator.vibrate(0);
  }
}

/**
 * React hook for haptic feedback.
 */
export function useHaptic() {
  return {
    isAvailable: isHapticAvailable(),
    trigger: triggerHaptic,
    press: hapticPress,
    success: hapticSuccess,
    error: hapticError,
    warning: hapticWarning,
    selection: hapticSelection,
    cancel: cancelHaptic,
    configure: configureHaptics,
  };
}

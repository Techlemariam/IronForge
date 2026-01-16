import { useCallback } from "react";

// Types of impact defined in Codex
type ImpactLevel = "light" | "heavy" | "warning" | "success";

const HAPTIC_PATTERNS: Record<ImpactLevel, number | number[]> = {
    light: 10,       // "Sharp, short tick"
    heavy: 50,       // "Deep, resonant thud"
    warning: [30, 50, 30], // "Double rapid pulse"
    success: [50, 50, 100], // "Ascending ripple" (approx)
};

export const useHaptic = () => {

    const trigger = useCallback((level: ImpactLevel = "light") => {
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
            try {
                window.navigator.vibrate(HAPTIC_PATTERNS[level]);
            } catch {
                // Devices that don't support vibration will just ignore
            }
        }
    }, []);

    return { trigger };
};

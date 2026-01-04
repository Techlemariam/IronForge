"use client";

import { useState, useEffect } from "react";

export type PlatformContext = "desktop" | "mobile-web" | "pwa" | "tv";

/**
 * Detects the current platform context based on device characteristics.
 * Uses the logic defined in docs/PLATFORM_MATRIX.md
 */
export function usePlatformContext(): PlatformContext {
    const [platform, setPlatform] = useState<PlatformContext>("desktop");

    useEffect(() => {
        const detectPlatform = (): PlatformContext => {
            if (typeof window === "undefined") return "desktop";

            const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isLargeScreen = window.innerWidth >= 1280;
            const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

            // PWA installed on mobile
            if (isStandalone && !isLargeScreen) return "pwa";

            // Large screen with touch = likely TV mode
            if (isLargeScreen && isTouchDevice) return "tv";

            // Large screen without touch = desktop
            if (isLargeScreen && !isTouchDevice) return "desktop";

            // Small screen = mobile web
            return "mobile-web";
        };

        setPlatform(detectPlatform());

        const handleResize = () => setPlatform(detectPlatform());
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return platform;
}

/**
 * Check if running as installed PWA
 */
export function useIsPwa(): boolean {
    const [isPwa, setIsPwa] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsPwa(window.matchMedia("(display-mode: standalone)").matches);
        }
    }, []);

    return isPwa;
}

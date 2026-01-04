"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallState {
    isInstallable: boolean;
    isInstalled: boolean;
    promptInstall: () => Promise<boolean>;
}

/**
 * Hook to manage PWA install prompt.
 * Captures the beforeinstallprompt event and provides a function to trigger install.
 */
export function usePwaInstall(): PwaInstallState {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if already installed
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        setIsInstalled(isStandalone);

        // Capture the install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        // Listen for successful install
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setIsInstalled(true);
                setDeferredPrompt(null);
                return true;
            }
        } catch (error) {
            console.error("PWA install prompt failed:", error);
        }

        return false;
    }, [deferredPrompt]);

    return {
        isInstallable: !!deferredPrompt && !isInstalled,
        isInstalled,
        promptInstall
    };
}

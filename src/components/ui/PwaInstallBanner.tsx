"use client";

import { usePwaInstall } from "@/hooks/usePwaInstall";
import { usePlatformContext } from "@/hooks/usePlatformContext";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PWA Install Banner
 * Shows on mobile web when install is available.
 * Helps drive retention by encouraging app installation.
 */
export function PwaInstallBanner() {
    const { isInstallable, promptInstall } = usePwaInstall();
    const platform = usePlatformContext();
    const [dismissed, setDismissed] = useState(false);

    // Only show on mobile web when installable and not dismissed
    const shouldShow = isInstallable && platform === "mobile-web" && !dismissed;

    const handleInstall = async () => {
        const success = await promptInstall();
        if (!success) {
            // User dismissed, hide the banner
            setDismissed(true);
        }
    };

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Download className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-white text-sm">Install IronForge</h3>
                                <p className="text-white/70 text-xs">Get the full experience with offline access</p>
                            </div>

                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-white text-indigo-600 font-bold text-sm rounded-xl hover:bg-white/90 transition-colors"
                            >
                                Install
                            </button>

                            <button
                                onClick={() => setDismissed(true)}
                                className="p-2 text-white/60 hover:text-white transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

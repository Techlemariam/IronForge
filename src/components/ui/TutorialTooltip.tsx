"use client";

import React, { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

interface TutorialTooltipProps {
    id: string; // Unique identifier for this tooltip
    title: string;
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    children: React.ReactNode;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
    id,
    title,
    content,
    position = "top",
    children,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user has dismissed this tooltip before
        const dismissedTooltips = localStorage.getItem("dismissedTooltips");
        if (dismissedTooltips) {
            const dismissed = JSON.parse(dismissedTooltips);
            if (dismissed.includes(id)) {
                setIsDismissed(true);
            }
        }
    }, [id]);

    const handleDismiss = () => {
        setIsVisible(false);

        // Save to localStorage
        const dismissedTooltips = localStorage.getItem("dismissedTooltips");
        const dismissed = dismissedTooltips ? JSON.parse(dismissedTooltips) : [];

        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem("dismissedTooltips", JSON.stringify(dismissed));
        }

        setIsDismissed(true);
    };

    if (isDismissed) {
        return <>{children}</>;
    }

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    return (
        <div className="relative inline-block group">
            {children}

            {/* Info Icon Trigger */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-600 transition-colors z-10"
                aria-label={`Show tutorial for ${title}`}
            >
                <Info className="w-3 h-3" />
            </button>

            {/* Tooltip */}
            {isVisible && (
                <div
                    className={`absolute ${positionClasses[position]} w-64 bg-zinc-900 border border-blue-500/30 rounded-lg shadow-2xl z-50 animate-fade-in`}
                >
                    {/* Arrow */}
                    <div
                        className={`absolute w-3 h-3 bg-zinc-900 border-blue-500/30 rotate-45 ${position === "top"
                                ? "bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r"
                                : position === "bottom"
                                    ? "top-[-6px] left-1/2 -translate-x-1/2 border-t border-l"
                                    : position === "left"
                                        ? "right-[-6px] top-1/2 -translate-y-1/2 border-r border-t"
                                        : "left-[-6px] top-1/2 -translate-y-1/2 border-l border-b"
                            }`}
                    />

                    <div className="relative p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                {title}
                            </h4>
                            <button
                                onClick={handleDismiss}
                                className="text-zinc-500 hover:text-white transition-colors"
                                aria-label="Dismiss tooltip"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <p className="text-xs text-zinc-300 leading-relaxed mb-3">{content}</p>

                        {/* Dismiss Forever Button */}
                        <button
                            onClick={handleDismiss}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors"
                        >
                            Got it, don't show again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

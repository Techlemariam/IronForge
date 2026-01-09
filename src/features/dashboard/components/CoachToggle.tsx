import React from "react";
import { playSound } from "@/utils";
import { Mic } from "lucide-react";

export const CoachToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={() => {
            playSound("ui_click");
            onClick();
        }}
        className="fixed bottom-6 right-6 z-40 bg-purple-900 border-2 border-purple-500 rounded-full p-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform group"
        aria-label="Open AI Coach"
    >
        <Mic className="w-6 h-6 text-white group-hover:animate-pulse" />
    </button>
);

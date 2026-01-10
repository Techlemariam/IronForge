// src/components/ui/DemoVideoModal.tsx
"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, PlayCircle } from "lucide-react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

interface DemoVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string; // e.g. YouTube URL
    exerciseName: string;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
    isOpen,
    onClose,
    videoUrl,
    exerciseName,
}) => {
    const [isPlaying, setIsPlaying] = useState(true);

    // Fallback if no URL
    const displayUrl = videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Default Rick Roll for demo ;) or placeholder

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-white/10 sm:max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="p-4 bg-zinc-900/90 backdrop-blur absolute top-0 left-0 right-0 z-10 border-b border-white/5">
                    <DialogTitle className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-magma" />
                        <span className="text-white">{exerciseName} Demo</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="relative aspect-video bg-black pt-14 sm:pt-0">
                    {/* Player wrapper */}
                    <div className="absolute inset-0 top-[57px] sm:top-0">
                        <ReactPlayer
                            url={displayUrl}
                            width="100%"
                            height="100%"
                            playing={isPlaying}
                            controls={true}
                            light={false} // Load immediately for smoother exp
                            fallback={
                                <div className="flex items-center justify-center h-full w-full bg-zinc-900">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                                </div>
                            }
                        />
                    </div>

                    {/* Fallback for missing video */}
                    {!videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none">
                            <p className="text-zinc-500 text-sm">Video coming soon</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

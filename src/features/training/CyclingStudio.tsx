'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    X,
    Bike,
    ExternalLink,
    Maximize2,
    Columns,
    PictureInPicture2,
    Play,
    Pause,
    Volume2,
    VolumeX,
    RotateCcw
} from 'lucide-react';

// Dynamic import to avoid SSR issues with react-player
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

interface CyclingStudioProps {
    onClose: () => void;
}

/**
 * Layout modes for the Cycling Studio
 * - split: 50/50 side by side
 * - video-pip: Video fullscreen, Zwift in small PiP (bottom-left)
 * - zwift-pip: Zwift fullscreen, Video in small PiP (bottom-left)
 */
type LayoutMode = 'split' | 'video-pip' | 'zwift-pip';

// Moved outside component to avoid recreation
const LAYOUT_OPTIONS: { mode: LayoutMode; label: string; shortcut: string }[] = [
    { mode: 'split', label: 'Split Screen', shortcut: '1' },
    { mode: 'video-pip', label: 'Video + Zwift PiP', shortcut: '2' },
    { mode: 'zwift-pip', label: 'Zwift + Video PiP', shortcut: '3' },
];

const LAYOUT_ICONS: Record<LayoutMode, React.ReactNode> = {
    'split': <Columns className="w-4 h-4" />,
    'video-pip': <PictureInPicture2 className="w-4 h-4" />,
    'zwift-pip': <PictureInPicture2 className="w-4 h-4 rotate-180" />,
};

// Storage keys
const STORAGE_KEYS = {
    VIDEO_URL: 'cycling_studio_video_url',
    LAYOUT: 'cycling_studio_layout',
} as const;

export default function CyclingStudio({ onClose }: CyclingStudioProps) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
    const [videoUrl, setVideoUrl] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedUrl = localStorage.getItem(STORAGE_KEYS.VIDEO_URL);
            const savedLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT) as LayoutMode | null;

            if (savedUrl) {
                setInputUrl(savedUrl);
                setVideoUrl(savedUrl);
            }
            if (savedLayout && ['split', 'video-pip', 'zwift-pip'].includes(savedLayout)) {
                setLayoutMode(savedLayout);
            }
        } catch (e) {
            console.warn('Failed to load cycling studio settings:', e);
        }
    }, []);

    // Persist videoUrl to localStorage
    useEffect(() => {
        if (videoUrl) {
            try {
                localStorage.setItem(STORAGE_KEYS.VIDEO_URL, videoUrl);
            } catch (e) {
                console.warn('Failed to save video URL:', e);
            }
        }
    }, [videoUrl]);

    // Persist layout to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.LAYOUT, layoutMode);
        } catch (e) {
            console.warn('Failed to save layout:', e);
        }
    }, [layoutMode]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    setIsPlaying(p => !p);
                    break;
                case 'KeyM':
                    setIsMuted(m => !m);
                    break;
                case 'Digit1':
                case 'Numpad1':
                    setLayoutMode('split');
                    break;
                case 'Digit2':
                case 'Numpad2':
                    setLayoutMode('video-pip');
                    break;
                case 'Digit3':
                case 'Numpad3':
                    setLayoutMode('zwift-pip');
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleLoadVideo = useCallback(() => {
        const trimmed = inputUrl.trim();
        if (!trimmed) return;

        // Basic validation for YouTube URLs
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (youtubeRegex.test(trimmed) || trimmed.includes('.mp4') || trimmed.includes('.webm')) {
            setVideoUrl(trimmed);
        } else {
            // Try anyway - react-player supports many sources
            setVideoUrl(trimmed);
        }
    }, [inputUrl]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLoadVideo();
        }
    };

    const openZwift = useCallback(() => {
        window.open('https://www.zwift.com/launch', '_blank', 'noopener,noreferrer');
    }, []);

    const openZwiftCompanion = useCallback(() => {
        window.open('https://companion.zwift.com', '_blank', 'noopener,noreferrer');
    }, []);

    // Memoized class calculations
    const videoClasses = useMemo(() => {
        const base = 'bg-black flex items-center justify-center transition-all duration-300';
        switch (layoutMode) {
            case 'split':
                return `${base} w-1/2 h-full`;
            case 'video-pip':
                return `${base} w-full h-full`;
            case 'zwift-pip':
                return `${base} absolute bottom-4 left-4 w-80 h-48 z-20 rounded-lg overflow-hidden shadow-2xl border-2 border-cyan-500/50 hover:scale-105 hover:z-30 cursor-pointer`;
            default:
                return `${base} w-1/2 h-full`;
        }
    }, [layoutMode]);

    const zwiftClasses = useMemo(() => {
        const base = 'bg-zinc-900 flex flex-col items-center justify-center transition-all duration-300';
        switch (layoutMode) {
            case 'split':
                return `${base} w-1/2 h-full`;
            case 'video-pip':
                return `${base} absolute bottom-4 left-4 w-80 h-48 z-20 rounded-lg overflow-hidden shadow-2xl border-2 border-orange-500/50 hover:scale-105 hover:z-30 cursor-pointer`;
            case 'zwift-pip':
                return `${base} w-full h-full`;
            default:
                return `${base} w-1/2 h-full`;
        }
    }, [layoutMode]);

    const handleClearVideo = useCallback(() => {
        setVideoUrl('');
        setInputUrl('');
        try {
            localStorage.removeItem(STORAGE_KEYS.VIDEO_URL);
        } catch (e) {
            console.warn('Failed to clear video URL:', e);
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-900/30 to-orange-900/30 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-orange-500 rounded-lg">
                        <Bike className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Cycling Studio</h1>
                        <p className="text-xs text-zinc-400">Video + Zwift Integration</p>
                    </div>
                </div>

                {/* Layout Switcher */}
                <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
                    {LAYOUT_OPTIONS.map(({ mode, label, shortcut }) => (
                        <button
                            key={mode}
                            onClick={() => setLayoutMode(mode)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${layoutMode === mode
                                ? 'bg-gradient-to-r from-cyan-600 to-orange-600 text-white shadow-lg'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                            title={`${label} (${shortcut})`}
                        >
                            {LAYOUT_ICONS[mode]}
                            <span className="hidden md:inline">{label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Close (Esc)"
                >
                    <X className="w-6 h-6" />
                </button>
            </header>

            {/* Video URL Input Bar */}
            <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border-b border-zinc-800">
                <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste YouTube URL or video link..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                />
                <button
                    onClick={handleLoadVideo}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                    <Play className="w-4 h-4" />
                    Load
                </button>

                {/* Playback Controls */}
                {videoUrl && (
                    <div className="flex items-center gap-1 border-l border-zinc-700 pl-3">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            title={`${isPlaying ? 'Pause' : 'Play'} (Space)`}
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            title={`${isMuted ? 'Unmute' : 'Mute'} (M)`}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleClearVideo}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Clear Video"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex overflow-hidden">
                {/* Video Panel */}
                <div
                    className={videoClasses}
                    onClick={layoutMode === 'zwift-pip' ? () => setLayoutMode('video-pip') : undefined}
                >
                    {videoUrl ? (
                        <ReactPlayer
                            url={videoUrl}
                            playing={isPlaying}
                            muted={isMuted}
                            controls
                            width="100%"
                            height="100%"
                            style={{ position: 'absolute', top: 0, left: 0 }}
                            config={{
                                youtube: {
                                    playerVars: { modestbranding: 1 }
                                }
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-600 p-8">
                            <Play className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg font-medium mb-2">No Video Loaded</p>
                            <p className="text-sm text-zinc-500 text-center max-w-xs">
                                Paste a YouTube URL or video link above to start your cycling session
                            </p>
                        </div>
                    )}
                </div>

                {/* Zwift Panel */}
                <div
                    className={zwiftClasses}
                    onClick={layoutMode === 'video-pip' ? () => setLayoutMode('zwift-pip') : undefined}
                >
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        {/* Zwift Logo Placeholder */}
                        <div className="w-20 h-20 mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="text-3xl font-black text-white">Z</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Zwift</h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-xs">
                            Launch Zwift in a separate window for the best cycling experience
                        </p>

                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <button
                                onClick={openZwift}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-500/20"
                            >
                                <Maximize2 className="w-5 h-5" />
                                Launch Zwift
                            </button>

                            <button
                                onClick={openZwiftCompanion}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-all border border-zinc-700"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Zwift Companion
                            </button>
                        </div>

                        {layoutMode !== 'split' && (
                            <p className="text-xs text-zinc-500 mt-4">
                                Tip: Click PiP to expand • Use 1/2/3 to switch layouts
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Status Bar */}
            <footer className="flex items-center justify-between px-6 py-2 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                    <span>Layout: <span className="text-zinc-300">{LAYOUT_OPTIONS.find(l => l.mode === layoutMode)?.label}</span></span>
                    {videoUrl && <span>Video: <span className="text-cyan-400 truncate max-w-xs">{videoUrl}</span></span>}
                </div>
                <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Space</kbd>
                    <span className="text-zinc-600">Play/Pause</span>
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 ml-2">M</kbd>
                    <span className="text-zinc-600">Mute</span>
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 ml-2">1-3</kbd>
                    <span className="text-zinc-600">Layout</span>
                </div>
            </footer>
        </div>
    );
}


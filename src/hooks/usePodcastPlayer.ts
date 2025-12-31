"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PocketCastsEpisode } from "@/services/pocketcasts";

export function usePodcastPlayer(playlist: PocketCastsEpisode[]) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0); // 0-100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const currentTrack = playlist[currentTrackIndex] || null;

    const play = useCallback(() => {
        audioRef.current?.play();
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const skip = useCallback((seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds;
        }
    }, []);

    const nextTrack = useCallback(() => {
        if (currentTrackIndex < playlist.length - 1) {
            setCurrentTrackIndex((prev) => prev + 1);
        }
    }, [currentTrackIndex, playlist.length]);

    const prevTrack = useCallback(() => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex((prev) => prev - 1);
        }
    }, [currentTrackIndex]);

    const seek = useCallback((position: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = position;
        }
    }, []);

    // Initialize audio element
    useEffect(() => {
        if (typeof window === "undefined") return;
        audioRef.current = new Audio();

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            nextTrack();
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
            audio.pause();
        };
    }, [nextTrack]);

    // Sync with current track
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        const isSameTrack = audio.src === currentTrack.url;
        if (!isSameTrack) {
            audio.src = currentTrack.url;
            if (currentTrack.playing_status > 0) {
                audio.currentTime = currentTrack.playing_status;
            }
        }

        if (isPlaying) {
            audio.play().catch((e) => console.error("[Playback Error]:", e));
        }

        // Media Session API
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.podcast_title || "Pocket Casts",
                artwork: [
                    {
                        src: currentTrack.thumbnail_url || currentTrack.folder_url || "",
                        sizes: "512x512",
                        type: "image/jpeg",
                    },
                ],
            });

            navigator.mediaSession.setActionHandler("play", play);
            navigator.mediaSession.setActionHandler("pause", pause);
            navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
            navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
            navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
            navigator.mediaSession.setActionHandler("seekforward", () => skip(30));
        }
    }, [currentTrack, isPlaying, play, pause, prevTrack, nextTrack, skip]);

    const syncProgress = useCallback(async (episodeId: string, podcastId: string, position: number) => {
        try {
            await fetch("/api/podcast", {
                method: "POST",
                body: JSON.stringify({
                    episodeId,
                    podcastId,
                    position: Math.floor(position),
                    status: 1, // playing
                }),
            });
        } catch (e) {
            console.error("[Sync Error]:", e);
        }
    }, []);

    // Sync remote progress (Debounced)
    useEffect(() => {
        if (!currentTrack || !isPlaying) return;

        const timer = setInterval(() => {
            if (audioRef.current) {
                syncProgress(currentTrack.uuid, currentTrack.podcast_uuid, audioRef.current.currentTime);
            }
        }, 30000); // Sync every 30s

        return () => clearInterval(timer);
    }, [currentTrack, isPlaying, syncProgress]);


    return {
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        play,
        pause,
        skip,
        nextTrack,
        prevTrack,
        seek,
        setCurrentTrackIndex
    };
}

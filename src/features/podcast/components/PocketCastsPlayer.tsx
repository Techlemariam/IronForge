"use client";

import { useEffect, useState, useCallback } from "react";
import { usePodcastPlayer } from "@/features/podcast/hooks/usePodcastPlayer";
import { PocketCastsEpisode } from "@/services/pocketcasts";
import { Play, Pause, SkipForward, SkipBack, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastBrowser } from "./PodcastBrowser";

export function PocketCastsPlayer() {
    const [queue, setQueue] = useState<PocketCastsEpisode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        play,
        pause,
        skip,
        nextTrack: _nextTrack,
        prevTrack: _prevTrack,
        seek,
        setCurrentTrackIndex
    } = usePodcastPlayer(queue);

    const fetchQueue = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/podcast?type=queue");
            if (!res.ok) throw new Error("Failed to fetch queue");
            const data = await res.json();
            setQueue(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const handlePlayEpisode = (episode: PocketCastsEpisode) => {
        // Prepend to queue and play
        setQueue((prev) => [episode, ...prev]);
        setCurrentTrackIndex(0);
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || queue.length === 0) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 text-center text-muted-foreground">
                    {error || "No podcasts in your queue. Add some in Pocket Casts!"}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <Tabs defaultValue="player" className="w-full">
                <TabsList className="w-full bg-zinc-950/50 rounded-none border-b border-zinc-800">
                    <TabsTrigger value="player" className="flex-1">Player</TabsTrigger>
                    <TabsTrigger value="browse" className="flex-1">Browse</TabsTrigger>
                </TabsList>

                <TabsContent value="player" className="m-0">
                    <CardContent className="p-0">
                        {(!queue.length && !error) ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                No episodes queued. Use the Browse tab to find podcasts.
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center p-4 gap-4">
                                    <Image
                                        src={currentTrack?.thumbnail_url || currentTrack?.folder_url || "/images/podcast-placeholder.png"}
                                        alt={currentTrack?.title || "Podcast Episode"}
                                        width={64}
                                        height={64}
                                        unoptimized
                                        className="rounded shadow-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white truncate">{currentTrack?.title}</h3>
                                        <p className="text-xs text-zinc-400 truncate">{currentTrack?.podcast_title}</p>
                                    </div>
                                </div>

                                <div className="px-4 pb-2 space-y-1">
                                    <Slider
                                        value={[progress]}
                                        max={100}
                                        step={0.1}
                                        onValueChange={(vals) => seek((vals[0] / 100) * duration)}
                                        className="hover:cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4 pb-6">
                                    <Button variant="ghost" size="icon" onClick={() => skip(-15)} className="text-zinc-400 hover:text-white">
                                        <SkipBack className="h-5 w-5" />
                                    </Button>

                                    <Button
                                        size="icon"
                                        onClick={isPlaying ? pause : play}
                                        className="h-12 w-12 rounded-full bg-white text-black hover:bg-zinc-200"
                                    >
                                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                                    </Button>

                                    <Button variant="ghost" size="icon" onClick={() => skip(30)} className="text-zinc-400 hover:text-white">
                                        <SkipForward className="h-5 w-5" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </TabsContent>

                <TabsContent value="browse" className="m-0">
                    <PodcastBrowser onPlayEpisode={handlePlayEpisode} />
                </TabsContent>
            </Tabs>
        </Card>
    );
}

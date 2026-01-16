"use client";

import { useState, useEffect } from "react";
import { PocketCastsPodcast, PocketCastsEpisode } from "@/services/pocketcasts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface PodcastBrowserProps {
    onPlayEpisode: (episode: PocketCastsEpisode) => void;
}

export function PodcastBrowser({ onPlayEpisode }: PodcastBrowserProps) {
    const [view, setView] = useState<"subscriptions" | "episodes">("subscriptions");
    const [subscriptions, setSubscriptions] = useState<PocketCastsPodcast[]>([]);
    const [selectedPodcast, setSelectedPodcast] = useState<PocketCastsPodcast | null>(null);
    const [episodes, setEpisodes] = useState<PocketCastsEpisode[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/podcast?type=subscriptions");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSubscriptions(data);
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEpisodes = async (podcast: PocketCastsPodcast) => {
        setIsLoading(true);
        setSelectedPodcast(podcast);
        setView("episodes");
        try {
            const res = await fetch(`/api/podcast?type=episodes&uuid=${podcast.uuid}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setEpisodes(data);
        } catch (error) {
            console.error("Failed to fetch episodes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setView("subscriptions");
        setSelectedPodcast(null);
        setEpisodes([]);
    };

    if (isLoading && subscriptions.length === 0) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="h-[400px] flex flex-col">
            {view === "subscriptions" ? (
                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-3 gap-4 p-4">
                        {subscriptions.map(sub => (
                            <button
                                key={sub.uuid}
                                onClick={() => fetchEpisodes(sub)}
                                className="group relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all"
                            >
                                <Image
                                    src={sub.thumbnail_url || "/images/podcast-placeholder.png"}
                                    alt={sub.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    unoptimized
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white truncate">
                                    {sub.title}
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <h3 className="font-bold truncate text-sm">{selectedPodcast?.title}</h3>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-2">
                            {episodes.map(ep => (
                                <div key={ep.uuid} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50 group">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => onPlayEpisode({ ...ep, podcast_title: selectedPodcast?.title })}
                                    >
                                        <Play className="w-4 h-4" />
                                    </Button>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-medium leading-tight">{ep.title}</h4>
                                        <div className="flex gap-2 text-[10px] text-zinc-500 mt-1">
                                            <span>{Math.floor(ep.duration / 60)} min</span>
                                            <span>•</span>
                                            <span>{new Date(ep.published_at || "").toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}

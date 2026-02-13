"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TerritoryCard } from "./TerritoryCard";
import {
    getTerritoriesAction,
    claimTerritoryAction,
    contestTerritoryAction
} from "@/actions/game/territory";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TerritoryMapProps {
    userId: string;
    guildId?: string;
}

export const TerritoryMap: React.FC<TerritoryMapProps> = ({ userId, guildId }) => {
    const [territories, setTerritories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTerritoriesAction();
            setTerritories(data);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to load territory map",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleClaim = async (id: string) => {
        if (!guildId) return;
        setBusyId(id);
        try {
            await claimTerritoryAction(guildId, id, userId);
            toast({ title: "Success", description: "Territory claimed for your guild!" });
            loadData();
        } catch (err: any) {
            toast({
                title: "Claim Failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setBusyId(null);
        }
    };

    const handleContest = async (id: string) => {
        if (!guildId) return;
        setBusyId(id);
        try {
            await contestTerritoryAction(guildId, id, userId);
            toast({ title: "Challenge Issued!", description: "Contest started. Log workouts to win!" });
            loadData();
        } catch (err: any) {
            toast({
                title: "Contest Failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setBusyId(null);
        }
    };

    if (loading && territories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 border border-white/5 rounded-xl">
                <Loader2 className="w-8 h-8 text-magma animate-spin mb-4" />
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Synchronizing Map...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Strategic Map</h2>
                    <p className="text-sm text-zinc-500">Conquer territories to earn guild-wide bonuses.</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    aria-label="Refresh territory data"
                    title="Refresh territory data"
                    className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                >
                    <RefreshCw className={`w-4 h-4 text-zinc-500 group-hover:text-magma ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {territories.map((t) => (
                    <TerritoryCard
                        key={t.id}
                        territory={t}
                        userGuildId={guildId}
                        onClaim={handleClaim}
                        onContest={handleContest}
                        isLoading={busyId === t.id}
                    />
                ))}
            </div>

            {territories.length === 0 && !loading && (
                <div className="text-center py-10 bg-zinc-900 border border-white/5 rounded-xl italic text-zinc-600">
                    The map is currently empty. Discovery in progress...
                </div>
            )}
        </div>
    );
};

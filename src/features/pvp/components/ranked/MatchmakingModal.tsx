"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Swords, User as UserIcon } from "lucide-react";
import { findRankedOpponentAction, RankedOpponent } from "@/actions/pvp/ranked";
import { RankBadge } from "@/components/game/pvp/RankBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MatchmakingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRating: number;
}

export function MatchmakingModal({ isOpen, onClose, currentRating }: MatchmakingModalProps) {
    const [status, setStatus] = useState<"IDLE" | "SEARCHING" | "FOUND" | "STARTING">("IDLE");
    const [opponent, setOpponent] = useState<RankedOpponent | null>(null);
    const router = useRouter();

    const startSearch = async () => {
        setStatus("SEARCHING");
        setOpponent(null);
        try {
            // Simulate partial delay for suspense
            await new Promise(r => setTimeout(r, 1500));

            const found = await findRankedOpponentAction();
            if (found) {
                setOpponent(found);
                setStatus("FOUND");
            } else {
                toast.error("No opponent found in your range. Try again later.");
                setStatus("IDLE");
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Matchmaking failed");
            setStatus("IDLE");
        }
    };

    const acceptMatch = async () => {
        if (!opponent) return;
        setStatus("STARTING");
        toast.success("Match Accepted! Preparing Arena...", { duration: 2000 });

        // Redirect to combat page with opponent ID
        // Note: Assuming /combat/[opponentId] route exists or similar
        setTimeout(() => {
            router.push(`/combat/ranked/${opponent.userId}`);
        }, 1000);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && status === "SEARCHING") return; // Prevent closing while searching
        onClose();
        if (!open) {
            // Reset state after closing
            setTimeout(() => setStatus("IDLE"), 300);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl uppercase font-black tracking-widest text-amber-500">
                        {status === "IDLE" ? "Ranked Queue" :
                            status === "SEARCHING" ? "Searching..." :
                                status === "FOUND" ? "Opponent Found!" : "Entering Arena"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Current Rating: <span className="text-white font-mono">{currentRating} SR</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-8 flex flex-col items-center justify-center min-h-[200px]">
                    {status === "IDLE" && (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center mx-auto">
                                <Swords className="w-10 h-10 text-zinc-600" />
                            </div>
                            <p className="text-zinc-400">Find a worthy opponent within ±200 SR.</p>
                        </div>
                    )}

                    {status === "SEARCHING" && (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                            <p className="text-amber-500 font-bold tracking-widest uppercase text-sm">Scanning Iron Network</p>
                        </div>
                    )}

                    {(status === "FOUND" || status === "STARTING") && opponent && (
                        <div className="w-full space-y-6 animate-in zoom-in-90 duration-300">
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="w-24 h-24 border-4 border-amber-500 shadow-xl shadow-amber-900/20">
                                    <AvatarImage src={opponent.image || undefined} />
                                    <AvatarFallback className="bg-zinc-800 text-2xl font-bold">
                                        {opponent.name?.substring(0, 2).toUpperCase() || "OP"}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-2xl font-bold text-white mt-2">{opponent.name || "Unknown Warrior"}</h3>
                                <RankBadge rating={opponent.rating} faction="HORDE" />
                            </div>

                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-center">
                                <span className="text-xs uppercase tracking-widest text-zinc-500">Class</span>
                                <div className="font-bold text-zinc-300">{opponent.className || "Titan"}</div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    {status === "IDLE" && (
                        <Button size="lg" onClick={startSearch} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest">
                            Find Match
                        </Button>
                    )}

                    {status === "FOUND" && (
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button variant="outline" onClick={onClose} className="border-red-900 text-red-500 hover:bg-red-950/50 hover:text-red-400">
                                Decline
                            </Button>
                            <Button onClick={acceptMatch} className="bg-green-600 hover:bg-green-500 text-white font-bold uppercase shadow-lg shadow-green-900/20 animate-pulse">
                                Accept Duel
                            </Button>
                        </div>
                    )}

                    {status === "STARTING" && (
                        <Button disabled className="w-full bg-amber-600/50 text-white opacity-100">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Arena...
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

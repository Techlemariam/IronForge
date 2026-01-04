"use client";

import { TerritoryWithControl } from "@/actions/territories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Shield, Trophy, Zap, Coins } from "lucide-react";

interface TerritoryCardProps {
    territory: TerritoryWithControl;
    userGuildId: string | null;
    onClick?: () => void;
}

export const TerritoryCard = ({ territory, userGuildId, onClick }: TerritoryCardProps) => {
    const isControlled = !!territory.controlledBy;
    const isMyGuild = isControlled && territory.controlledBy?.id === userGuildId;

    const getTypeIcon = () => {
        switch (territory.type) {
            case "TRAINING_GROUNDS": return <Trophy className="w-5 h-5 text-amber-500" />;
            case "RESOURCE_NODE": return <Coins className="w-5 h-5 text-emerald-500" />;
            case "FORTRESS": return <Shield className="w-5 h-5 text-slate-400" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
        >
            <Card className={cn(
                "w-[260px] bg-zinc-950/90 border backdrop-blur-md overflow-hidden relative group cursor-pointer transition-colors shadow-2xl",
                isMyGuild
                    ? "border-emerald-500/50 shadow-emerald-900/20"
                    : isControlled
                        ? "border-red-500/50 shadow-red-900/20"
                        : "border-zinc-800 hover:border-zinc-600"
            )}>
                {/* Header Image/Gradient */}
                <div className={cn(
                    "h-20 w-full bg-gradient-to-br relative",
                    territory.type === "FORTRESS" ? "from-slate-900 via-zinc-900 to-black" :
                        territory.type === "RESOURCE_NODE" ? "from-emerald-950 via-zinc-900 to-black" :
                            "from-amber-950 via-zinc-900 to-black"
                )}>
                    <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-black/60 backdrop-blur border-white/10 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                            {territory.region}
                        </Badge>
                    </div>

                    <div className={cn(
                        "absolute -bottom-5 left-4 border-4 border-zinc-950 rounded-full bg-zinc-900 p-2 shadow-xl",
                        isMyGuild ? "ring-2 ring-emerald-500/50" : isControlled ? "ring-2 ring-red-500/50" : ""
                    )}>
                        {getTypeIcon()}
                    </div>
                </div>

                <div className="pt-6 px-4 pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="pr-2">
                            <h3 className="font-black text-base text-white leading-tight uppercase tracking-wide">{territory.name}</h3>
                            <p className="text-zinc-500 text-[10px] font-mono mt-0.5">{territory.type.replace("_", " ")}</p>
                        </div>
                    </div>

                    {isControlled ? (
                        <div className="mb-3 p-2 rounded bg-white/5 border border-white/5">
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Controlled By</div>
                            <div className={cn("font-bold text-xs truncate", isMyGuild ? "text-emerald-400" : "text-red-400")}>
                                [{territory.controlledBy?.tag}] {territory.controlledBy?.name}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-3 p-2 rounded bg-white/5 border border-dashed border-white/10 text-center">
                            <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Unclaimed Territory</div>
                        </div>
                    )}

                    <div className="flex gap-1.5 flex-wrap">
                        {territory.bonuses.xpBonus && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] h-5 px-1.5 border-0 rounded-sm">
                                +{(territory.bonuses.xpBonus * 100).toFixed(0)}% XP
                            </Badge>
                        )}
                        {territory.bonuses.goldBonus && (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[10px] h-5 px-1.5 border-0 rounded-sm">
                                +{(territory.bonuses.goldBonus * 100).toFixed(0)}% Gold
                            </Badge>
                        )}
                        {territory.bonuses.defenseBonus && (
                            <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 text-[10px] h-5 px-1.5 border-0 rounded-sm">
                                +{(territory.bonuses.defenseBonus * 100).toFixed(0)}% DEF
                            </Badge>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                        <div className="text-[10px] text-zinc-500 font-mono">
                            {territory.contestProgress ?
                                <span className="text-zinc-300">{territory.contestProgress.entries.length} Guilds</span>
                                : <span>Inactive Zone</span>
                            }
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] uppercase font-bold text-zinc-400 hover:text-white hover:bg-white/5 px-2">
                            Scout
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

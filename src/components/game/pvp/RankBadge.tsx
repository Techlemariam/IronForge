import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Medal, Shield, Swords, Star, Flame, Skull } from "lucide-react";

interface RankBadgeProps {
    rank: string; // BRONZE, SILVER, ...
    rating: number;
    showRating?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function RankBadge({ rank, rating, showRating = true, size = "md", className }: RankBadgeProps) {
    const getRankConfig = (r: string) => {
        switch (r) {
            case "HIGH_WARLORD": return { color: "text-red-500 bg-zinc-950 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]", icon: Skull };
            case "CHAMPION": return { color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: Crown };
            case "DIAMOND": return { color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Star };
            case "PLATINUM": return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Shield };
            case "GOLD": return { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Medal };
            case "SILVER": return { color: "text-zinc-300 bg-zinc-300/10 border-zinc-300/20", icon: Shield };
            default: return { color: "text-amber-700 bg-amber-700/10 border-amber-700/20", icon: Swords }; // Bronze
        }
    };

    const config = getRankConfig(rank);
    const Icon = config.icon;

    const sizeClasses = {
        sm: { badge: "h-5 text-[10px] px-1.5", icon: "w-3 h-3 mr-1" },
        md: { badge: "h-6 text-xs px-2", icon: "w-3.5 h-3.5 mr-1.5" },
        lg: { badge: "h-8 text-sm px-3", icon: "w-4 h-4 mr-2" }
    }[size];

    return (
        <Badge variant="outline" className={cn("font-bold uppercase tracking-wider relative overflow-hidden group", config.color, sizeClasses.badge, className)}>
            <Icon className={sizeClasses.icon} />
            <span className="relative z-10">{rank}</span>
            {showRating && <span className="ml-1 opacity-75 relative z-10 font-mono"> {rating}</span>}

            {/* Shine effect for high ranks */}
            {(rank === "DIAMOND" || rank === "CHAMPION" || rank === "HIGH_WARLORD") && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
        </Badge>
    );
}

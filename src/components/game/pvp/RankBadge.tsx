import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPvpRank, getRankTitle, Faction, PVP_RANKS } from "@/lib/pvpRanks";
import {
    Crown, Medal, Shield, Swords, Star, Flame, Skull,
    Target, Axe, Trophy, User, Crosshair, Sword, Users
} from "lucide-react";

interface RankBadgeProps {
    rating: number;
    faction?: Faction;
    showRating?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

// Icon mapping based on rank number (1-14)
const RANK_ICONS = [
    User,       // Rank 1: Private / Scout
    Swords,     // Rank 2: Corporal / Grunt
    Medal,      // Rank 3: Sergeant
    Shield,     // Rank 4: Master Sergeant / Senior Sergeant
    Sword,      // Rank 5: Sergeant Major / First Sergeant
    Shield,     // Rank 6: Knight / Stone Guard
    Flame,      // Rank 7: Knight-Lieutenant / Blood Guard
    Star,       // Rank 8: Knight-Captain / Legionnaire
    Crown,      // Rank 9: Knight-Champion / Centurion
    Trophy,     // Rank 10: Lieutenant Commander / Champion
    Target,     // Rank 11: Commander / Lieutenant General
    Crosshair,  // Rank 12: Marshal / General
    Axe,        // Rank 13: Field Marshal / Warlord
    Skull,      // Rank 14: Grand Marshal / High Warlord
];

// Color themes per rank tier
const getRankColor = (rankNumber: number, faction: Faction): string => {
    // Alliance = Blue theme, Horde = Red theme for top ranks
    const isAlliance = faction === "ALLIANCE";

    if (rankNumber >= 14) {
        // Grand Marshal / High Warlord - Legendary
        return isAlliance
            ? "text-blue-400 bg-blue-950 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            : "text-red-500 bg-zinc-950 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    }
    if (rankNumber >= 13) {
        // Field Marshal / Warlord
        return isAlliance
            ? "text-blue-400 bg-blue-950/50 border-blue-600/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            : "text-red-400 bg-red-950/50 border-red-600/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
    }
    if (rankNumber >= 12) {
        // Marshal / General
        return isAlliance
            ? "text-sky-400 bg-sky-950/40 border-sky-500/40"
            : "text-orange-400 bg-orange-950/40 border-orange-500/40";
    }
    if (rankNumber >= 11) {
        // Commander / Lieutenant General
        return isAlliance
            ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            : "text-orange-500 bg-orange-500/10 border-orange-500/20";
    }
    if (rankNumber >= 10) {
        // Lieutenant Commander / Champion
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    }
    if (rankNumber >= 9) {
        // Knight-Champion / Centurion
        return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    }
    if (rankNumber >= 8) {
        // Knight-Captain / Legionnaire
        return "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20";
    }
    if (rankNumber >= 7) {
        // Knight-Lieutenant / Blood Guard
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
    if (rankNumber >= 6) {
        // Knight / Stone Guard
        return "text-slate-300 bg-slate-500/10 border-slate-500/20";
    }
    if (rankNumber >= 5) {
        // Sergeant Major / First Sergeant
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    }
    if (rankNumber >= 4) {
        // Master Sergeant / Senior Sergeant
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
    if (rankNumber >= 3) {
        // Sergeant
        return "text-amber-500 bg-amber-600/10 border-amber-600/20";
    }
    if (rankNumber >= 2) {
        // Corporal / Grunt
        return "text-amber-600 bg-amber-700/10 border-amber-700/20";
    }
    // Rank 1: Private / Scout
    return "text-zinc-400 bg-zinc-700/20 border-zinc-600/30";
};

export function RankBadge({ rating, faction = "HORDE", showRating = true, size = "md", className }: RankBadgeProps) {
    const pvpRank = getPvpRank(rating);
    const title = getRankTitle(rating, faction);
    const Icon = RANK_ICONS[pvpRank.rank - 1] || User;
    const colorClass = getRankColor(pvpRank.rank, faction);

    const sizeClasses = {
        sm: { badge: "h-5 text-[10px] px-1.5", icon: "w-3 h-3 mr-1" },
        md: { badge: "h-6 text-xs px-2", icon: "w-3.5 h-3.5 mr-1.5" },
        lg: { badge: "h-8 text-sm px-3", icon: "w-4 h-4 mr-2" }
    }[size];

    return (
        <Badge variant="outline" className={cn("font-bold uppercase tracking-wider relative overflow-hidden group", colorClass, sizeClasses.badge, className)}>
            <Icon className={sizeClasses.icon} />
            <span className="relative z-10">{title}</span>
            {showRating && <span className="ml-1 opacity-75 relative z-10 font-mono text-[0.7em]"> {rating}</span>}

            {/* Shine effect for high ranks */}
            {pvpRank.rank >= 13 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
        </Badge>
    );
}

// Export for other components
export { getPvpRank, getRankTitle, getRankProgress, getPointsToNextRank } from "@/lib/pvpRanks";

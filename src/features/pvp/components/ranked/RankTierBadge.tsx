import { Badge } from "@/components/ui/badge";
import { Shield, Crown, Medal, Trophy } from "lucide-react";

interface RankTierBadgeProps {
    rating: number;
    rank: string; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, CHAMPION, HIGH_WARLORD
    showRating?: boolean;
    size?: "sm" | "md" | "lg";
}

export function RankTierBadge({ rating, rank, showRating = true, size = "md" }: RankTierBadgeProps) {
    const getTierInfo = (rankStr: string) => {
        switch (rankStr) {
            case "HIGH_WARLORD": return { color: "bg-red-950 text-red-500 border-red-500", icon: Crown, label: "High Warlord" };
            case "CHAMPION": return { color: "bg-amber-950 text-amber-500 border-amber-500", icon: Trophy, label: "Champion" };
            case "DIAMOND": return { color: "bg-cyan-950 text-cyan-400 border-cyan-400", icon: Shield, label: "Diamond" };
            case "PLATINUM": return { color: "bg-slate-800 text-slate-300 border-slate-300", icon: Shield, label: "Platinum" };
            case "GOLD": return { color: "bg-yellow-950 text-yellow-500 border-yellow-500", icon: Medal, label: "Gold" };
            case "SILVER": return { color: "bg-zinc-800 text-zinc-400 border-zinc-400", icon: Medal, label: "Silver" };
            default: return { color: "bg-orange-950 text-orange-700 border-orange-700", icon: Medal, label: "Bronze" };
        }
    };

    const tier = getTierInfo(rank);
    const Icon = tier.icon;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-2",
    };

    return (
        <div className={`flex items-center gap-2 ${showRating ? "" : "inline-flex"}`}>
            <Badge
                variant="outline"
                className={`${tier.color} ${sizeClasses[size]} font-bold uppercase tracking-wider border-2 flex items-center gap-1.5`}
            >
                <Icon className={size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"} />
                {tier.label}
            </Badge>
            {showRating && (
                <span className={`font-mono font-bold ${size === "lg" ? "text-xl" : "text-sm"} text-zinc-400`}>
                    {rating} SR
                </span>
            )}
        </div>
    );
}

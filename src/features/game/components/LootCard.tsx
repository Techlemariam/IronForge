import React from "react";
import { twMerge } from "tailwind-merge";
// import { useSoundProtocol } from "@/hooks/useSoundProtocol";

export type LootRarity = "common" | "rare" | "legendary" | "artifact";

interface LootCardProps extends React.HTMLAttributes<HTMLDivElement> {
    rarity?: LootRarity;
    children: React.ReactNode;
}

const RARITY_STYLES: Record<LootRarity, string> = {
    common: "border-gray-800 bg-gray-950/50 hover:border-gray-600",
    rare: "border-sky-500/30 bg-sky-950/10 shadow-[0_0_15px_rgba(14,165,233,0.05)] hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]",
    legendary: "border-orange-500/30 bg-orange-950/10 shadow-[0_0_15px_rgba(249,115,22,0.05)] hover:border-orange-400/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]",
    artifact: "border-yellow-500/40 bg-yellow-950/10 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:border-yellow-300/60 hover:shadow-[0_0_30px_rgba(234,179,8,0.25)] animate-pulse-slow",
};

const LootCard: React.FC<LootCardProps> = ({ rarity = "common", children, className, ...props }) => {
    // const { play } = useSoundProtocol();

    // Play sound on mount if legendary/artifact? 
    // For now, simpler interaction could be on hover or click managed by parent.

    return (
        <div
            className={twMerge(
                "relative rounded-lg p-4 border transition-all duration-300 backdrop-blur-sm",
                RARITY_STYLES[rarity],
                className
            )}
            {...props}
        >
            {children}

            {/* Rarity Label Tag */}
            {(rarity === "legendary" || rarity === "artifact") && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-black border border-current rounded text-[10px] font-bold uppercase tracking-widest scale-90">
                    <span className={
                        rarity === "legendary" ? "text-orange-500" : "text-yellow-400"
                    }>{rarity}</span>
                </div>
            )}
        </div>
    );
};

export default LootCard;

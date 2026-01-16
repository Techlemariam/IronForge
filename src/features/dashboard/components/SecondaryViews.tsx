import React from "react";
import { ShimmerBadge } from "@/components/ui/ShimmerBadge";
import { toast } from "@/components/ui/GameToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Image from "next/image";

export const EquipmentArmory: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-6">
        <h2 className="text-4xl font-bold text-magma">Armory Sealed</h2>
        <p className="text-forge-muted">
            The High Blacksmith is out gathering ore.
        </p>
        <ShimmerBadge label="Coming Soon" unlockLevel={5} />
        <button
            onClick={() => toast.info("The Blacksmith will return soon.")}
            className="px-4 py-2 bg-forge-800 rounded border border-forge-border hover:bg-forge-700 transition-colors"
        >
            Notify Me
        </button>
    </div>
);

export const Bestiary: React.FC<{ userLevel: number; onClose: () => void }> = ({
    userLevel: _userLevel,
    onClose,
}) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/arena_bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 text-center space-y-6 max-w-2xl px-4">
            <h2 className="text-5xl font-black text-magma uppercase tracking-tighter">Bestiary Uncharted</h2>
            <div className="relative w-48 h-48 mx-auto opacity-20">
                <Image src="/assets/game/bosses/goblin_king.png" alt="Goblin King" fill className="object-contain grayscale" />
            </div>
            <p className="text-forge-300 text-lg leading-relaxed">
                The creatures of the Iron Forge are lurking in the shadows.
                Complete world map encounters to unlock detailed lore and weaknesses for your foes.
            </p>
            <div className="flex justify-center gap-4">
                <ShimmerBadge label="1/50 Discovered" unlockLevel={1} />
            </div>
        </div>
        <button
            onClick={onClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded text-sm font-bold transition-colors"
        >
            Close
        </button>
    </div>
);

export const WorldMap: React.FC<{
    userLevel: number;
    onClose: () => void;
    onEnterCombat: (bossId: string) => void;
}> = ({ userLevel, onClose, onEnterCombat }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/arena_bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center max-w-4xl space-y-12">
            <div className="space-y-4">
                <h2 className="text-6xl font-black italic text-magma uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,87,34,0.3)]">The Known World</h2>
                <p className="text-xl text-forge-300 font-mono tracking-widest">
                    DISCOVERED REGIONS: 1/12 | LEVEL: {userLevel}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Boss Encounter Card */}
                <div className="bg-zinc-950/80 border border-red-500/30 rounded-2xl p-8 space-y-6 backdrop-blur-md shadow-2xl">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                        <Image src="/assets/game/bosses/goblin_king.png" alt="Goblin King" fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-red-500">The Goblin King</h3>
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] rounded border border-red-500/30 font-black">BOSS</span>
                        </div>
                        <p className="text-sm text-forge-muted">The ruler of the Rusted Throne seeks new victims!</p>
                    </div>
                    <button
                        onClick={() => onEnterCombat("monster_goblin_king")}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-lg text-lg font-black uppercase tracking-widest shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Enter Combat ⚔️
                    </button>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-forge-muted flex items-center justify-center text-forge-muted">?</div>
                    <div>
                        <h4 className="font-bold text-forge-300">Fog of War</h4>
                        <p className="text-xs text-forge-muted">Requires Level 15</p>
                    </div>
                </div>
            </div>
        </div>

        <button
            onClick={onClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded text-sm font-bold transition-colors z-20"
        >
            Close
        </button>
    </div>
);

export const Grimoire: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-6">
        <h2 className="text-4xl font-bold text-magma">Grimoire Sealed</h2>
        <p className="text-forge-muted">The pages are blank...</p>
        <ShimmerBadge label="Lore System" unlockLevel={10} />
        <button
            onClick={onClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded"
        >
            Close
        </button>
    </div>
);

export const Arena: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-6">
        <h2 className="text-4xl font-bold text-magma">Arena Closed</h2>
        <p className="text-forge-muted">Gladiators are resting.</p>
        <ShimmerBadge label="PvP Mode" unlockLevel={15} />
        <button
            onClick={onClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded"
        >
            Close
        </button>
    </div>
);

export const CodexLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-void text-white">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-forge-300">Loading Codex...</p>
    </div>
);

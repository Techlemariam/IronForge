import React from "react";
import { ShimmerBadge } from "@/components/ui/ShimmerBadge";
import { toast } from "@/components/ui/GameToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
    userLevel,
    onClose,
}) => (
    <div className="flex items-center justify-center min-h-screen bg-forge-900 text-white flex-col gap-4">
        <h2 className="text-4xl font-bold text-magma">Bestiary Uncharted</h2>
        <p className="text-forge-muted">
            You have not encountered enough beasts yet.
        </p>
        <button
            onClick={onClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded"
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white p-4">
        <h2 className="text-4xl font-bold text-magma mb-8">The Known World</h2>
        <p className="text-xl text-forge-300 mb-4">
            The fog of war covers these lands. Level: {userLevel}
        </p>
        <button
            onClick={() => onEnterCombat("goblin_king")}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-semibold shadow-lg transition-colors"
        >
            Enter Combat (Goblin King)
        </button>
        <button
            onClick={onClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded"
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
